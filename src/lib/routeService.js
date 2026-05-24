import { PARADAS, LINHAS_CONFIG } from "./routeData";

// Busca o caminho real pelas ruas entre dois pontos
async function buscarSegmento(de, para) {
  const url = `https://router.project-osrm.org/route/v1/driving/${de.lng},${de.lat};${para.lng},${para.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch (e) {
    console.error("Erro OSRM:", e);
  }
  // fallback: linha reta
  return [[de.lat, de.lng], [para.lat, para.lng]];
}

// Percorre todas as paradas da linha e concatena os segmentos
export async function obterRotaAutomatica(idLinha) {
  const linha = LINHAS_CONFIG[idLinha];
  if (!linha) return [];

  let pontosCompletos = [];

  for (let i = 0; i < linha.paradas.length - 1; i++) {
    const de   = PARADAS.find((p) => p.id === linha.paradas[i]);
    const para = PARADAS.find((p) => p.id === linha.paradas[i + 1]);
    if (!de || !para) continue;

    const segmento = await buscarSegmento(de, para);
    // Remove o último ponto para não duplicar na junção com o próximo segmento
    if (i < linha.paradas.length - 2) segmento.pop();
    pontosCompletos = [...pontosCompletos, ...segmento];
  }

  console.log(`🗺️ Rota ${idLinha} — ${linha.nome}`);
  console.log(`📌 Total de pontos OSRM: ${pontosCompletos.length}`);

  return pontosCompletos;
}