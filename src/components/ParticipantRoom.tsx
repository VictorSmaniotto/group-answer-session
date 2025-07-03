import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Button } from './ui/button';
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
    // In a real app, this would listen to WebSocket messages from the host
    const simulateQuestionReceived = () => {
      if (state.roomId && !state.currentQuestion) {
        // Simulate receiving the first question
        const demoQuestion = {
          id: 'demo1',
          text: 'Quão confiante você estava sobre as demandas recebidas nesse primeiro semestre?',
          type: 'single-choice' as const,
          options: ['Totalmente confiante', 'Muito confiante', 'Pouco confiante', 'Nada confiante']
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

    // Reset for next question
    setSelectedAnswers([]);
    setTextAnswer('');
  };

  const isAnswerSelected = state.currentQuestion?.type === 'text-input' 
    ? textAnswer.trim().length > 0
    : selectedAnswers.length > 0;

  if (state.isQuizFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/10 via-background to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-bounce-in">
          <div className="w-24 h-24 bg-[var(--gradient-success)] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Questionário Finalizado!
          </h1>
          <p className="text-muted-foreground mb-8">
            Obrigado por participar! Suas respostas foram registradas.
          </p>
          <button
            onClick={onLeaveRoom}
            className="quiz-button-primary"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá, {state.participantName}! 👋
            </h1>
            <p className="text-muted-foreground">Sala: {state.roomId}</p>
          </div>
          
          <button
            onClick={onLeaveRoom}
            className="quiz-button-secondary text-sm"
          >
            Sair
          </button>
        </div>

        {/* Content */}
        <div className="quiz-card p-6 animate-scale-in">
          {!state.currentQuestion && !state.hasAnsweredCurrentQuestion ? (
            // Waiting for quiz to start
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--gradient-warm)] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl animate-pulse">
                ⏳
              </div>
              <h2 className="text-xl font-semibold mb-2">Aguardando início...</h2>
              <p className="text-muted-foreground">
                O anfitrião está preparando as perguntas. Por favor, aguarde!
              </p>
            </div>
          ) : state.hasAnsweredCurrentQuestion ? (
            // Answer submitted, waiting for next question
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--gradient-success)] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-semibold mb-2">Resposta enviada!</h2>
              <p className="text-muted-foreground">
                Aguardando a próxima pergunta...
              </p>
            </div>
          ) : state.currentQuestion ? (
            // Active question
            <div className="animate-slide-up">
              <h2 className="text-xl font-semibold mb-6 text-center">
                {state.currentQuestion.text}
              </h2>

              {state.currentQuestion.type === 'text-input' ? (
                // Text input
                <div className="space-y-4">
                  <Textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="rounded-xl min-h-[120px]"
                    rows={4}
                  />
                  
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!textAnswer.trim()}
                    className="quiz-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Resposta
                  </button>
                </div>
              ) : (
                // Multiple choice
                <div className="space-y-3">
                  {state.currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`quiz-option w-full text-left ${
                        selectedAnswers.includes(option) ? 'quiz-option-selected' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswers.includes(option) 
                            ? 'border-primary bg-primary' 
                            : 'border-border'
                        }`}>
                          {selectedAnswers.includes(option) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  ))}
                  
                  {isAnswerSelected && (
                    <button
                      onClick={handleSubmitAnswer}
                      className="quiz-button-primary w-full mt-6 animate-scale-in"
                    >
                      Confirmar Resposta
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Help text */}
        <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in">
          <p>💡 Suas respostas são anônimas e seguras</p>
        </div>
      </div>
    </div>
  );
}