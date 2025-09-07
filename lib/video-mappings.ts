import { VideoClip, EmotionType, ConversationSituation } from './types';

export const VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'greeting',
    filename: 'jimeng-2025-07-21-8544-打招呼.mp4',
    emotion: 'greeting',
    description: 'Greeting gesture for conversation start',
    situations: ['conversation_start']
  },
  {
    id: 'speaking',
    filename: '标准_主体形象是一个数字人_说话中.mp4',
    emotion: 'speaking',
    description: 'Standard speaking animation',
    situations: ['agent_speaking']
  },
  {
    id: 'happy-laugh',
    filename: 'jimeng-2025-07-23-4616-主体形象是一个数字人，开心大笑的样子，保持优雅.mp4',
    emotion: 'happy',
    description: 'Happy laughing while maintaining elegance',
    situations: ['encouraging_user', 'idle']
  },
  {
    id: 'confirming',
    filename: 'jimeng-2025-07-23-3856-主体形象是一个数字人，确认，优雅的小幅度点头.mp4',
    emotion: 'confirming',
    description: 'Small elegant nod for confirmation',
    situations: ['confirming_understanding']
  },
  {
    id: 'encouraging',
    filename: 'jimeng-2025-07-23-7205-主体形象是一个数字人，对用户表现、成就给予肯定和鼓励时用，保持优雅.mp4',
    emotion: 'encouraging',
    description: 'Expressing affirmation and encouragement',
    situations: ['encouraging_user']
  },
  {
    id: 'thinking',
    filename: 'jimeng-2025-07-17-2665-若有所思，手扶下巴.mp4',
    emotion: 'thinking',
    description: 'Looking thoughtful, hand on chin',
    situations: ['thinking_response', 'user_speaking']
  },
  {
    id: 'smiling-sway',
    filename: 'jimeng-2025-07-16-1043-笑着优雅的左右摇晃，过一会儿手扶着下巴，保持微笑.mp4',
    emotion: 'smiling',
    description: 'Smiling gracefully while swaying, then hand on chin',
    situations: ['idle']
  },
  {
    id: 'v-sign-sway',
    filename: 'jimeng-2025-07-16-4437-比耶，然后微笑着优雅的左右摇晃.mp4',
    emotion: 'happy',
    description: 'V-sign gesture then graceful swaying',
    situations: ['encouraging_user']
  },
  {
    id: 'graceful-smile',
    filename: 'jimeng-2025-07-17-1871-优雅的摇晃身体 微笑.mp4',
    emotion: 'smiling',
    description: 'Gracefully swaying body while smiling',
    situations: ['idle']
  },
  {
    id: 'sad',
    filename: 'jimeng-2025-07-21-2297-悲伤.mp4',
    emotion: 'sad',
    description: 'Sad expression',
    situations: ['conversation_end']
  },
  {
    id: 'dancing',
    filename: '生成跳舞视频.mp4',
    emotion: 'dancing',
    description: 'Dancing animation',
    situations: ['encouraging_user']
  },
  {
    id: 'cheering',
    filename: '生成加油视频.mp4',
    emotion: 'cheering',
    description: 'Cheering animation',
    situations: ['encouraging_user']
  }
];

export function getVideoForSituation(situation: ConversationSituation): VideoClip | null {
  const matchingClips = VIDEO_CLIPS.filter(clip => 
    clip.situations.includes(situation)
  );
  
  if (matchingClips.length === 0) return null;
  
  // Return random clip from matching ones for variety
  const randomIndex = Math.floor(Math.random() * matchingClips.length);
  return matchingClips[randomIndex];
}

export function getVideoForEmotion(emotion: EmotionType): VideoClip | null {
  const matchingClip = VIDEO_CLIPS.find(clip => clip.emotion === emotion);
  return matchingClip || null;
}

export function getIdleVideo(): VideoClip {
  const idleClips = VIDEO_CLIPS.filter(clip => 
    clip.situations.includes('idle')
  );
  
  if (idleClips.length === 0) {
    return VIDEO_CLIPS[0]; // Fallback to first video
  }
  
  const randomIndex = Math.floor(Math.random() * idleClips.length);
  return idleClips[randomIndex];
}
