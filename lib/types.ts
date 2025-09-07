export interface VideoClip {
  id: string;
  filename: string;
  emotion: EmotionType;
  description: string;
  situations: ConversationSituation[];
}

export type EmotionType = 
  | 'greeting'
  | 'happy'
  | 'speaking'
  | 'thinking'
  | 'encouraging'
  | 'smiling'
  | 'confirming'
  | 'sad'
  | 'dancing'
  | 'cheering'
  | 'idle';

export type ConversationSituation = 
  | 'conversation_start'
  | 'user_speaking'
  | 'agent_speaking'
  | 'conversation_end'
  | 'idle'
  | 'encouraging_user'
  | 'confirming_understanding'
  | 'thinking_response';

export interface ConversationState {
  isConnected: boolean;
  isSpeaking: boolean;
  currentEmotion: EmotionType;
  lastMessage?: string;
  conversationId?: string;
}
