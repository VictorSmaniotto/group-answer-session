import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Button } from './ui/button';

export default function QuizController() {
  const { state, dispatch } = useQuiz();

  const handleStartQuiz = () => {
    dispatch({ type: 'START_QUIZ' });
    // Simulate sending first question to participants
    if (state.questions.length > 0) {
      dispatch({ type: 'SET_CURRENT_QUESTION', question: state.questions[0] });
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex < state.questions.length) {
      dispatch({ type: 'NEXT_QUESTION' });
      dispatch({ type: 'SET_CURRENT_QUESTION', question: state.questions[nextIndex] });
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    dispatch({ type: 'FINISH_QUIZ' });
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
  const canStartQuiz = state.questions.length > 0 && state.participants.length > 0;

  if (!state.isQuizStarted && !state.isQuizFinished) {
    return (
      <div className="quiz-card p-6 animate-scale-in">
        <h2 className="text-xl font-semibold mb-4">Controle do Questionário</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <span className="text-muted-foreground">Perguntas:</span>
              <p className="font-bold text-lg">{state.questions.length}</p>
            </div>
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <span className="text-muted-foreground">Participantes:</span>
              <p className="font-bold text-lg">{state.participants.length}</p>
            </div>
          </div>

          {!canStartQuiz && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-warning-foreground">
                ⚠️ {state.questions.length === 0 && 'Adicione pelo menos uma pergunta. '}
                {state.participants.length === 0 && 'Aguardando participantes entrarem na sala.'}
              </p>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={!canStartQuiz}
            className="quiz-button-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Iniciar Questionário
          </button>
        </div>
      </div>
    );
  }

  if (state.isQuizFinished) {
    return (
      <div className="quiz-card p-6 text-center animate-bounce-in">
        <div className="w-16 h-16 bg-[var(--gradient-success)] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl">
          🎉
        </div>
        <h2 className="text-xl font-semibold mb-2">Questionário Finalizado!</h2>
        <p className="text-muted-foreground mb-6">
          Todas as perguntas foram respondidas pelos participantes.
        </p>
        
        <div className="space-y-3">
          <button className="quiz-button-primary w-full">
            📊 Exportar Resultados
          </button>
          <button
            onClick={() => dispatch({ type: 'LEAVE_ROOM' })}
            className="quiz-button-secondary w-full"
          >
            🔄 Criar Nova Sala
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-card p-6 animate-scale-in">
      <h2 className="text-xl font-semibold mb-4">Pergunta Atual</h2>
      
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">
              Pergunta {state.currentQuestionIndex + 1} de {state.questions.length}
            </span>
            <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
              {currentQuestion?.type === 'single-choice' ? 'Única' : 
               currentQuestion?.type === 'multi-choice' ? 'Múltipla' : 'Texto'}
            </div>
          </div>
          <p className="font-medium">{currentQuestion?.text}</p>
          
          {currentQuestion?.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="text-sm bg-card px-3 py-2 rounded-lg border border-border">
                  {String.fromCharCode(65 + index)}. {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleNextQuestion}
            className="quiz-button-primary flex-1"
          >
            {isLastQuestion ? '🏁 Finalizar Questionário' : '➡️ Próxima Pergunta'}
          </button>
          
          <button
            onClick={handleFinishQuiz}
            className="quiz-button-secondary"
          >
            ⏹️ Parar
          </button>
        </div>
      </div>
    </div>
  );
}