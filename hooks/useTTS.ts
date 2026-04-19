import { useState, useRef, useCallback } from 'react';

interface UseTtsResult {
  isAudioPlaying: boolean;
  isAudioLoading: boolean;
  playAudio: (text: string, onStart?: () => void, onEnd?: () => void) => Promise<void>;
  stopAudio: () => void;
}

export function useTTS(): UseTtsResult {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
  }, []);

  const playAudio = useCallback(async (text: string, onStart?: () => void, onEnd?: () => void) => {
    try {
      setIsAudioLoading(true);
      stopAudio(); // Stop any currently playing audio immediately

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio stream natively');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsAudioPlaying(true);
        setIsAudioLoading(false);
        if (onStart) onStart();
      };

      audio.onended = () => {
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl); // Destroy dynamically loaded URL to prevent memory leaks!
        if (onEnd) onEnd();
      };
      
      audio.onerror = () => {
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error safely ignored natively:', error);
      setIsAudioLoading(false);
      setIsAudioPlaying(false);
      if (onEnd) onEnd();
    }
  }, [stopAudio]);

  return { isAudioPlaying, isAudioLoading, playAudio, stopAudio };
}
