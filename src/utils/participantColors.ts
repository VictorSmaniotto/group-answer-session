// Paleta de cores para participantes
const PARTICIPANT_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500', light: 'bg-blue-100', name: 'Azul' },
  { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500', light: 'bg-green-100', name: 'Verde' },
  { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500', light: 'bg-purple-100', name: 'Roxo' },
  { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500', light: 'bg-red-100', name: 'Vermelho' },
  { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500', light: 'bg-yellow-100', name: 'Amarelo' },
  { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500', light: 'bg-pink-100', name: 'Rosa' },
  { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500', light: 'bg-indigo-100', name: 'Índigo' },
  { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-500', light: 'bg-teal-100', name: 'Teal' },
  { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500', light: 'bg-orange-100', name: 'Laranja' },
  { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-500', light: 'bg-cyan-100', name: 'Ciano' },
  { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500', light: 'bg-emerald-100', name: 'Esmeralda' },
  { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-500', light: 'bg-rose-100', name: 'Rosa Escuro' },
];

// Função hash simples para consistência
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Obter cor do participante baseada no ID
export function getParticipantColor(participantId: string) {
  const index = hashString(participantId) % PARTICIPANT_COLORS.length;
  return PARTICIPANT_COLORS[index];
}

// Obter todas as cores disponíveis
export function getAllParticipantColors() {
  return PARTICIPANT_COLORS;
}

// Obter cor do participante por índice (para casos onde você quer cores sequenciais)
export function getParticipantColorByIndex(index: number) {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}
