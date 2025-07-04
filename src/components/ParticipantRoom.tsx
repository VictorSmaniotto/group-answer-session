import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Textarea } from './ui/textarea';
import { getParticipantColor } from '../utils/participantColors';
import ScoreBoard from './ScoreBoard';
import { debug } from '../utils/debug';


function arraysEqual(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  const normalize = (arr: string[]) => arr.map(v => v.trim().toLowerCase()).sort();
  const sortedA = normalize(a);
  const sortedB = normalize(b);
  return sortedA.every((v, i) => v === sortedB[i]);
}
export default function ParticipantRoom() {

  const { 
    serverState, 
    clientState, 
    send, 
    leaveRoom, 
    currentQuestion, 
    hasAnsweredCurrentQuestion 
  } = useQuiz();
  
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOptionIndexes, setSelectedOptionIndexes] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null);

  // Reset local answer state when a new question arrives
  useEffect(() => {
    setSelectedAnswers([]);
    setSelectedOptionIndexes([]);
    setTextAnswer('');
    setAnswerResult(null);
  }, [currentQuestion]);

  const handleOptionSelect = (option: string, index: number) => {
    if (!currentQuestion) return;

    const trimmedOption = option.trim();
    debug('Selecting option:', trimmedOption, 'at index:', index);
    debug('Current question type:', currentQuestion.type);
    debug('Current selected indexes:', selectedOptionIndexes);

    if (currentQuestion.type === 'single-choice') {
      setSelectedAnswers([trimmedOption]);
      setSelectedOptionIndexes([index]);
    } else if (currentQuestion.type === 'multi-choice') {
      if (selectedOptionIndexes.includes(index)) {
        // Deselect this option
        setSelectedOptionIndexes(prev => prev.filter(i => i !== index));
        setSelectedAnswers(prev => {
          const newAnswers = [...prev];
          const optionIndex = newAnswers.findIndex(a => a === trimmedOption);
          if (optionIndex > -1) {
            newAnswers.splice(optionIndex, 1);
          }
          return newAnswers;
        });
      } else {
        // Select this option
        setSelectedOptionIndexes(prev => [...prev, index]);
        setSelectedAnswers(prev => [...prev, trimmedOption]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    const answers = currentQuestion.type === 'text-input' 
      ? [textAnswer.trim()]
      : selectedAnswers;

    if (answers.length === 0 || (currentQuestion.type === 'text-input' && !textAnswer.trim())) {
      return;
    }

    debug('Submitting answer:', {
      questionId: currentQuestion.id,
      answers
    });

    send({
      type: 'submitAnswer',
      answer: {
        questionId: currentQuestion.id,
        answers
      }
    });

    if (currentQuestion.graded && currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 0) {
      const correct = arraysEqual(answers, currentQuestion.correctAnswers);
      setAnswerResult(correct ? 'correct' : 'incorrect');
    }
  };

  const isAnswerSelected = currentQuestion?.type === 'text-input' 
    ? textAnswer.trim().length > 0
    : selectedOptionIndexes.length > 0;

  if (serverState.isQuizFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-bounce-soft">
          <div className="w-24 h-24 bg-gradient-to-r from-success to-accent rounded-full mx-auto mb-8 flex items-center justify-center">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Quiz Finalizado!</span>
          </h1>
          <ScoreBoard />
          <p className="text-muted-foreground text-xl mb-8 mt-6">
            Obrigado por participar!
          </p>
          <button
            onClick={leaveRoom}
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
          <div className="flex items-center gap-4">
            {clientState.participantId && (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl ${getParticipantColor(clientState.participantId).bg} ${getParticipantColor(clientState.participantId).text}`}>
                {clientState.participantName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-gradient-primary">Olá, {clientState.participantName}!</span>
              </h1>
              <p className="text-muted-foreground text-lg">Sala: <span className="font-mono font-bold">{clientState.roomId}</span></p>
            </div>
          </div>
          
          <button
            onClick={leaveRoom}
            className="btn-outline px-4 py-2"
          >
            Sair
          </button>
        </div>

        {/* Content */}
        <div className="card-modern animate-scale-in">
          {!serverState.isQuizStarted || (!currentQuestion && !hasAnsweredCurrentQuestion) ? (
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
          ) : hasAnsweredCurrentQuestion && currentQuestion ? (
            // Show result
            <div className="text-center py-16 animate-fade-in">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${answerResult === 'correct' ? 'bg-success' : 'bg-destructive'}`}> 
                <span className="text-white text-2xl">{answerResult === 'correct' ? '✓' : '✕'}</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {answerResult === 'correct' ? (
                  <span className="text-gradient-primary">Você acertou!</span>
                ) : (
                  <span className="text-destructive">Você errou!</span>
                )}
              </h2>
              {currentQuestion.type !== 'text-input' ? (
                <div className="space-y-3 mb-4">
                  {currentQuestion.options?.map((option, index) => {
                    const isSelected = selectedOptionIndexes.includes(index);
                    const correct = currentQuestion.graded && currentQuestion.correctAnswers?.includes(option.trim());
                    const color = isSelected ? (answerResult === 'correct' ? 'border-success bg-success/20' : 'border-destructive bg-destructive/20') : 'border-border';
                    const textColor = isSelected ? (answerResult === 'correct' ? 'text-success' : 'text-destructive') : '';
                    return (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border ${color} ${textColor}`}> 
                        <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1 text-left">{option}</span>
                        {correct && <span className="text-sm text-success font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-lg font-semibold ${answerResult === 'correct' ? 'text-success' : 'text-destructive'}`}>{textAnswer}</p>
              )}
              <p className="text-muted-foreground text-lg mt-4">Aguardando a próxima pergunta...</p>
            </div>
          ) : currentQuestion ? (
            // Active question
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-8 text-center text-foreground">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'text-input' ? (
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
                  {currentQuestion.options?.map((option, index) => {
                    const trimmedOption = option.trim();
                    const isSelected = selectedOptionIndexes.includes(index);
                    return (
                      <button
                        key={`${currentQuestion.id}-option-${index}`}
                        onClick={() => handleOptionSelect(option, index)}
                        className={`option-card w-full ${
                          isSelected ? 'option-card-selected' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-[var(--transition-fast)] ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-border'
                          }`}>
                            {isSelected && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="flex-1 text-lg font-medium">{trimmedOption}</span>
                        </div>
                      </button>
                    );
                  })}
                  
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
