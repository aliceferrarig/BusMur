// ============================================================
// 📍 PARADAS — adicione novas aqui
// ============================================================
export const PARADAS = [
  { id: 1, nome: "Terminal Central",          lat: -21.1306, lng: -42.3664 },
  { id: 2, nome: "Praça dos Expedicionários", lat: -21.1280, lng: -42.3620 },
  { id: 3, nome: "Hospital São Paulo",         lat: -21.1245, lng: -42.3580 },
  { id: 4, nome: "Colégio Muriaé",             lat: -21.1210, lng: -42.3540 },
  { id: 5, nome: "Shopping Muriaé",            lat: -21.1180, lng: -42.3500 },
  { id: 6, nome: "Terminal Norte",             lat: -21.1121, lng: -42.3458 },
];

// ============================================================
// 🚌 LINHAS — adicione novas aqui, referenciando ids de PARADAS
// ============================================================
export const LINHAS_CONFIG = {
  "001": {
    nome: "Centro → Terminal Norte",
    cor: "#2563eb",
    paradas: [1, 2, 3, 4, 5, 6], // ids em ordem do trajeto
  },
  "002": {
    nome: "Hospital → Shopping",
    cor: "#16a34a",
    paradas: [3, 4, 5],
  },
  "003": {
    nome: "Terminal Central → Shopping",
    cor: "#dc2626",
    paradas: [1, 2, 5, 6],
  },
};