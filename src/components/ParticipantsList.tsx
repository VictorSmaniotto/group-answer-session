import React from 'react';
import { useQuiz } from '../contexts/QuizContext';

export default function ParticipantsList() {
  const { state } = useQuiz();

  return (
    <div className="quiz-card p-6 animate-scale-in h-fit sticky top-4">
      <h2 className="text-xl font-semibold mb-4">
        Participantes ({state.participants.length})
      </h2>
      
      {state.participants.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
            👥
          </div>
          <p className="text-muted-foreground text-sm">
            Aguardando participantes...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Compartilhe o código da sala!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.participants.map((participant, index) => (
            <div 
              key={participant.id} 
              className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-8 h-8 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{participant.name}</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.participants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status da sala:</span>
            <span className="text-accent font-medium">✓ Ativa</span>
          </div>
        </div>
      )}
    </div>
  );
}