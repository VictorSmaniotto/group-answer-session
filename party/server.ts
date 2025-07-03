import type * as Party from "partykit/server";

// Define the shape of a question
export interface Question {
  id: string;
  text: string;
  type: 'single-choice' | 'multi-choice' | 'text-input';
  options?: string[];
}

// Define the shape of a participant
export interface Participant {
  id: string;
  name: string;
}

// Define the shape of an answer
export interface Answer {
  participantId: string;
  questionId: string;
  answers: string[];
}

// Define the shared state of the quiz room
export interface QuizState {
  questions: Question[];
  participants: Participant[];
  currentQuestionIndex: number;
  isQuizStarted: boolean;
  isQuizFinished: boolean;
  answers: Record<string, Record<string, string[]>>; // { questionId: { participantId: [...] } }
}

// Define the messages that can be sent between client and server
type QuizMessage =
  | { type: 'identify'; name: string; isHost: boolean }
  | { type: 'addQuestion'; question: Question }
  | { type: 'removeQuestion'; questionId: string }
  | { type: 'updateQuestion'; question: Question }
  | { type: 'startQuiz' }
  | { type: 'nextQuestion' }
  | { type: 'finishQuiz' }
  | { type: 'submitAnswer'; answer: Answer }
  | { type: 'resetQuiz' };

function isQuizMessage(msg: any): msg is QuizMessage {
  if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
    return false;
  }

  switch (msg.type) {
    case 'identify':
      return (
        typeof msg.name === 'string' &&
        typeof msg.isHost === 'boolean'
      );
    case 'addQuestion':
      return typeof msg.question === 'object' && typeof msg.question.id === 'string';
    case 'removeQuestion':
      return typeof msg.questionId === 'string';
    case 'updateQuestion':
      return typeof msg.question === 'object' && typeof msg.question.id === 'string';
    case 'startQuiz':
    case 'nextQuestion':
    case 'finishQuiz':
    case 'resetQuiz':
      return true;
    case 'submitAnswer':
      return (
        msg.answer &&
        typeof msg.answer === 'object' &&
        typeof msg.answer.questionId === 'string' &&
        Array.isArray(msg.answer.answers)
      );
    default:
      return false;
  }
}

export default class QuizServer implements Party.Server {
  state: QuizState;
  hostId: string | null = null;

  constructor(readonly room: Party.Room) {
    this.state = {
      questions: [],
      participants: [],
      currentQuestionIndex: -1,
      isQuizStarted: false,
      isQuizFinished: false,
      answers: {},
    };
  }

  // This is called every time a new user connects to the room
  async onConnect(conn: Party.Connection) {
    // Send the current state to the new connection
    conn.send(JSON.stringify({ type: 'sync', state: this.state }));
  }

  // This is called every time a user sends a message to the room
  async onMessage(message: string, sender: Party.Connection) {
    let msg: QuizMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      sender.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      return;
    }

    if (!isQuizMessage(msg)) {
      sender.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      return;
    }

    console.log(`Received message from ${sender.id}:`, msg);

    // --- Host-only actions ---
    if (msg.type === 'identify' && msg.isHost) {
      if (!this.hostId) {
        this.hostId = sender.id;
        console.log(`Host identified: ${sender.id}`);
      }
    }

    // Only the host can perform certain actions
    const isHostAction = [
      'addQuestion', 'removeQuestion', 'updateQuestion', 
      'startQuiz', 'nextQuestion', 'finishQuiz', 'resetQuiz'
    ].includes(msg.type);

    if (isHostAction && sender.id !== this.hostId) {
      sender.send(JSON.stringify({ type: 'error', message: 'Only the host can perform this action.' }));
      return;
    }

    // --- State updates ---
    if (msg.type === 'identify' && !msg.isHost) {
      const newParticipant: Participant = { id: sender.id, name: msg.name };
      console.log(`Participant identified: ${sender.id} - ${msg.name}`);
      
      // Remove existing participant with same ID and add new one
      this.state.participants = this.state.participants.filter(p => p.id !== sender.id);
      this.state.participants.push(newParticipant);
    } else if (msg.type === 'addQuestion') {
      this.state.questions.push(msg.question);
    } else if (msg.type === 'removeQuestion') {
      this.state.questions = this.state.questions.filter(q => q.id !== msg.questionId);
    } else if (msg.type === 'updateQuestion') {
      this.state.questions = this.state.questions.map(q =>
        q.id === msg.question.id ? msg.question : q
      );
    } else if (msg.type === 'startQuiz') {
      this.state.isQuizStarted = true;
      this.state.currentQuestionIndex = 0;
    } else if (msg.type === 'nextQuestion') {
      if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
        this.state.currentQuestionIndex++;
      }
    } else if (msg.type === 'finishQuiz') {
      this.state.isQuizFinished = true;
    } else if (msg.type === 'submitAnswer') {
      const { questionId, answers } = msg.answer;
      // Use the sender's connection ID as the participant ID
      const participantId = sender.id;
      
      console.log(`Answer submitted by ${participantId} for question ${questionId}:`, answers);
      
      if (!this.state.answers[questionId]) {
        this.state.answers[questionId] = {};
      }
      this.state.answers[questionId][participantId] = answers;
    } else if (msg.type === 'resetQuiz') {
      this.state = {
        questions: [],
        participants: [],
        currentQuestionIndex: -1,
        isQuizStarted: false,
        isQuizFinished: false,
        answers: {},
      };
      this.hostId = null; // Allow a new host
    }

    // Broadcast the updated state to all connections
    this.room.broadcast(JSON.stringify({ type: 'sync', state: this.state }));
  }

  // This is called when a user disconnects
  async onClose(connection: Party.Connection) {
    // Remove the participant from the list
    this.state.participants = this.state.participants.filter(p => p.id !== connection.id);
    
    // If the host disconnects, we could reset the quiz or assign a new host
    if (connection.id === this.hostId) {
      console.log('Host disconnected. Resetting quiz.');
      this.hostId = null; // Clear host
      // Optionally, broadcast a "host disconnected" message
      this.room.broadcast(JSON.stringify({ type: 'hostDisconnected' }));
    }

    // Broadcast the updated state
    this.room.broadcast(JSON.stringify({ type: 'sync', state: this.state }));
  }

  // Handle HTTP requests (for health checks and debugging)
  async onRequest(request: Party.Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        participants: this.state.participants.length,
        questions: this.state.questions.length
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default response for root path
    if (url.pathname === '/' || url.pathname === '/test') {
      return new Response(JSON.stringify({
        message: 'Quiz Interativo PartyKit Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
}
