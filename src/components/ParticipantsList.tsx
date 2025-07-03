import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { getParticipantColor } from '../utils/participantColors';

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
          {serverState.participants.map((participant, index) => {
            const color = getParticipantColor(participant.id);
            return (
              <div 
                key={participant.id} 
                className={`flex items-center gap-4 p-4 bg-card/50 rounded-2xl border transition-[var(--transition-normal)] hover:border-opacity-80 animate-fade-in ${color.light} ${color.border} border-opacity-30`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${color.bg} ${color.text}`}>
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{participant.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm text-success font-medium">Online</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text} opacity-75`}>
                  {color.name}
                </div>
              </div>
            );
          })}
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
