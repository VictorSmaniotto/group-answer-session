import React, { useState } from 'react';
import { useQuiz, generateRoomId, generateParticipantId } from '../contexts/QuizContext';
import { Input } from './ui/input';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl mx-auto mb-8 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">Q</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-primary">Quiz</span>{' '}
            <span className="text-foreground">Interativo</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Perguntas e respostas em tempo real para equipes modernas
          </p>
        </div>

        {/* Action Cards */}
        {!showJoinForm ? (
          <div className="space-y-6 animate-scale-in">
            <button
              onClick={handleCreateRoom}
              className="btn-primary w-full text-xl py-6"
            >
              <span className="text-gradient-secondary font-bold">Criar Nova Sala</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">ou</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowJoinForm(true)}
              className="btn-outline w-full text-xl py-6"
            >
              Entrar em Sala Existente
            </button>
          </div>
        ) : (
          <div className="card-modern animate-slide-up">
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="text-gradient-accent">Entrar na Sala</span>
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-3 text-primary">
                  Código da Sala
                </label>
                <Input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="text-xl py-4 px-6 rounded-2xl border-2 text-center font-mono tracking-wider"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-secondary">
                  Seu Nome
                </label>
                <Input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="João Silva"
                  className="text-xl py-4 px-6 rounded-2xl border-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowJoinForm(false)}
                  className="btn-outline flex-1 py-4"
                >
                  Voltar
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim() || !participantName.trim()}
                  className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="font-semibold">Entrar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in">
          <p className="text-muted-foreground">
            Ferramenta moderna para{' '}
            <span className="text-gradient-primary font-semibold">engajamento de equipes</span>
          </p>
        </div>
      </div>
    </div>
  );
}