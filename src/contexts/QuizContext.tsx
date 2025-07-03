import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface Question {
  id: string;
  text: string;
  type: 'single-choice' | 'multi-choice' | 'text-input';
  options?: string[];
}

export interface Participant {
  id: string;
  name: string;
}

export interface Answer {
  participantId: string;
  questionId: string;
  answers: string[];
}

export interface QuizState {
  // Room management
  roomId: string | null;
  isHost: boolean;
  
  // Host-specific state
  questions: Question[];
  participants: Participant[];
  currentQuestionIndex: number;
  isQuizStarted: boolean;
  isQuizFinished: boolean;
  answers: Record<string, Record<string, string[]>>;
  
  // Participant-specific state
  participantName: string | null;
  participantId: string | null;
  currentQuestion: Question | null;
  hasAnsweredCurrentQuestion: boolean;
}

type QuizAction =
  | { type: 'CREATE_ROOM'; roomId: string }
  | { type: 'JOIN_ROOM'; roomId: string; participantName: string; participantId: string }
  | { type: 'ADD_QUESTION'; question: Question }
  | { type: 'REMOVE_QUESTION'; questionId: string }
  | { type: 'UPDATE_QUESTION'; question: Question }
  | { type: 'ADD_PARTICIPANT'; participant: Participant }
  | { type: 'START_QUIZ' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_QUIZ' }
  | { type: 'SUBMIT_ANSWER'; answer: Answer }
  | { type: 'SET_CURRENT_QUESTION'; question: Question }
  | { type: 'RESET_ANSWER_STATUS' }
  | { type: 'LEAVE_ROOM' };

const initialState: QuizState = {
  roomId: null,
  isHost: false,
  questions: [],
  participants: [],
  currentQuestionIndex: 0,
  isQuizStarted: false,
  isQuizFinished: false,
  answers: {},
  participantName: null,
  participantId: null,
  currentQuestion: null,
  hasAnsweredCurrentQuestion: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'CREATE_ROOM':
      return {
        ...initialState,
        roomId: action.roomId,
        isHost: true,
      };

    case 'JOIN_ROOM':
      return {
        ...initialState,
        roomId: action.roomId,
        isHost: false,
        participantName: action.participantName,
        participantId: action.participantId,
      };

    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, action.question],
      };

    case 'REMOVE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.questionId),
      };

    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === action.question.id ? action.question : q
        ),
      };

    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.participant],
      };

    case 'START_QUIZ':
      return {
        ...state,
        isQuizStarted: true,
        currentQuestionIndex: 0,
      };

    case 'NEXT_QUESTION':
      const nextIndex = state.currentQuestionIndex + 1;
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        hasAnsweredCurrentQuestion: false,
      };

    case 'FINISH_QUIZ':
      return {
        ...state,
        isQuizFinished: true,
      };

    case 'SUBMIT_ANSWER':
      const { participantId, questionId, answers } = action.answer;
      return {
        ...state,
        answers: {
          ...state.answers,
          [questionId]: {
            ...state.answers[questionId],
            [participantId]: answers,
          },
        },
        hasAnsweredCurrentQuestion: state.participantId === participantId,
      };

    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.question,
        hasAnsweredCurrentQuestion: false,
      };

    case 'RESET_ANSWER_STATUS':
      return {
        ...state,
        hasAnsweredCurrentQuestion: false,
      };

    case 'LEAVE_ROOM':
      return initialState;

    default:
      return state;
  }
}

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
} | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

// Utility functions
export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateParticipantId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
}