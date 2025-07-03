import React, { useState, useEffect } from 'react';
import { useQuiz, Question, generateQuestionId } from '../contexts/QuizContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import QuestionManager from './QuestionManager';
import ParticipantsList from './ParticipantsList';
import QuizController from './QuizController';
import ResultsDisplay from './ResultsDisplay';

interface HostRoomProps {
  onLeaveRoom: () => void;
}

export default function HostRoom({ onLeaveRoom }: HostRoomProps) {
  const { state, dispatch } = useQuiz();
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'single-choice',
    options: ['', '']
  });

  // Simulate participants joining (for demo purposes)
  useEffect(() => {
    const demoParticipants = [
      { id: 'demo1', name: 'João Silva' },
      { id: 'demo2', name: 'Maria Santos' },
      { id: 'demo3', name: 'Daniel Costa' }
    ];

    // Add demo participants after a short delay
    const timer = setTimeout(() => {
      demoParticipants.forEach(participant => {
        dispatch({ type: 'ADD_PARTICIPANT', participant });
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleAddQuestion = () => {
    if (newQuestion.text?.trim()) {
      const question: Question = {
        id: generateQuestionId(),
        text: newQuestion.text.trim(),
        type: newQuestion.type as Question['type'],
        options: newQuestion.type !== 'text-input' 
          ? newQuestion.options?.filter(opt => opt.trim()) 
          : undefined
      };

      dispatch({ type: 'ADD_QUESTION', question });
      setNewQuestion({
        text: '',
        type: 'single-choice',
        options: ['', '']
      });
    }
  };

  const handleAddOption = () => {
    if (newQuestion.options && newQuestion.options.length < 6) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, '']
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (newQuestion.options && newQuestion.options.length > 2) {
      setNewQuestion({
        ...newQuestion,
        options: newQuestion.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (newQuestion.options) {
      const updatedOptions = [...newQuestion.options];
      updatedOptions[index] = value;
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions
      });
    }
  };

  const canStartQuiz = state.questions.length > 0 && state.participants.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">Sala do Anfitrião</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="bg-[var(--gradient-primary)] text-white px-4 py-2 rounded-xl font-mono text-lg font-bold">
                {state.roomId}
              </div>
              <span className="text-muted-foreground">← Compartilhe este código</span>
            </div>
          </div>
          
          <button
            onClick={onLeaveRoom}
            className="quiz-button-secondary"
          >
            🚪 Sair da Sala
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Question Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create New Question */}
            {!state.isQuizStarted && (
              <div className="quiz-card p-6 animate-scale-in">
                <h2 className="text-xl font-semibold mb-4">Criar Nova Pergunta</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Texto da Pergunta</label>
                    <Textarea
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      placeholder="Digite sua pergunta aqui..."
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Pergunta</label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => setNewQuestion({ 
                        ...newQuestion, 
                        type: value as Question['type'],
                        options: value !== 'text-input' ? ['', ''] : undefined
                      })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-choice">Múltipla Escolha (Única)</SelectItem>
                        <SelectItem value="multi-choice">Múltipla Escolha (Múltipla)</SelectItem>
                        <SelectItem value="text-input">Resposta de Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newQuestion.type !== 'text-input' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Opções de Resposta</label>
                      <div className="space-y-2">
                        {newQuestion.options?.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                              className="rounded-xl"
                            />
                            {newQuestion.options && newQuestion.options.length > 2 && (
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {newQuestion.options && newQuestion.options.length < 6 && (
                          <button
                            onClick={handleAddOption}
                            className="w-full py-2 border border-dashed border-primary/50 rounded-xl text-primary hover:bg-primary/5 transition-colors"
                          >
                            + Adicionar Opção
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestion.text?.trim() || (newQuestion.type !== 'text-input' && (!newQuestion.options || newQuestion.options.filter(opt => opt.trim()).length < 2))}
                    className="quiz-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ➕ Adicionar Pergunta
                  </button>
                </div>
              </div>
            )}

            {/* Question List */}
            <QuestionManager />

            {/* Quiz Controller */}
            {(state.isQuizStarted || canStartQuiz) && <QuizController />}

            {/* Results Display */}
            {state.isQuizStarted && <ResultsDisplay />}
          </div>

          {/* Right Column - Participants */}
          <div>
            <ParticipantsList />
          </div>
        </div>
      </div>
    </div>
  );
}