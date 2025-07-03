import React from 'react';
import { useQuiz } from '../contexts/QuizContext';

export default function QuestionManager() {
  const { serverState, send } = useQuiz();

  const handleRemoveQuestion = (questionId: string) => {
    send({ type: 'removeQuestion', questionId });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single-choice':
        return 'Escolha Única';
      case 'multi-choice':
        return 'Múltiplas Escolhas';
      case 'text-input':
        return 'Resposta Livre';
      default:
        return type;
    }
  };

  if (serverState.questions.length === 0) {
    return (
      <div className="card-modern text-center animate-scale-in">
        <div className="w-20 h-20 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-2xl">?</span>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gradient-accent">
          Nenhuma pergunta criada
        </h3>
        <p className="text-muted-foreground text-lg">
          Adicione sua primeira pergunta para começar
        </p>
      </div>
    );
  }

  return (
    <div className="card-modern animate-scale-in">
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-gradient-primary">Perguntas</span>{' '}
        <span className="text-muted-foreground">({serverState.questions.length})</span>
      </h2>
      
      <div className="space-y-4">
        {serverState.questions.map((question, index) => (
          <div key={question.id} className="border-2 border-border rounded-2xl p-6 bg-card/50 transition-[var(--transition-normal)] hover:border-primary/50">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-xl text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {getQuestionTypeLabel(question.type)}
                  </span>
                </div>
                
                <p className="font-semibold text-lg mb-4 text-foreground">{question.text}</p>
                
                {question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="text-sm bg-muted/50 px-4 py-3 rounded-xl border border-border">
                        <span className="font-semibold text-primary">{String.fromCharCode(65 + optIndex)}.</span> {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {!serverState.isQuizStarted && (
                <button
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="text-destructive hover:bg-destructive/10 p-3 rounded-xl transition-[var(--transition-fast)] font-bold text-lg"
                  title="Remover pergunta"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
