import { PARADAS, LINHAS_CONFIG } from "../utils/routeData";

async function buscarSegmento(de, para) {
  const url = `https://router.project-osrm.org/route/v1/driving/${de.lng},${de.lat};${para.lng},${para.lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Erro HTTP OSRM: ${res.status}`);
    }

    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch (error) {
    console.error("Erro ao buscar rota no OSRM:", error);
  }

  return [
    [de.lat, de.lng],
    [para.lat, para.lng],
  ];
}

export async function obterRotaAutomatica(idLinha) {
  const linha = LINHAS_CONFIG[idLinha];

  if (!linha) {
    console.warn(`Linha não encontrada: ${idLinha}`);
    return [];
  }

  let pontosCompletos = [];

  for (let i = 0; i < linha.paradas.length - 1; i++) {
    const de = PARADAS.find((p) => p.id === linha.paradas[i]);
    const para = PARADAS.find((p) => p.id === linha.paradas[i + 1]);

    if (!de || !para) continue;

    const segmento = await buscarSegmento(de, para);

    if (i < linha.paradas.length - 2) {
      segmento.pop();
    }

    pontosCompletos = [...pontosCompletos, ...segmento];
  }

  return pontosCompletos;
}