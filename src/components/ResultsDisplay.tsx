import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { getParticipantColor } from '../utils/participantColors';

// Simple chart components without recharts dependency
const SimpleBarChart = ({ data, colors }: { data: any[], colors: string[] }) => {
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-8 text-center font-bold text-foreground">
            {item.name}
          </div>
          <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3"
              style={{ 
                width: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%',
                background: colors[index % colors.length]
              }}
            >
              <span className="text-white font-bold text-sm">
                {item.count}
              </span>
            </div>
          </div>
          <div className="w-16 text-right text-sm text-muted-foreground">
            {item.percentage}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ResultsDisplay() {
  const { serverState } = useQuiz();

  const currentQuestion = serverState.questions[serverState.currentQuestionIndex];
  const currentAnswers = serverState.answers[currentQuestion?.id] || {};
  const totalParticipants = serverState.participants.length;
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
  const optionColors = [
    '#10b981', // emerald-500 
    '#059669', // emerald-600
    '#047857', // emerald-700
    '#065f46', // emerald-800
    '#22c55e', // green-500
    '#16a34a', // green-600
    '#15803d', // green-700
    '#166534', // green-800
    '#84cc16', // lime-500
    '#65a30d', // lime-600
  ];

  // Get text answers for text-input questions
  const getTextAnswers = () => {
    if (currentQuestion?.type !== 'text-input') return [];
    
    return Object.entries(currentAnswers).map(([participantId, answers]) => {
      const participant = serverState.participants.find(p => p.id === participantId);
      return {
        participantId,
        participantName: participant?.name || 'Anônimo',
        answer: answers[0] || ''
      };
    });
  };

  const textAnswers = getTextAnswers();

  if (!currentQuestion) return null;

  return (
    <div className="card-modern animate-scale-in">
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-gradient-accent">Resultados em Tempo Real</span>
      </h2>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-semibold text-primary">Progresso das Respostas</span>
          <span className="text-muted-foreground font-medium">
            {respondedCount} de {totalParticipants} participantes
          </span>
        </div>
        <div className="progress-modern">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          {progressPercentage.toFixed(1)}% completado
        </p>
      </div>

      {/* Results Content */}
      {currentQuestion.type === 'text-input' ? (
        // Text answers display
        <div>
          <h3 className="text-xl font-bold mb-4 text-foreground">Respostas de Texto</h3>
          {textAnswers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💭</span>
              </div>
              <p className="text-lg font-semibold">Aguardando respostas...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {textAnswers.map((item, index) => {
                const color = getParticipantColor(item.participantId);
                return (
                  <div key={index} className={`border rounded-2xl p-4 animate-fade-in ${color.light} ${color.border} border-opacity-50`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${color.bg} ${color.text}`}>
                        {item.participantName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-lg">{item.participantName}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text} opacity-75 ml-auto`}>
                        {color.name}
                      </div>
                    </div>
                    <p className="text-foreground pl-13">{item.answer}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Chart display for multiple choice
        <div>
          <h3 className="text-xl font-bold mb-4 text-foreground">Distribuição das Respostas</h3>
          {chartData.length === 0 || chartData.every(item => item.count === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-lg font-semibold">Aguardando respostas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Simple Bar Chart */}
              <div className="bg-card/50 border border-border rounded-2xl p-6">
                <SimpleBarChart data={chartData} colors={optionColors} />
              </div>

              {/* Options Summary */}
              <div className="space-y-3">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-card/50 rounded-2xl border border-border">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-6 h-6 rounded-xl"
                        style={{ backgroundColor: optionColors[index % optionColors.length] }}
                      />
                      <span className="font-bold text-lg">{item.name}.</span>
                      <span className="text-foreground">{item.fullName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xl">{item.count}</span>
                      <span className="text-muted-foreground font-medium">({item.percentage}%)</span>
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
