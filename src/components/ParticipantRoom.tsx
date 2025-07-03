import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Textarea } from './ui/textarea';

interface ParticipantRoomProps {
  onLeaveRoom: () => void;
}

export default function ParticipantRoom({ onLeaveRoom }: ParticipantRoomProps) {
  const { state, dispatch } = useQuiz();
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');

  // Simulate receiving questions from host
  useEffect(() => {
    const simulateQuestionReceived = () => {
      if (state.roomId && !state.currentQuestion) {
        const demoQuestion = {
          id: 'demo1',
          text: 'Como você avalia nossa comunicação interna?',
          type: 'single-choice' as const,
          options: ['Excelente', 'Boa', 'Regular', 'Precisa melhorar']
        };
        
        setTimeout(() => {
          dispatch({ type: 'SET_CURRENT_QUESTION', question: demoQuestion });
        }, 3000);
      }
    };

    simulateQuestionReceived();
  }, [state.roomId, state.currentQuestion, dispatch]);

  const handleOptionSelect = (option: string) => {
    if (!state.currentQuestion) return;

    if (state.currentQuestion.type === 'single-choice') {
      setSelectedAnswers([option]);
    } else if (state.currentQuestion.type === 'multi-choice') {
      setSelectedAnswers(prev => 
        prev.includes(option) 
          ? prev.filter(a => a !== option)
          : [...prev, option]
      );
    }
  };

  const handleSubmitAnswer = () => {
    if (!state.currentQuestion || !state.participantId) return;

    const answers = state.currentQuestion.type === 'text-input' 
      ? [textAnswer.trim()]
      : selectedAnswers;

    if (answers.length === 0 || (state.currentQuestion.type === 'text-input' && !textAnswer.trim())) {
      return;
    }

    dispatch({
      type: 'SUBMIT_ANSWER',
      answer: {
        participantId: state.participantId,
        questionId: state.currentQuestion.id,
        answers
      }
    });

    setSelectedAnswers([]);
    setTextAnswer('');
  };

  const isAnswerSelected = state.currentQuestion?.type === 'text-input' 
    ? textAnswer.trim().length > 0
    : selectedAnswers.length > 0;

  if (state.isQuizFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-bounce-soft">
          <div className="w-24 h-24 bg-gradient-to-r from-success to-accent rounded-full mx-auto mb-8 flex items-center justify-center">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Quiz Finalizado!</span>
          </h1>
          <p className="text-muted-foreground text-xl mb-8">
            Obrigado por participar! Suas respostas foram registradas.
          </p>
          <button
            onClick={onLeaveRoom}
            className="btn-primary text-lg py-4 px-8"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient-primary">Olá, {state.participantName}!</span>
            </h1>
            <p className="text-muted-foreground text-lg">Sala: <span className="font-mono font-bold">{state.roomId}</span></p>
          </div>
          
          <button
            onClick={onLeaveRoom}
            className="btn-outline px-4 py-2"
          >
            Sair
          </button>
        </div>

        {/* Content */}
        <div className="card-modern animate-scale-in">
          {!state.currentQuestion && !state.hasAnsweredCurrentQuestion ? (
            // Waiting for quiz to start
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-warning to-accent rounded-full mx-auto mb-8 flex items-center justify-center animate-pulse">
                <span className="text-white text-2xl">⏳</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                <span className="text-gradient-secondary">Aguardando início...</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                O anfitrião está preparando as perguntas
              </p>
            </div>
          ) : state.hasAnsweredCurrentQuestion ? (
            // Answer submitted, waiting for next question
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-success to-accent rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                <span className="text-gradient-primary">Resposta enviada!</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Aguardando a próxima pergunta...
              </p>
            </div>
          ) : state.currentQuestion ? (
            // Active question
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-8 text-center text-foreground">
                {state.currentQuestion.text}
              </h2>

              {state.currentQuestion.type === 'text-input' ? (
                // Text input
                <div className="space-y-6">
                  <Textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="text-lg py-4 px-6 rounded-2xl border-2 min-h-[150px]"
                    rows={6}
                  />
                  
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!textAnswer.trim()}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Enviar Resposta
                  </button>
                </div>
              ) : (
                // Multiple choice
                <div className="space-y-4">
                  {state.currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`option-card w-full ${
                        selectedAnswers.includes(option) ? 'option-card-selected' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-[var(--transition-fast)] ${
                          selectedAnswers.includes(option) 
                            ? 'border-primary bg-primary' 
                            : 'border-border'
                        }`}>
                          {selectedAnswers.includes(option) && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="flex-1 text-lg font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                  
                  {isAnswerSelected && (
                    <button
                      onClick={handleSubmitAnswer}
                      className="btn-primary w-full text-lg py-4 mt-8 animate-scale-in"
                    >
                      Confirmar Resposta
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-muted-foreground">
            Suas respostas são <span className="text-gradient-accent font-semibold">seguras e anônimas</span>
          </p>
        </div>
      </div>
    </div>
  );
}