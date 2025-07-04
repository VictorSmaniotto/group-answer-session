import type { QuizState, Question, Participant } from '../../party/server';

export interface ExportData {
  quizSummary: {
    totalQuestions: number;
    totalParticipants: number;
    quizDate: string;
    quizDuration?: string;
  };
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options?: string[];
    correctAnswers?: string[];
    responses: Array<{
      participantName: string;
      participantId: string;
      answers: string[];
    }>;
    statistics?: {
      totalResponses: number;
      responseRate: number;
      optionCounts?: Record<string, number>;
    };
  }>;
  participants: Array<{
    id: string;
    name: string;
    totalAnswers: number;
    answeredQuestions: string[];
  }>;
}

export function processQuizData(serverState: QuizState): ExportData {
  const quizSummary = {
    totalQuestions: serverState.questions.length,
    totalParticipants: serverState.participants.length,
    quizDate: new Date().toISOString(),
  };

  const questions = serverState.questions.map(question => {
    const questionAnswers = serverState.answers[question.id] || {};
    const responses = Object.entries(questionAnswers).map(([participantId, answers]) => {
      const participant = serverState.participants.find(p => p.id === participantId);
      return {
        participantName: participant?.name || 'Anônimo',
        participantId,
        answers,
      };
    });

    let statistics: any = {
      totalResponses: responses.length,
      responseRate: serverState.participants.length > 0 
        ? (responses.length / serverState.participants.length) * 100 
        : 0,
    };

    // Calculate option counts for multiple choice questions
    if (question.options && question.type !== 'text-input') {
      const optionCounts: Record<string, number> = {};
      question.options.forEach(option => {
        optionCounts[option] = 0;
      });

      responses.forEach(response => {
        response.answers.forEach(answer => {
          if (optionCounts.hasOwnProperty(answer)) {
            optionCounts[answer]++;
          }
        });
      });

      statistics.optionCounts = optionCounts;
    }

    return {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      correctAnswers: question.correctAnswers,
      responses,
      statistics,
    };
  });

  const participants = serverState.participants.map(participant => {
    const answeredQuestions = Object.keys(serverState.answers).filter(
      questionId => serverState.answers[questionId][participant.id]
    );

    return {
      id: participant.id,
      name: participant.name,
      totalAnswers: answeredQuestions.length,
      answeredQuestions,
    };
  });

  return {
    quizSummary,
    questions,
    participants,
  };
}

export function exportToJSON(data: ExportData): void {
  const enrichedData = {
    ...data,
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'Sistema de Quiz',
      version: '1.0.0',
      format: 'json'
    },
    quizSummary: {
      ...data.quizSummary,
      exportTimestamp: new Date().toISOString(),
      totalAnswers: data.questions.reduce((total, question) => 
        total + (question.statistics?.totalResponses || 0), 0),
      averageResponseRate: data.questions.length > 0 
        ? (data.questions.reduce((sum, q) => sum + (q.statistics?.responseRate || 0), 0) / data.questions.length).toFixed(2)
        : '0'
    }
  };

  const jsonString = JSON.stringify(enrichedData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: ExportData): void {
  const csvRows: string[] = [];
  
  // Header with metadata
  csvRows.push('# RELATÓRIO DE RESULTADOS DO QUIZ');
  csvRows.push(`# Data: ${new Date().toLocaleString('pt-BR')}`);
  csvRows.push(`# Total de Perguntas: ${data.quizSummary.totalQuestions}`);
  csvRows.push(`# Total de Participantes: ${data.quizSummary.totalParticipants}`);
  csvRows.push('');
  
  // Main data header
  csvRows.push('ID_Pergunta,Numero_Pergunta,Texto_Pergunta,Tipo_Pergunta,ID_Participante,Nome_Participante,Resposta,Timestamp');
  
  // Data rows
  data.questions.forEach((question, questionIndex) => {
    if (question.responses.length === 0) {
      // Add row even if no responses
      csvRows.push([
        question.id,
        (questionIndex + 1).toString(),
        `"${question.text.replace(/"/g, '""')}"`,
        question.type,
        '',
        'Sem respostas',
        '',
        new Date().toISOString()
      ].join(','));
    } else {
      question.responses.forEach(response => {
        response.answers.forEach(answer => {
          const row = [
            question.id,
            (questionIndex + 1).toString(),
            `"${question.text.replace(/"/g, '""')}"`,
            question.type,
            response.participantId,
            `"${response.participantName.replace(/"/g, '""')}"`,
            `"${answer.replace(/"/g, '""')}"`,
            new Date().toISOString()
          ].join(',');
          csvRows.push(row);
        });
      });
    }
  });
  
  // Add summary sheet
  csvRows.push('');
  csvRows.push('# RESUMO DOS PARTICIPANTES');
  csvRows.push('ID_Participante,Nome_Participante,Total_Respostas,Total_Perguntas,Taxa_Participacao');
  
  data.participants.forEach(participant => {
    const participation = data.quizSummary.totalQuestions > 0 
      ? ((participant.totalAnswers / data.quizSummary.totalQuestions) * 100).toFixed(1) 
      : '0';
    csvRows.push([
      participant.id,
      `"${participant.name.replace(/"/g, '""')}"`,
      participant.totalAnswers.toString(),
      data.quizSummary.totalQuestions.toString(),
      `${participation}%`
    ].join(','));
  });
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToText(data: ExportData): void {
  const textLines: string[] = [];
  
  // Header
  textLines.push('╔══════════════════════════════════════════════════════════════╗');
  textLines.push('║                    RELATÓRIO DE RESULTADOS DO QUIZ                    ║');
  textLines.push('╚══════════════════════════════════════════════════════════════╝');
  textLines.push('');
  textLines.push(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  textLines.push(`📊 Total de Perguntas: ${data.quizSummary.totalQuestions}`);
  textLines.push(`👥 Total de Participantes: ${data.quizSummary.totalParticipants}`);
  textLines.push('');
  textLines.push('═'.repeat(70));
  textLines.push('');
  
  // Questions and answers
  data.questions.forEach((question, index) => {
    textLines.push(`${index + 1}. ${question.text}`);
    textLines.push(`   📋 Tipo: ${getQuestionTypeLabel(question.type)}`);
    textLines.push(`   📈 Respostas: ${question.statistics?.totalResponses || 0}/${data.quizSummary.totalParticipants} (${question.statistics?.responseRate?.toFixed(1) || '0'}%)`);
    textLines.push('');
    
    if (question.statistics?.optionCounts) {
      textLines.push('   📊 Distribuição das respostas:');
      Object.entries(question.statistics.optionCounts).forEach(([option, count]) => {
        const percentage = data.quizSummary.totalParticipants > 0 
          ? ((count / data.quizSummary.totalParticipants) * 100).toFixed(1) 
          : '0';
        const bar = '█'.repeat(Math.round((count / data.quizSummary.totalParticipants) * 20));
        textLines.push(`   ▶ ${option}: ${count} (${percentage}%) ${bar}`);
      });
    } else if (question.type === 'text-input') {
      textLines.push('   💬 Respostas de texto:');
      question.responses.forEach((response, idx) => {
        textLines.push(`   ${idx + 1}. ${response.participantName}: "${response.answers.join(', ')}"`);
      });
    }
    
    textLines.push('');
    textLines.push('─'.repeat(70));
    textLines.push('');
  });
  
  // Participants summary
  textLines.push('👥 RESUMO DOS PARTICIPANTES');
  textLines.push('─'.repeat(30));
  data.participants.forEach((participant, index) => {
    const participation = data.quizSummary.totalQuestions > 0 
      ? ((participant.totalAnswers / data.quizSummary.totalQuestions) * 100).toFixed(1) 
      : '0';
    const completionBar = '█'.repeat(Math.round((participant.totalAnswers / data.quizSummary.totalQuestions) * 10));
    textLines.push(`${index + 1}. ${participant.name}`);
    textLines.push(`   Participação: ${participant.totalAnswers}/${data.quizSummary.totalQuestions} (${participation}%) ${completionBar}`);
  });
  
  textLines.push('');
  textLines.push('═'.repeat(70));
  textLines.push('🎯 Relatório gerado automaticamente pelo Sistema de Quiz');
  textLines.push(`⏰ ${new Date().toLocaleString('pt-BR')}`);
  
  const textString = textLines.join('\n');
  const blob = new Blob([textString], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'single-choice':
      return 'Escolha Única';
    case 'multi-choice':
      return 'Múltiplas Escolhas';
    case 'text-input':
      return 'Resposta Livre';
    default:
      return type;
  }
}
