import { Polyline } from "react-leaflet";
import { ROTAS } from "../utils/routeData";

/**
 * Componente para renderizar a linha de uma rota de ônibus específica de forma destacada.
 * @param {string} linha - Código identificador da linha (ex: "001")
 */
export default function RoutePolyline({ linha }) {
  // Busca as coordenadas e configurações dentro do arquivo central de rotas
  const rota = ROTAS[linha];
  
  // Se a linha informada não existir nos dados do sistema, evita quebras e não renderiza nada
  if (!rota || !rota.coordenadas) return null;

  return (
    <Polyline
      positions={rota.coordenadas}
      color={rota.cor || "#1d4ed8"}
      weight={5}
      opacity={0.85}
      dashArray="12 8" // Cria o efeito tracejado profissional de rota recomendada/guia
    />
  );
}