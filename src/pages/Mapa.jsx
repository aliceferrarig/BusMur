import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. DESIGN DE TELEMETRIA (Ícones limpos que não poluem o mapa)
const criarSetaNavegacao = (angulo) => new L.DivIcon({
  html: `
    <div style="transform: rotate(${angulo}deg); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 6px rgba(0,0,0,0.3));">
        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="#2563eb" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  className: "gps-telemetry-arrow",
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const criarPontoParada = (cor) => new L.DivIcon({
  html: `<div style="background-color: ${cor}; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>`,
  className: "gps-station-dot",
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

// 2. MOTOR DE CÂMERA DINÂMICO (Controla o enquadramento reativo do Leaflet)
function GerenciadorCamera({ bounds, posicaoGps, ehMotorista }) {
  const map = useMap();
  const primeiraCargaDaLinha = useRef(true);

  // Força o reenquadramento do mapa apenas quando a rota/linha mudar
  useEffect(() => {
    if (bounds && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
      primeiraCargaDaLinha.current = true;
    }
  }, [bounds, map]);

  // Segue o deslocamento do veículo se o modo motorista estiver ligado
  useEffect(() => {
    if (ehMotorista && posicaoGps) {
      if (primeiraCargaDaLinha.current) {
        map.setView(posicaoGps, 16, { animate: true, duration: 0.8 });
        primeiraCargaDaLinha.current = false;
      } else {
        map.panTo(posicaoGps, { animate: true, duration: 0.5 });
      }
    }
  }, [posicaoGps, ehMotorista, map]);

  return null;
}

export default function Mapa({ rotaSelecionada, ehMotorista = true }) {
  const [traçadoAsfalto, setTraçadoAsfalto] = useState([]);
  const [posicaoSuave, setPosicaoSuave] = useState(null);
  const [anguloDirecao, setAnguloDirecao] = useState(0);
  const [carregandoMalha, setCarregandoMalha] = useState(false);

  const dadosGpsAnigos = useRef({ lat: 0, lng: 0 });
  const frameAnimacaoRef = useRef(null);

  // Valida e memoriza os dados da rota ativa injetados pelo componente pai
  const linhaAtiva = useMemo(() => {
    if (!rotaSelecionada || !rotaSelecionada.inicio || !rotaSelecionada.fim) {
      return {
        nome: "Aguardando seleção de rota...",
        inicio: [-21.1258, -42.3645], // Centro de Muriaé como fallback padrão
        fim: [-21.1258, -42.3645],
        valida: false
      };
    }
    return { ...rotaSelecionada, valida: true };
  }, [rotaSelecionada]);

  const limitesVisao = useMemo(() => {
    return linhaAtiva.valida ? [linhaAtiva.inicio, linhaAtiva.fim] : null;
  }, [linhaAtiva]);

  // 3. ENGINE DE ROTEAMENTO (Consome a API de ruas e gerencia concorrência com AbortController)
  useEffect(() => {
    if (!linhaAtiva.valida) return;

    let abortController = new AbortController();

    async function buscarTraçadoUrbano() {
      try {
        setCarregandoMalha(true);
        const [startLat, startLng] = linhaAtiva.inicio;
        const [endLat, endLng] = linhaAtiva.fim;
        
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
        
        const resposta = await fetch(url, { signal: abortController.signal });
        const dados = await resposta.json();

        if (dados.routes && dados.routes.length > 0) {
          const coordenadasFormatadas = dados.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setTraçadoAsfalto(coordenadasFormatadas);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Falha na requisição da malha viária:", e);
        }
      } finally {
        setCarregandoMalha(false);
      }
    }

    buscarTraçadoUrbano();

    return () => abortController.abort();
  }, [linhaAtiva]);

  // 4. ALGORITMO DE INTERPOLAÇÃO (LERP para suavizar a movimentação do ícone de navegação)
  const processarGeolocalizacao = (latAlvo, lngAlvo) => {
    let frameAtual = 0;
    const framesTotais = 20; 
    const latInic = dadosGpsAnigos.current.lat || latAlvo;
    const lngInic = dadosGpsAnigos.current.lng || lngAlvo;

    if (dadosGpsAnigos.current.lat !== 0) {
      const deltaY = latAlvo - latInic;
      const deltaX = lngAlvo - lngInic;
      if (Math.abs(deltaX) > 0.00001 || Math.abs(deltaY) > 0.00001) {
        const graus = (Math.atan2(deltaX, deltaY) * 180) / Math.PI;
        setAnguloDirecao(graus);
      }
    }

    dadosGpsAnigos.current = { lat: latAlvo, lng: lngAlvo };

    function atualizarCalculoPasso() {
      frameAtual += 1;
      const progressoLinear = frameAtual / framesTotais;
      
      const latInterp = latInic + (latAlvo - latInic) * progressoLinear;
      const lngInterp = lngInic + (lngAlvo - lngInic) * progressoLinear;

      setPosicaoSuave([latInterp, lngInterp]);

      if (frameAtual < framesTotais) {
        frameAnimacaoRef.current = requestAnimationFrame(atualizarCalculoPasso);
      }
    }

    cancelAnimationFrame(frameAnimacaoRef.current);
    frameAnimacaoRef.current = requestAnimationFrame(atualizarCalculoPasso);
  };

  // 5. EVENT WATCHER DO GPS (Acompanha a geolocalização do hardware)
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watcherId = navigator.geolocation.watchPosition(
      (posicao) => {
        const { latitude, longitude, heading } = posicao.coords;
        if (heading !== null && heading !== undefined) {
          setAnguloDirecao(heading);
        }
        processarGeolocalizacao(latitude, longitude);
      },
      (erro) => console.warn("Sinal do satélite GPS oscilando...", erro),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
      cancelAnimationFrame(frameAnimacaoRef.current);
    };
  }, []);

  return (
    <div className="w-full h-[480px] relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-50 font-sans">
      
      {/* HUD SLIM INTEGRADO (Não obstrui o mapa) */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 max-w-xs transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telemetria de Muriaé</span>
        </div>
        <h4 className="font-extrabold text-xs text-slate-900 mt-1 truncate">{linhaAtiva.nome}</h4>
      </div>

      {/* Overlay de Sincronização */}
      {carregandoMalha && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[999] flex items-center justify-center text-xs font-bold text-slate-600 tracking-wide">
          Sincronizando trajetos viários...
        </div>
      )}

      <MapContainer 
        center={linhaAtiva.inicio} 
        zoom={15} 
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <GerenciadorCamera 
          bounds={limitesVisao} 
          posicaoGps={posicaoSuave} 
          ehMotorista={ehMotorista} 
        />

        {/* Polilinha dinâmica renderizada baseada na malha de ruas da API */}
        {linhaAtiva.valida && traçadoAsfalto.length > 0 && (
          <Polyline positions={traçadoAsfalto} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.85, lineJoin: "round" }} />
        )}

        {/* Marcadores Dinâmicos de Extremidade da Linha */}
        {linhaAtiva.valida && (
          <>
            <Marker position={linhaAtiva.inicio} icon={criarPontoParada("#2563eb")}>
              <Popup><span className="text-xs font-bold">Ponto Inicial</span></Popup>
            </Marker>
            <Marker position={linhaAtiva.fim} icon={criarPontoParada("#10b981")}>
              <Popup><span className="text-xs font-bold">Ponto Final</span></Popup>
            </Marker>
          </>
        )}

        {/* Marcador Flutuante com Direção de Movimento do GPS */}
        {posicaoSuave && (
          <Marker position={posicaoSuave} icon={criarSetaNavegacao(anguloDirecao)}>
            <Popup><span className="text-xs font-bold">Sua Localização Exata</span></Popup>
          </Marker>
        )}

        {/* Controles de zoom empurrados para a parte inferior direita */}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}