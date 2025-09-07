'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaifuConversation } from "@/components/waifu-conversation";
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="h-screen w-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="h-full w-full flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut"
              }}
            >
              <Image
                src="/assets/anora.webp"
                alt="Loading"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <WaifuConversation />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}