'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { ConversationSituation, ConversationState } from '@/lib/types';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AGENT_ID = 'agent_7001k4d07e4penht3ww55k6939f6';

export function WaifuConversation() {
  const [conversationState, setConversationState] = useState<ConversationState>({
    isConnected: false,
    isSpeaking: false,
    currentEmotion: 'idle',
  });
  
  const [currentSituation, setCurrentSituation] = useState<ConversationSituation>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', message: string, timestamp: Date}>>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to conversation');
      setConversationState(prev => ({ ...prev, isConnected: true }));
      setCurrentSituation('conversation_start');
      
      // Switch to idle after greeting
      setTimeout(() => {
        setCurrentSituation('idle');
      }, 3000);
    },
    
    onDisconnect: () => {
      console.log('Disconnected from conversation');
      setConversationState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isSpeaking: false 
      }));
      setCurrentSituation('conversation_end');
      
      // Switch to idle after a moment
      setTimeout(() => {
        setCurrentSituation('idle');
      }, 2000);
    },
    
    onMessage: (message) => {
      console.log('Received message:', message);
      setConversationState(prev => ({ ...prev, lastMessage: message.message }));
      
      // Add message to chat log
      if (message.message && message.message.trim()) {
        const newMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: message.source === 'ai' ? 'ai' as const : 'user' as const,
          message: message.message,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, newMessage]);
      }
      
      // Determine situation based on message type
      if (message.source === 'ai' && message.message) {
        setCurrentSituation('agent_speaking');
      } else if (message.source === 'user') {
        setCurrentSituation('thinking_response');
      }
    },
    
    onError: (error) => {
      console.error('Conversation error:', error);
    }
  });

  const { status, isSpeaking } = conversation;

  // Update conversation state when speaking status changes
  useEffect(() => {
    setConversationState(prev => ({ 
      ...prev, 
      isSpeaking,
      isConnected: status === 'connected'
    }));
    
    if (isSpeaking) {
      setCurrentSituation('agent_speaking');
    } else if (status === 'connected') {
      // Return to idle when not speaking
      setTimeout(() => {
        setCurrentSituation('idle');
      }, 1000);
    }
  }, [isSpeaking, status]);

  const requestMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const startConversation = useCallback(async () => {
    if (!hasPermission) {
      await requestMicrophonePermission();
      return;
    }

    try {
      const conversationId = await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      });
      
      setConversationState(prev => ({ 
        ...prev, 
        conversationId 
      }));
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, hasPermission]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  }, [conversation]);

  const toggleMute = useCallback(async () => {
    try {
      const newVolume = isMuted ? 1 : 0;
      await conversation.setVolume({ volume: newVolume });
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }, [conversation, isMuted]);

  return (
    <motion.div 
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fullscreen Video Background */}
      <div className="absolute inset-0">
        <VideoPlayer 
          currentSituation={currentSituation}
          className="w-full h-full"
        />
      </div>

      {/* Chat Toggle Button - Top Right */}
      <motion.div
        className="absolute top-4 right-4 z-30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          variant="outline"
          size="icon"
          className="bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/30 hover:scale-105 transition-all shadow-lg"
        >
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            {isChatOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </div>
        </Button>
      </motion.div>

      {/* Speaking Indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div 
            className="absolute top-4 left-4 z-30 flex items-center space-x-2 bg-green-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow-lg"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>Speaking</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              onClick={() => setIsChatOpen(false)}
            />
            
            {/* Chat Panel */}
            <motion.div
              className="absolute top-16 right-4 w-80 max-h-96 bg-black/60 backdrop-blur-lg rounded-lg border border-white/20 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h3 className="text-white font-semibold">Chat Transcript</h3>
                <Button
                  onClick={() => setIsChatOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  ×
                </Button>
              </div>
              
              {/* Chat Messages */}
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-white/60 text-sm text-center py-8">
                    No messages yet. Start a conversation!
                  </p>
                ) : (
                  chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-blue-500/80 text-white ml-4'
                            : 'bg-white/10 text-white/90 mr-4'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Controls - Bottom Center */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-center space-x-4">
          <AnimatePresence mode="wait">
            {!hasPermission ? (
              <motion.div
                key="permission"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={requestMicrophonePermission}
                  disabled={isRequestingPermission}
                  className="bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/40 hover:scale-105 transition-all shadow-xl px-6 py-3"
                >
                  <motion.div
                    animate={isRequestingPermission ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isRequestingPermission ? Infinity : 0, ease: "linear" }}
                  >
                    <Mic className="w-5 h-5 mr-2" />
                  </motion.div>
                  {isRequestingPermission ? 'Requesting...' : 'Allow Microphone'}
                </Button>
              </motion.div>
            ) : !conversationState.isConnected ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={startConversation}
                  className="bg-green-500/30 backdrop-blur-md border border-green-400/30 text-white hover:bg-green-500/40 hover:scale-105 transition-all shadow-xl px-6 py-3"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Chat
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={endConversation}
                  className="bg-red-500/30 backdrop-blur-md border border-red-400/30 text-white hover:bg-red-500/40 hover:scale-105 transition-all shadow-xl px-6 py-3"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Chat
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mute Button - Show only when connected */}
          <AnimatePresence>
            {conversationState.isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="icon"
                  className="bg-black/30 backdrop-blur-md border-white/20 text-white hover:bg-black/40 hover:scale-105 transition-all shadow-xl"
                >
                  <motion.div
                    animate={{ rotate: isMuted ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </motion.div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Information */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentSituation}
              className="text-white/80 text-sm bg-black/20 backdrop-blur-md px-3 py-1 rounded-full"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {currentSituation.replace('_', ' ')}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
