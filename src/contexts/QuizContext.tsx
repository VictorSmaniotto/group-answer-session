import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { debug } from '../utils/debug';
import usePartySocket from 'partysocket/react';
import type { QuizState, Question, Participant, Answer } from '../../party/server';

// The state managed by the server
type ServerState = QuizState;

// The state managed locally on the client
interface ClientState {
  roomId: string | null;
  isHost: boolean;
  participantName: string | null;
  participantId: string | null; // The client's own connection ID
}

// The combined context value
interface QuizContextValue {
  serverState: ServerState;
  clientState: ClientState;
  setRoom: (roomId: string, isHost: boolean, name?: string) => void;
  leaveRoom: () => void;
  send: (message: object) => void;
  currentQuestion: Question | null;
  hasAnsweredCurrentQuestion: boolean;
  setClientState: React.Dispatch<React.SetStateAction<ClientState>>;
  setServerState: React.Dispatch<React.SetStateAction<ServerState>>;
}

const QuizContext = createContext<QuizContextValue | null>(null);

const initialState: ServerState = {
  questions: [],
  participants: [],
  currentQuestionIndex: -1,
  isQuizStarted: false,
  isQuizFinished: false,
  answers: {},
};

export function QuizProvider({ children }: { children: ReactNode }) {
  const [clientState, setClientState] = useState<ClientState>({
    roomId: null,
    isHost: false,
    participantName: null,
    participantId: null,
  });

  const [serverState, setServerState] = useState<ServerState>(initialState);

  const socket = usePartySocket({
    host: import.meta.env.VITE_PARTYKIT_HOST,
    room: clientState.roomId || 'placeholder',
    onOpen: (e) => {
      // Only proceed if we have a real room ID
      if (!clientState.roomId) return;
      
      debug('Socket connected, event:', e);
      
      // Identify self to the server first, the server will use sender.id as participant ID
      const identifyMessage = { 
        type: 'identify', 
        name: clientState.participantName, 
        isHost: clientState.isHost 
      };
      debug('Sending identify message:', identifyMessage);
      socket.send(JSON.stringify(identifyMessage));
    },
    onMessage: (event) => {
      debug('Received message:', event.data);
      const message = JSON.parse(event.data);
      if (message.type === 'sync') {
        debug('Syncing state:', message.state);
        setServerState(message.state);
        
        // Update participantId based on server state if we're a participant
        if (!clientState.isHost && clientState.participantName && !clientState.participantId) {
          const participant = message.state.participants.find((p: Participant) => p.name === clientState.participantName);
          if (participant) {
            debug('Found participant in server state:', participant.id);
            setClientState(s => ({ ...s, participantId: participant.id }));
          }
        }
      }
      if (message.type === 'error') {
        // You might want to use a toast notification here
        console.error('Server Error:', message.message);
      }
      if (message.type === 'hostDisconnected') {
        debug('Host disconnected. The quiz may be reset.');
        // Optionally, reset client state or show a message
      }
    },
    onError: (error) => {
      console.error('Socket error:', error);
    },
    onClose: (event) => {
      debug('Socket closed:', event);
    }
  });

  const setRoom = useCallback((roomId: string, isHost: boolean, name?: string) => {
    setClientState({ roomId, isHost, participantName: name || null, participantId: null });
  }, []);

  const leaveRoom = useCallback(() => {
    setClientState({ roomId: null, isHost: false, participantName: null, participantId: null });
    setServerState(initialState); // Reset local state on leave
  }, []);

  const send = useCallback((message: object) => {
    socket.send(JSON.stringify(message));
  }, [socket]);

  const currentQuestion =
    serverState.isQuizStarted && serverState.currentQuestionIndex >= 0
      ? serverState.questions[serverState.currentQuestionIndex]
      : null;

  const hasAnsweredCurrentQuestion =
    !!currentQuestion &&
    !!clientState.participantId &&
    !!serverState.answers[currentQuestion.id]?.[clientState.participantId];

  // Debug logging
  useEffect(() => {
    debug('Debug - hasAnsweredCurrentQuestion calculation:', {
      currentQuestion: !!currentQuestion,
      currentQuestionId: currentQuestion?.id,
      participantId: clientState.participantId,
      answers: serverState.answers,
      hasAnswered: hasAnsweredCurrentQuestion
    });
  }, [hasAnsweredCurrentQuestion, currentQuestion, clientState.participantId, serverState.answers]);

  const value = {
    serverState,
    clientState,
    setRoom,
    leaveRoom,
    send,
    currentQuestion,
    hasAnsweredCurrentQuestion,
    setClientState,
    setServerState,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

// Utility functions
export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
}

// Re-export types for convenience in other components
export type { Question, Participant, Answer };
