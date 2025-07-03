import React, { useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { processQuizData, exportToJSON, exportToCSV, exportToText } from '../utils/exportResults';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from './Toast';

interface ExportModalProps {
  children: React.ReactNode;
}

export default function ExportModal({ children }: ExportModalProps) {
  const { serverState } = useQuiz();
  const { success, error } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'json' | 'csv' | 'text'>('json');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [exportAll, setExportAll] = useState(true);

  const handleExport = async () => {
    if (!serverState) return;

    setIsExporting(true);
    
    try {
      // Filter questions if not exporting all
      const filteredServerState = exportAll ? serverState : {
        ...serverState,
        questions: serverState.questions.filter(q => selectedQuestions.includes(q.id))
      };

      const exportData = processQuizData(filteredServerState);
      
      switch (exportType) {
        case 'json':
          exportToJSON(exportData);
          success('Arquivo JSON exportado com sucesso! 📊');
          break;
        case 'csv':
          exportToCSV(exportData);
          success('Arquivo CSV exportado com sucesso! 📈');
          break;
        case 'text':
          exportToText(exportData);
          success('Relatório de texto exportado com sucesso! 📄');
          break;
      }
    } catch (exportError) {
      console.error('Erro ao exportar:', exportError);
      error('Erro ao exportar os resultados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getExportDescription = () => {
    switch (exportType) {
      case 'json':
        return 'Formato estruturado ideal para análise programática ou importação em outras ferramentas.';
      case 'csv':
        return 'Formato compatível com Excel, Google Sheets e outras planilhas eletrônicas.';
      case 'text':
        return 'Relatório formatado em texto simples, fácil de ler e compartilhar.';
      default:
        return '';
    }
  };

  const getStatsForDisplay = () => {
    const questionsToShow = exportAll ? serverState.questions : 
      serverState.questions.filter(q => selectedQuestions.includes(q.id));
    
    const totalAnswers = questionsToShow.reduce((total, question) => {
      const answers = serverState.answers[question.id] || {};
      return total + Object.keys(answers).length;
    }, 0);

    return {
      questions: questionsToShow.length,
      totalAnswers,
      avgAnswersPerQuestion: questionsToShow.length > 0 ? 
        (totalAnswers / questionsToShow.length).toFixed(1) : '0'
    };
  };

  const stats = getStatsForDisplay();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            <span className="text-gradient-primary">Exportar Resultados</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quiz Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-4">
            <h3 className="font-semibold text-lg mb-3 text-primary">Resumo do Quiz</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground block">Perguntas</span>
                <p className="font-bold text-2xl text-primary">{stats.questions}</p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Participantes</span>
                <p className="font-bold text-2xl text-secondary">{serverState.participants.length}</p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Média resp/pergunta</span>
                <p className="font-bold text-2xl text-accent">{stats.avgAnswersPerQuestion}</p>
              </div>
            </div>
          </div>

          {/* Question Selection */}
          {serverState.questions.length > 1 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-secondary">Selecionar Perguntas:</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary/20 bg-primary/5">
                  <input
                    type="checkbox"
                    checked={exportAll}
                    onChange={(e) => setExportAll(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-primary"
                  />
                  <span className="font-semibold text-primary">Exportar todas as perguntas</span>
                </label>
                
                {!exportAll && (
                  <div className="space-y-2 ml-4">
                    {serverState.questions.map((question, index) => (
                      <label key={question.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleQuestionToggle(question.id)}
                          className="w-5 h-5 rounded border-2 border-primary mt-1"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-sm text-primary">Pergunta {index + 1}</span>
                          <p className="text-sm text-foreground">{question.text}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                              {question.type}
                            </span>
                            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                              {Object.keys(serverState.answers[question.id] || {}).length} respostas
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export Format Selection */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-secondary">Escolha o formato:</h3>
            <div className="space-y-3">
              {[
                { value: 'json', label: 'JSON', icon: '📊' },
                { value: 'csv', label: 'CSV (Excel)', icon: '📈' },
                { value: 'text', label: 'Relatório de Texto', icon: '📄' }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportType(format.value as any)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-[var(--transition-fast)] ${
                    exportType === format.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{format.icon}</span>
                    <div>
                      <p className="font-semibold">{format.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {format.value === exportType ? getExportDescription() : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleExport}
              disabled={isExporting || (!exportAll && selectedQuestions.length === 0)}
              className="w-full btn-primary text-lg py-6"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Exportando...</span>
                </div>
              ) : (
                <span className="font-semibold">
                  📥 Baixar Resultados ({stats.questions} pergunta{stats.questions !== 1 ? 's' : ''})
                </span>
              )}
            </Button>
            
            {!exportAll && selectedQuestions.length === 0 && (
              <p className="text-sm text-destructive mt-2 text-center">
                Selecione pelo menos uma pergunta para exportar
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
