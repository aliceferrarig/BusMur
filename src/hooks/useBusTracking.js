import { useState, useEffect } from "react";

// Dados iniciais padrão para fallback caso o mockData falhe
const INITIAL_BUSES = [
  { id: 1, name: "João Pereira", linha: "001", status: "Em rota", lat: -21.1345, lng: -42.3690 },
  { id: 2, name: "Carlos Mendes", linha: "002", status: "Em rota", lat: -21.1400, lng: -42.3770 },
  { id: 3, name: "Ana Beatriz", linha: "003", status: "Em rota", lat: -21.1280, lng: -42.3620 },
  { id: 4, name: "Roberto Lima", linha: "004", status: "Aguardando", lat: -21.1300, lng: -42.3660 }
];

/**
 * Hook customizado para rastreamento de ônibus em tempo real.
 * @param {boolean} isDriver - Define se o dispositivo atual é o motorista transmitindo o sinal.
 * @param {number} driverBusId - O ID do ônibus que este motorista está pilotando.
 */
export function useBusTracking(isDriver = false, driverBusId = 1) {
  const [buses, setBuses] = useState(INITIAL_BUSES);

  useEffect(() => {
    // CASO 1: DISPOSITIVO DO MOTORISTA (Ativa GPS Real de Alta Precisão)
    if (isDriver) {
      if (!navigator.geolocation) {
        console.error("GPS não é suportado pelo seu navegador ou dispositivo.");
        return;
      }

      const gpsOptions = {
        enableHighAccuracy: true, // FORÇA O USO DO GPS DO HARDWARE (Máxima Precisão)
        timeout: 8000,            // Tempo limite de 8 segundos para obter resposta do satélite
        maximumAge: 0             // Desativa o cache; pega sempre a localização mais recente e limpa
      };

      const successCallback = (position) => {
        const { latitude, longitude, heading, speed } = position.coords;

        setBuses((prevBuses) =>
          prevBuses.map((bus) =>
            bus.id === driverBusId
              ? { 
                  ...bus, 
                  lat: latitude, 
                  lng: longitude, 
                  status: "Em rota",
                  velocidade: speed ? Math.round(speed * 3.6) : 0 // Converte m/s para km/h se disponível
                }
              : bus
          )
        );

        // [PRODUÇÃO] Espaço reservado para enviar os dados para o seu banco de dados (Supabase/Firebase)
        // ex: enviarGpsParaOBanco(driverBusId, latitude, longitude);
      };

      const errorCallback = (error) => {
        console.error(`Erro de GPS (${error.code}): ${error.message}`);
      };

      // Fica escutando ativamente qualquer mudança de posição do motorista
      const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, gpsOptions);

      // Limpa o rastreador quando o componente sai da tela para não gastar a bateria do motorista
      return () => navigator.geolocation.clearWatch(watchId);
    } 
    
    // CASO 2: DISPOSITIVO DO PASSAGEIRO (Visão Geral / Simulação Fluida)
    else {
      const interval = setInterval(() => {
        setBuses((prevBuses) =>
          prevBuses.map((bus) => ({
            ...bus,
            // Simulação sutil de movimento nas ruas de Muriaé
            lat: bus.lat + (Math.random() - 0.5) * 0.0003,
            lng: bus.lng + (Math.random() - 0.5) * 0.0003,
          }))
        );
      }, 3000); // Atualiza a tela a cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [isDriver, driverBusId]);

  return buses;
}