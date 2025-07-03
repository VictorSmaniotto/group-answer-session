import React, { useState } from 'react';
import { useQuiz, generateRoomId, generateParticipantId } from '../contexts/QuizContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import heroImage from '../assets/quiz-hero.jpg';

interface HomePageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function HomePage({ onCreateRoom, onJoinRoom }: HomePageProps) {
  const { dispatch } = useQuiz();
  const [joinCode, setJoinCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    dispatch({ type: 'CREATE_ROOM', roomId });
    onCreateRoom();
  };

  const handleJoinRoom = () => {
    if (joinCode.trim() && participantName.trim()) {
      const participantId = generateParticipantId();
      dispatch({ 
        type: 'JOIN_ROOM', 
        roomId: joinCode.trim().toUpperCase(), 
        participantName: participantName.trim(),
        participantId 
      });
      onJoinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="w-16 h-16 bg-[var(--gradient-primary)] rounded-2xl mx-auto lg:mx-0 mb-6 flex items-center justify-center text-white text-2xl font-bold">
                Q
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Quiz em 
                <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent"> Tempo Real</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0">
                Crie salas interativas de perguntas e respostas para sua equipe. 
                Engaje, colete insights e tome decisões baseadas em dados reais.
              </p>
            </div>
            
            <div className="animate-scale-in">
              <img 
                src={heroImage} 
                alt="Pessoas participando de quiz em tempo real"
                className="w-full h-auto rounded-2xl shadow-[var(--shadow-strong)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-center p-4 pb-12">
        <div className="max-w-md w-full">
          {!showJoinForm ? (
          <div className="space-y-4 animate-scale-in">
            <button
              onClick={handleCreateRoom}
              className="quiz-button-primary w-full text-lg"
            >
              🏠 Criar Sala
            </button>
            
            <button
              onClick={() => setShowJoinForm(true)}
              className="quiz-button-secondary w-full text-lg"
            >
              🚪 Encontrar Sala
            </button>
          </div>
        ) : (
          <div className="quiz-card p-6 animate-slide-up">
            <h3 className="text-xl font-semibold mb-4 text-center">Entrar na Sala</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Código da Sala</label>
                <Input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  className="rounded-xl"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Seu Nome</label>
                <Input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowJoinForm(false)}
                  className="quiz-button-secondary flex-1"
                >
                  Voltar
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim() || !participantName.trim()}
                  className="quiz-button-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        )}

          <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in">
            <p>💡 Dica: Compartilhe o código da sala com sua equipe!</p>
          </div>
        </div>
      </div>
    </div>
  );
}