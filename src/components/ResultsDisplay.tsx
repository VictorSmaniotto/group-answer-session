import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ResultsDisplay() {
  const { state } = useQuiz();

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const currentAnswers = state.answers[currentQuestion?.id] || {};
  const totalParticipants = state.participants.length;
  const respondedCount = Object.keys(currentAnswers).length;
  const progressPercentage = totalParticipants > 0 ? (respondedCount / totalParticipants) * 100 : 0;

  // Prepare chart data for multiple choice questions
  const getChartData = () => {
    if (!currentQuestion?.options || currentQuestion.type === 'text-input') return [];

    const optionCounts: Record<string, number> = {};
    currentQuestion.options.forEach(option => {
      optionCounts[option] = 0;
    });

    Object.values(currentAnswers).forEach(answers => {
      answers.forEach(answer => {
        if (optionCounts.hasOwnProperty(answer)) {
          optionCounts[answer]++;
        }
      });
    });

    return currentQuestion.options.map((option, index) => ({
      name: `${String.fromCharCode(65 + index)}`,
      fullName: option,
      count: optionCounts[option],
      percentage: totalParticipants > 0 ? (optionCounts[option] / totalParticipants * 100).toFixed(1) : '0'
    }));
  };

  const chartData = getChartData();
  const colors = ['hsl(var(--quiz-blue))', 'hsl(var(--quiz-green))', 'hsl(var(--quiz-yellow))', 'hsl(var(--quiz-red))', 'hsl(var(--quiz-purple))', 'hsl(var(--quiz-orange))'];

  // Get text answers for text-input questions
  const getTextAnswers = () => {
    if (currentQuestion?.type !== 'text-input') return [];
    
    return Object.entries(currentAnswers).map(([participantId, answers]) => {
      const participant = state.participants.find(p => p.id === participantId);
      return {
        participantName: participant?.name || 'Anônimo',
        answer: answers[0] || ''
      };
    });
  };

  const textAnswers = getTextAnswers();

  if (!currentQuestion) return null;

  return (
    <div className="quiz-card p-6 animate-scale-in">
      <h2 className="text-xl font-semibold mb-4">Resultados em Tempo Real</h2>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progresso das Respostas</span>
          <span className="text-sm text-muted-foreground">
            {respondedCount} de {totalParticipants} participantes
          </span>
        </div>
        <div className="quiz-progress-bar">
          <div 
            className="quiz-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {progressPercentage.toFixed(1)}% completado
        </p>
      </div>

      {/* Results Content */}
      {currentQuestion.type === 'text-input' ? (
        // Text answers display
        <div>
          <h3 className="font-semibold mb-3">Respostas de Texto</h3>
          {textAnswers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
                💭
              </div>
              <p>Aguardando respostas...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {textAnswers.map((item, index) => (
                <div key={index} className="bg-card/50 border border-border rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {item.participantName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{item.participantName}</span>
                  </div>
                  <p className="text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Chart display for multiple choice
        <div>
          <h3 className="font-semibold mb-3">Distribuição das Respostas</h3>
          {chartData.length === 0 || chartData.every(item => item.count === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
                📊
              </div>
              <p>Aguardando respostas...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Options Summary */}
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}.</span>
                      <span className="text-sm">{item.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.count}</span>
                      <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}