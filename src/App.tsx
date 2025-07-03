import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuizProvider, useQuiz } from './contexts/QuizContext';
import HomePage from './components/HomePage';
import HostRoom from './components/HostRoom';
import ParticipantRoom from './components/ParticipantRoom';

const queryClient = new QueryClient();

function QuizApp() {
  const { state, dispatch } = useQuiz();

  const handleCreateRoom = () => {
    // Room creation is handled in HomePage
  };

  const handleJoinRoom = () => {
    // Room joining is handled in HomePage
  };

  const handleLeaveRoom = () => {
    dispatch({ type: 'LEAVE_ROOM' });
  };

  // Route logic based on quiz state
  if (!state.roomId) {
    return <HomePage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
  }

  if (state.isHost) {
    return <HostRoom onLeaveRoom={handleLeaveRoom} />;
  }

  return <ParticipantRoom onLeaveRoom={handleLeaveRoom} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <QuizProvider>
        <Toaster />
        <Sonner />
        <QuizApp />
      </QuizProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
