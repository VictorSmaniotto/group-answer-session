import React, { useState, useEffect } from 'react';
import { useQuiz, Question, generateQuestionId } from '../contexts/QuizContext';
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
      { id: 'demo1', name: 'Ana Costa' },
      { id: 'demo2', name: 'Carlos Silva' },
      { id: 'demo3', name: 'Marina Santos' }
    ];

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Painel do</span>{' '}
              <span className="text-foreground">Anfitrião</span>
            </h1>
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-2xl font-mono text-2xl font-bold tracking-wider">
                {state.roomId}
              </div>
              <span className="text-muted-foreground text-lg">Código da sala</span>
            </div>
          </div>
          
          <button
            onClick={onLeaveRoom}
            className="btn-outline text-lg px-6 py-3"
          >
            Sair da Sala
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Question Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create New Question */}
            {!state.isQuizStarted && (
              <div className="card-modern animate-scale-in">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-gradient-secondary">Nova Pergunta</span>
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold mb-3 text-primary">
                      Pergunta
                    </label>
                    <Textarea
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      placeholder="Digite sua pergunta aqui..."
                      className="text-lg py-4 px-6 rounded-2xl border-2 min-h-[100px]"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-3 text-secondary">
                      Tipo
                    </label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => setNewQuestion({ 
                        ...newQuestion, 
                        type: value as Question['type'],
                        options: value !== 'text-input' ? ['', ''] : undefined
                      })}
                    >
                      <SelectTrigger className="text-lg py-4 px-6 rounded-2xl border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-choice">Escolha Única</SelectItem>
                        <SelectItem value="multi-choice">Múltiplas Escolhas</SelectItem>
                        <SelectItem value="text-input">Resposta Livre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newQuestion.type !== 'text-input' && (
                    <div>
                      <label className="block text-lg font-semibold mb-3 text-accent">
                        Opções
                      </label>
                      <div className="space-y-3">
                        {newQuestion.options?.map((option, index) => (
                          <div key={index} className="flex gap-3">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                              className="text-lg py-3 px-4 rounded-xl border-2"
                            />
                            {newQuestion.options && newQuestion.options.length > 2 && (
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-[var(--transition-fast)] font-bold"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {newQuestion.options && newQuestion.options.length < 6 && (
                          <button
                            onClick={handleAddOption}
                            className="w-full py-3 border-2 border-dashed border-primary/50 rounded-xl text-primary hover:bg-primary/5 transition-[var(--transition-fast)] font-semibold"
                          >
                            Adicionar Opção
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestion.text?.trim() || (newQuestion.type !== 'text-input' && (!newQuestion.options || newQuestion.options.filter(opt => opt.trim()).length < 2))}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Adicionar Pergunta
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