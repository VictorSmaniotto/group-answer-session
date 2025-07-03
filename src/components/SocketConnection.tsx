import { useEffect } from 'react';
import usePartySocket from 'partysocket/react';
import { useQuiz } from '@/contexts/QuizContext';

// This component handles additional WebSocket functionality if needed
export function SocketConnection() {
  const { clientState } = useQuiz();

  // This component can be used for additional socket logic
  // The main socket logic is now handled in QuizContext itself
  
  return null; // This component does not render anything
}
