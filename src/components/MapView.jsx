import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useTheme } from "../contexts/ThemeContext";
import { useBusTracking } from "../hooks/useBusTracking";
import { LINHAS_CONFIG } from "../utils/routeData";
import { obterRotaAutomatica } from "../lib/routeService";
import L from "leaflet";

// Centraliza e ajusta o zoom automaticamente para enquadrar a rota inteira na tela
function AjustarCamera({ coordenadas }) {
  const map = useMap();
  useEffect(() => {
    if (coordenadas && coordenadas.length > 0) {
      const bounds = L.latLngBounds(coordenadas);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [coordenadas, map]);
  return null;
}

export default function MapView({ rotaSelecionada = null, ehMotorista  = false, currentDriverBusId = 1 }) {
  const { theme } = useTheme();
  const [rotaCoordenadas, setRotaCoordenadas] = useState([]);
  const [loadingRota, setLoadingRota] = useState(false);
  
  const buses = useBusTracking(ehMotorista , currentDriverBusId);
  const filteredBuses = rotaSelecionada ? buses.filter(b => b.linha === rotaSelecionada?.idLinha) : buses;

  const centroMuriaePadrao = [-21.1300, -42.3660];

  useEffect(() => {
    if (!rotaSelecionada) { setRotaCoordenadas([]); return; }
    setLoadingRota(true);

    obterRotaAutomatica(rotaSelecionada.inicio, rotaSelecionada.fim).then((coordenadas) => {
      console.log("🗺️ Rota calculada para:", rotaSelecionada.nome);
      console.log("📍 Início:", rotaSelecionada.inicio);
      console.log("📍 Fim:", rotaSelecionada.fim);
      console.log(`📌 Total de pontos: ${coordenadas.length}`);
      console.log("📐 Coordenadas completas:", coordenadas);
      setRotaCoordenadas(coordenadas);
      setLoadingRota(false);
    });
  }, [rotaSelecionada]);

  const tileUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: "450px" }}>
      
      {loadingRota && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs z-[2000] flex items-center justify-center font-semibold text-sm text-gray-700 dark:text-gray-200">
          🔄 Buscando trajeto inteligente por Muriaé...
        </div>
      )}

      <MapContainer center={centroMuriaePadrao} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap" url={tileUrl} />

        <AjustarCamera coordenadas={rotaCoordenadas} />

        {rotaCoordenadas.length > 0 && (
          <Polyline 
            positions={rotaCoordenadas} 
            color={LINHAS_CONFIG[rotaSelecionada?.idLinha]?.cor || "#1d4ed8"}
            weight={6}
            opacity={0.85}
          />
        )}

        {filteredBuses.map((bus) => (
          <Marker 
            key={bus.id} 
            position={[bus.lat, bus.lng]}
            icon={L.divIcon({
              className: 'bus-marker',
              html: `<div style="background-color:${LINHAS_CONFIG[bus.linha]?.cor || '#1d4ed8'};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🚌</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold">Linha {bus.linha} - {LINHAS_CONFIG[bus.linha]?.nome ?? `Linha ${bus.linha}`}</p>
                <p className="text-xs">Motorista: {bus.name}</p>
                <p className="text-xs font-semibold text-green-600">Status: {bus.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}