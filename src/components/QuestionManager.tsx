import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Button } from './ui/button';

export default function QuestionManager() {
  const { state, dispatch } = useQuiz();

  const handleRemoveQuestion = (questionId: string) => {
    dispatch({ type: 'REMOVE_QUESTION', questionId });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single-choice':
        return 'Múltipla Escolha (Única)';
      case 'multi-choice':
        return 'Múltipla Escolha (Múltipla)';
      case 'text-input':
        return 'Texto Livre';
      default:
        return type;
    }
  };

  if (state.questions.length === 0) {
    return (
      <div className="quiz-card p-6 text-center animate-scale-in">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
          📝
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta criada</h3>
        <p className="text-muted-foreground">
          Adicione sua primeira pergunta para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="quiz-card p-6 animate-scale-in">
      <h2 className="text-xl font-semibold mb-4">
        Perguntas ({state.questions.length})
      </h2>
      
      <div className="space-y-4">
        {state.questions.map((question, index) => (
          <div key={question.id} className="border border-border rounded-xl p-4 bg-card/50">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getQuestionTypeLabel(question.type)}
                  </span>
                </div>
                
                <p className="font-medium mb-2">{question.text}</p>
                
                {question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="text-sm bg-muted/50 px-3 py-2 rounded-lg">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {!state.isQuizStarted && (
                <button
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                  title="Remover pergunta"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}