# 📊 Sistema de Exportação de Resultados

Esta funcionalidade permite exportar os resultados do quiz em diferentes formatos para análise e arquivamento.

## 🎯 Funcionalidades

### ✅ **Formatos de Exportação**
- **JSON**: Formato estruturado para análise programática
- **CSV**: Compatível com Excel e Google Sheets
- **TXT**: Relatório formatado em texto simples

### ✅ **Opções de Exportação**
- **Exportação Completa**: Todas as perguntas e respostas
- **Exportação Seletiva**: Escolha perguntas específicas
- **Metadados Incluídos**: Data, hora, estatísticas detalhadas

### ✅ **Estatísticas Incluídas**
- Taxa de resposta por pergunta
- Distribuição de respostas (para múltipla escolha)
- Participação individual dos usuários
- Gráficos em ASCII (formato texto)

## 🚀 Como Usar

### **Para Anfitriões**
1. Durante o quiz, clique no botão "📊 Exportar" no cabeçalho
2. Após finalizar o quiz, use o botão "Exportar Resultados"

### **Opções de Exportação**
1. **Selecionar Perguntas**: 
   - Marque "Exportar todas as perguntas" para exportação completa
   - Desmarque para selecionar perguntas específicas

2. **Escolher Formato**:
   - **JSON**: Para desenvolvedores e análise programática
   - **CSV**: Para análise em planilhas (Excel, Google Sheets)
   - **TXT**: Para relatórios simples e apresentações

3. **Baixar**: Clique em "Baixar Resultados" para fazer o download

## 📋 Estrutura dos Dados Exportados

### **JSON**
```json
{
  "metadata": {
    "exportedAt": "2025-07-02T...",
    "version": "1.0.0"
  },
  "quizSummary": {
    "totalQuestions": 5,
    "totalParticipants": 12,
    "totalAnswers": 58,
    "averageResponseRate": "96.7"
  },
  "questions": [...],
  "participants": [...]
}
```

### **CSV**
```csv
ID_Pergunta,Numero_Pergunta,Texto_Pergunta,Tipo_Pergunta,ID_Participante,Nome_Participante,Resposta,Timestamp
q_1,1,"Como você avalia...","single-choice","p_1","João Silva","Excelente","2025-07-02T..."
```

### **TXT**
```
╔══════════════════════════════════════════════════════════════╗
║                    RELATÓRIO DE RESULTADOS DO QUIZ          ║
╚══════════════════════════════════════════════════════════════╝

📅 Data: 02/07/2025, 14:30:25
📊 Total de Perguntas: 5
👥 Total de Participantes: 12
```

## 🔧 Recursos Técnicos

### **Processamento de Dados**
- Filtragem de perguntas selecionadas
- Cálculo automático de estatísticas
- Formatação específica por tipo de pergunta

### **Download Automático**
- Geração de arquivo no navegador
- Nomes de arquivo com timestamp
- Limpeza automática de memória

### **Responsividade**
- Interface adaptável para dispositivos móveis
- Seleção fácil de perguntas em telas pequenas
- Feedback visual durante exportação

## 📈 Casos de Uso

### **Análise de Dados**
- Importar CSV no Excel para gráficos avançados
- Usar JSON para análise programática
- Relatórios TXT para apresentações

### **Arquivamento**
- Manter histórico de pesquisas
- Documentar resultados de treinamentos
- Backup de dados importantes

### **Compartilhamento**
- Enviar relatórios para stakeholders
- Anexar em e-mails e documentos
- Imprimir relatórios em texto

## 🛠️ Implementação

### **Componentes**
- `ExportModal.tsx`: Interface de exportação
- `exportResults.ts`: Lógica de processamento e download

### **Integração**
- Botão no `QuizController` (quiz finalizado)
- Botão no `HostRoom` (durante o quiz)
- Contexto compartilhado via `QuizContext`

---

*Sistema desenvolvido com React, TypeScript e Vite*
