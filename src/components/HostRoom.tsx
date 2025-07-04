import React, { useState } from 'react';
import { useQuiz, Question, generateQuestionId } from '../contexts/QuizContext';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import QuestionManager from './QuestionManager';
import ParticipantsList from './ParticipantsList';
import QuizController from './QuizController';
import ResultsDisplay from './ResultsDisplay';
import ExportModal from './ExportModal';

export default function HostRoom() {
  const { serverState, clientState, send, leaveRoom } = useQuiz();
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'single-choice',
    options: ['', ''],
    correctAnswers: [],
    graded: false
  });

  const handleAddQuestion = () => {
    if (newQuestion.text?.trim()) {
      const question: Question = {
        id: generateQuestionId(),
        text: newQuestion.text.trim(),
        type: newQuestion.type as Question['type'],
        options: newQuestion.type !== 'text-input'
          ? newQuestion.options?.filter(opt => opt.trim())
          : undefined,
        correctAnswers: newQuestion.correctAnswers?.filter(a => a.trim()),
        graded: newQuestion.graded
      };

      send({ type: 'addQuestion', question });
      setNewQuestion({
        text: '',
        type: 'single-choice',
        options: ['', ''],
        correctAnswers: [],
        graded: false
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
      const removed = newQuestion.options[index];
      setNewQuestion({
        ...newQuestion,
        options: newQuestion.options.filter((_, i) => i !== index),
        correctAnswers: newQuestion.correctAnswers?.filter(a => a !== removed)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (newQuestion.options) {
      const updatedOptions = [...newQuestion.options];
      const old = updatedOptions[index];
      updatedOptions[index] = value;
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions,
        correctAnswers: newQuestion.correctAnswers?.map(a => a === old ? value : a)
      });
    }
  };

  const canStartQuiz = serverState.questions.length > 0 && serverState.participants.length > 0;

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
                {clientState.roomId}
              </div>
              <span className="text-muted-foreground text-lg">Código da sala</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Export Button - Only show if quiz has started or finished */}
            {(serverState.isQuizStarted || serverState.isQuizFinished) && (
              <ExportModal>
                <button className="btn-secondary text-lg px-6 py-3">
                  📊 Exportar
                </button>
              </ExportModal>
            )}
            
            <button
              onClick={leaveRoom}
              className="btn-outline text-lg px-6 py-3"
            >
              Sair da Sala
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Question Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create New Question */}
            {!serverState.isQuizStarted && (
              <div className="card-modern animate-scale-in">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Nova Pergunta
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold mb-3 text-foreground">
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
                    <label className="block text-lg font-semibold mb-3 text-foreground">
                      Tipo
                    </label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(value) => setNewQuestion({
                      ...newQuestion,
                      type: value as Question['type'],
                      options: value !== 'text-input' ? ['', ''] : undefined,
                      correctAnswers: []
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
                  <div className="flex items-center gap-3 mt-4">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-primary"
                      checked={newQuestion.graded}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          graded: e.target.checked,
                          correctAnswers: []
                        })
                      }
                    />
                    <span className="text-lg">Habilitar resposta correta</span>
                  </div>
                </div>

                  {newQuestion.type !== 'text-input' && (
                    <div>
                      <label className="block text-lg font-semibold mb-3 text-foreground">
                        Opções
                      </label>
                      <div className="space-y-3">
                        {newQuestion.options?.map((option, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            {newQuestion.graded && (
                              newQuestion.type === 'single-choice' ? (
                                <input
                                  type="radio"
                                  className="h-5 w-5 text-primary"
                                  checked={newQuestion.correctAnswers?.[0] === option}
                                  onChange={() =>
                                    setNewQuestion({
                                      ...newQuestion,
                                      correctAnswers: [option]
                                    })
                                  }
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  className="h-5 w-5 text-primary"
                                  checked={newQuestion.correctAnswers?.includes(option)}
                                  onChange={() => {
                                    const exists = newQuestion.correctAnswers?.includes(option);
                                    setNewQuestion({
                                      ...newQuestion,
                                      correctAnswers: exists
                                        ? newQuestion.correctAnswers?.filter(a => a !== option)
                                        : [...(newQuestion.correctAnswers || []), option]
                                    });
                                  }}
                                />
                              )
                            )}
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

                  {newQuestion.type === 'text-input' && newQuestion.graded && (
                    <div>
                      <label className="block text-lg font-semibold mb-3 text-foreground">
                        Resposta Correta
                      </label>
                      <Input
                        value={newQuestion.correctAnswers?.[0] || ''}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            correctAnswers: [e.target.value]
                          })
                        }
                        placeholder="Digite a resposta correta"
                        className="text-lg py-3 px-4 rounded-xl border-2"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAddQuestion}
                  disabled={
                    !newQuestion.text?.trim() ||
                    (newQuestion.type !== 'text-input' &&
                      (!newQuestion.options || newQuestion.options.filter(opt => opt.trim()).length < 2)) ||
                      (newQuestion.graded && (!newQuestion.correctAnswers || newQuestion.correctAnswers.length === 0))
                  }
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
            {(serverState.isQuizStarted || canStartQuiz) && <QuizController />}

            {/* Results Display */}
            {serverState.isQuizStarted && <ResultsDisplay />}
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
