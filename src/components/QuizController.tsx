import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import ExportModal from './ExportModal';

export default function QuizController() {
  const { serverState, send, leaveRoom } = useQuiz();

  const handleStartQuiz = () => {
    send({ type: 'startQuiz' });
  };

  const handleNextQuestion = () => {
    send({ type: 'nextQuestion' });
  };

  const handleFinishQuiz = () => {
    send({ type: 'finishQuiz' });
  };

  const currentQuestion = serverState.questions[serverState.currentQuestionIndex];
  const isLastQuestion = serverState.currentQuestionIndex === serverState.questions.length - 1;
  const canStartQuiz = serverState.questions.length > 0 && serverState.participants.length > 0;

  if (!serverState.isQuizStarted && !serverState.isQuizFinished) {
    return (
      <div className="card-modern animate-scale-in">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-gradient-primary">Controle do Quiz</span>
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl border border-primary/20">
              <span className="text-muted-foreground font-medium">Perguntas:</span>
              <p className="font-bold text-3xl text-primary">{serverState.questions.length}</p>
            </div>
            <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-6 rounded-2xl border border-secondary/20">
              <span className="text-muted-foreground font-medium">Participantes:</span>
              <p className="font-bold text-3xl text-secondary">{serverState.participants.length}</p>
            </div>
          </div>

          {!canStartQuiz && (
            <div className="bg-warning/10 border-2 border-warning/20 rounded-2xl p-6">
              <p className="text-warning-foreground font-semibold text-lg">
                {serverState.questions.length === 0 && 'Adicione pelo menos uma pergunta. '}
                {serverState.participants.length === 0 && 'Aguardando participantes entrarem na sala.'}
              </p>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={!canStartQuiz}
            className="btn-primary w-full text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="font-bold">Iniciar Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  if (serverState.isQuizFinished) {
    return (
      <div className="card-modern text-center animate-bounce-soft">
        <div className="w-24 h-24 bg-gradient-to-r from-success to-accent rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-3xl">✓</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-gradient-primary">Quiz Finalizado!</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Todas as perguntas foram respondidas pelos participantes
        </p>
        
        <div className="space-y-4">
          <ExportModal>
            <button className="btn-primary w-full text-lg py-4">
              <span className="font-semibold">Exportar Resultados</span>
            </button>
          </ExportModal>
          <button
            onClick={leaveRoom}
            className="btn-outline w-full text-lg py-4"
          >
            Criar Nova Sala
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern animate-scale-in">
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-gradient-secondary">Pergunta Atual</span>
      </h2>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-primary">
              Pergunta {serverState.currentQuestionIndex + 1} de {serverState.questions.length}
            </span>
            <div className="text-sm bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-xl font-bold">
              {currentQuestion?.type === 'single-choice' ? 'Única' : 
               currentQuestion?.type === 'multi-choice' ? 'Múltipla' : 'Texto'}
            </div>
          </div>
          <p className="font-semibold text-xl text-foreground">{currentQuestion?.text}</p>
          
          {currentQuestion?.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="text-sm bg-card px-4 py-3 rounded-xl border border-border">
                  <span className="font-bold text-primary">{String.fromCharCode(65 + index)}.</span> {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={isLastQuestion ? handleFinishQuiz : handleNextQuestion}
            className="btn-primary flex-1 text-lg py-4"
          >
            <span className="font-semibold">
              {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Pergunta'}
            </span>
          </button>
          
          <button
            onClick={handleFinishQuiz}
            className="btn-outline px-6 py-4"
          >
            Parar
          </button>
        </div>
      </div>
    </div>
  );
}
