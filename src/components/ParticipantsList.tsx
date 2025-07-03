import React from 'react';
import { useQuiz } from '../contexts/QuizContext';

export default function ParticipantsList() {
  const { serverState } = useQuiz();

  return (
    <div className="card-modern animate-scale-in h-fit sticky top-6">
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-gradient-accent">Participantes</span>{' '}
        <span className="text-muted-foreground">({serverState.participants.length})</span>
      </h2>
      
      {serverState.participants.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-xl">👥</span>
          </div>
          <p className="text-muted-foreground font-semibold mb-2">
            Aguardando participantes...
          </p>
          <p className="text-sm text-muted-foreground">
            Compartilhe o código da sala
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {serverState.participants.map((participant, index) => (
            <div 
              key={participant.id} 
              className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl border border-border animate-fade-in transition-[var(--transition-normal)] hover:border-primary/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{participant.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-success font-medium">Online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {serverState.participants.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Status:</span>
            <span className="text-success font-bold">Sala Ativa</span>
          </div>
        </div>
      )}
    </div>
  );
}
