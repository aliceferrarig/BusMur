/**
 * Busca automaticamente o trajeto entre dois bairros de Muriaé pelas ruas reais via API pública
 */
export async function obterRotaAutomatica(origem, destino) {
  try {
    const buscarCoordenadas = async (bairro) => {
      // Força a busca dentro de Muriaé - MG para o mapa não ir parar em outra cidade
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(bairro + ", Muriaé - MG")}`;
      
      const response = await fetch(url, { 
        headers: { "User-Agent": "BusMur-App-V2" } 
      });
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error(`Bairro não localizado: ${bairro}`);
      }
      return { lat: data[0].lat, lon: data[0].lon };
    };

    const pontoA = await buscarCoordenadas(origem);
    const pontoB = await buscarCoordenadas(destino);

    // Conecta com o OSRM para traçar as linhas contornando as ruas reais de Muriaé
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pontoA.lon},${pontoA.lat};${pontoB.lon},${pontoB.lat}?overview=full&geometries=geojson`;
    
    const routeResponse = await fetch(osrmUrl);
    const routeData = await routeResponse.json();

    if (!routeData.routes || routeData.routes.length === 0) {
      return [];
    }

    // Inverte de [lng, lat] para o padrão do Leaflet que é [lat, lng]
    return routeData.routes[0].geometry.coordinates.map(par => [par[1], par[0]]);

  } catch (error) {
    console.error("Falha ao gerar o trajeto dinâmico:", error);
    return [];
  }
}