import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuizProvider, useQuiz } from './contexts/QuizContext';
import { useToast } from './components/Toast';
import HomePage from './components/HomePage';
import HostRoom from './components/HostRoom';
import ParticipantRoom from './components/ParticipantRoom';

const queryClient = new QueryClient();

function QuizApp() {
  const { clientState, leaveRoom } = useQuiz();
  const { ToastContainer } = useToast();

  // Route logic based on quiz state
  if (!clientState.roomId) {
    return (
      <>
        <HomePage />
        <ToastContainer />
      </>
    );
  }

  if (clientState.isHost) {
    return (
      <>
        <HostRoom />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <ParticipantRoom />
      <ToastContainer />
    </>
  );
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
