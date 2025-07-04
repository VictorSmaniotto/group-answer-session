import React from 'react';
import { useQuiz } from '../contexts/QuizContext';

function arraysEqual(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export default function ScoreBoard() {
  const { serverState, clientState } = useQuiz();
  const participantId = clientState.participantId;

  let correct = 0;
  let wrong = 0;

  if (participantId) {
    serverState.questions.forEach(q => {
      const ans = serverState.answers[q.id]?.[participantId];
      if (ans && q.correctAnswers && q.correctAnswers.length > 0) {
        if (arraysEqual(ans, q.correctAnswers)) correct++; else wrong++;
      }
    });
  }

  const total = correct + wrong;
  if (total === 0) return null;

  return (
    <div className="card-modern text-center animate-fade-in mt-6">
      <h2 className="text-2xl font-bold mb-4">
        <span className="text-gradient-accent">Seu Placar</span>
      </h2>
      <p className="text-lg text-foreground font-semibold mb-2">Acertos: {correct}</p>
      <p className="text-lg text-foreground">Erros: {wrong}</p>
    </div>
  );
}
