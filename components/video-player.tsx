'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoClip, ConversationSituation } from '@/lib/types';
import { getVideoForSituation, getIdleVideo } from '@/lib/video-mappings';

interface VideoPlayerProps {
  currentSituation: ConversationSituation;
  className?: string;
}

export function VideoPlayer({ currentSituation, className = '' }: VideoPlayerProps) {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoClip | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<0 | 1>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextVideo, setNextVideo] = useState<VideoClip | null>(null);

  // Initialize with the first video
  useEffect(() => {
    const initVideo = getIdleVideo();
    setCurrentVideo(initVideo);
    
    if (initVideo && videoRef1.current) {
      videoRef1.current.src = `/clips/${initVideo.filename}`;
      videoRef1.current.load();
      videoRef1.current.play().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const updateVideo = async () => {
      let newVideo: VideoClip | null = null;
      
      // Get video based on current situation
      if (currentSituation === 'idle') {
        newVideo = getIdleVideo();
      } else {
        newVideo = getVideoForSituation(currentSituation);
      }
      
      // Fallback to idle video if no video found for situation
      if (!newVideo) {
        newVideo = getIdleVideo();
      }
      
      // Only update if it's a different video
      if (newVideo && newVideo.id !== currentVideo?.id) {
        setNextVideo(newVideo);
        await transitionToVideo(newVideo);
      }
    };

    updateVideo();
  }, [currentSituation, currentVideo?.id]);

  const transitionToVideo = async (newVideo: VideoClip) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Get the inactive video element (the one we'll load the new video into)
    const inactiveVideoRef = activeVideoIndex === 0 ? videoRef2 : videoRef1;
    const inactiveVideo = inactiveVideoRef.current;
    
    if (inactiveVideo) {
      // Preload the new video
      inactiveVideo.src = `/clips/${newVideo.filename}`;
      
      try {
        await new Promise<void>((resolve, reject) => {
          const handleCanPlay = () => {
            inactiveVideo.removeEventListener('canplay', handleCanPlay);
            inactiveVideo.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = () => {
            inactiveVideo.removeEventListener('canplay', handleCanPlay);
            inactiveVideo.removeEventListener('error', handleError);
            reject(new Error('Video failed to load'));
          };
          
          inactiveVideo.addEventListener('canplay', handleCanPlay);
          inactiveVideo.addEventListener('error', handleError);
          inactiveVideo.load();
        });
        
        // Start playing the new video
        await inactiveVideo.play();
        
        // Switch to the new video with a delay for smooth transition
        setTimeout(() => {
          setCurrentVideo(newVideo);
          setActiveVideoIndex(activeVideoIndex === 0 ? 1 : 0);
          setIsTransitioning(false);
          setNextVideo(null);
        }, 100);
        
      } catch (error) {
        console.error('Error transitioning to video:', error);
        setIsTransitioning(false);
        setNextVideo(null);
      }
    }
  };

  const handleVideoEnd = (videoIndex: 0 | 1) => {
    // Only handle end for the active video
    if (videoIndex !== activeVideoIndex) return;
    
    // Loop back to idle video when current video ends
    if (currentSituation !== 'idle' && currentVideo?.emotion !== 'speaking') {
      const idleVideo = getIdleVideo();
      if (idleVideo && idleVideo.id !== currentVideo?.id) {
        transitionToVideo(idleVideo);
      }
    }
  };

  const getCurrentVideoRef = () => activeVideoIndex === 0 ? videoRef1 : videoRef2;
  const getInactiveVideoRef = () => activeVideoIndex === 0 ? videoRef2 : videoRef1;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Video Layer 1 */}
      <motion.video
        ref={videoRef1}
        className="absolute inset-0 w-full h-full object-cover rounded-none shadow-lg"
        autoPlay
        muted
        loop={currentSituation === 'idle' || currentVideo?.emotion === 'speaking'}
        onEnded={() => handleVideoEnd(0)}
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: activeVideoIndex === 0 ? 1 : 0,
          scale: activeVideoIndex === 0 ? 1 : 1.05
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        style={{ 
          zIndex: activeVideoIndex === 0 ? 2 : 1,
          pointerEvents: activeVideoIndex === 0 ? 'auto' : 'none'
        }}
      >
        Your browser does not support the video tag.
      </motion.video>

      {/* Video Layer 2 */}
      <motion.video
        ref={videoRef2}
        className="absolute inset-0 w-full h-full object-cover rounded-none shadow-lg"
        autoPlay
        muted
        loop={currentSituation === 'idle' || currentVideo?.emotion === 'speaking'}
        onEnded={() => handleVideoEnd(1)}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: activeVideoIndex === 1 ? 1 : 0,
          scale: activeVideoIndex === 1 ? 1 : 1.05
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        style={{ 
          zIndex: activeVideoIndex === 1 ? 2 : 1,
          pointerEvents: activeVideoIndex === 1 ? 'auto' : 'none'
        }}
      >
        Your browser does not support the video tag.
      </motion.video>

      {/* Loading Indicator - Only show during transitions */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full flex items-center space-x-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">Transitioning...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion Label */}
      <AnimatePresence mode="wait">
        {currentVideo && (
          <motion.div
            key={currentVideo.id}
            className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentVideo.emotion.charAt(0).toUpperCase() + currentVideo.emotion.slice(1)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Video Preview (optional debugging info) */}
      {nextVideo && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Loading: {nextVideo.emotion}
        </div>
      )}
    </div>
  );
}