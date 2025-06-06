import { useEffect, useState, useRef } from 'react';
import { Character } from '../types';
import { toast } from '@/components/ui/sonner';

export function useAudioSynchronizer() {
  const [audioMap, setAudioMap] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const audioMapRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (isInitialized) return;
      console.log('Audio system initialized');
      setIsInitialized(true);
    };
    
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => document.addEventListener(event, initAudio, { once: true }));
    
    return () => {
      events.forEach(event => document.removeEventListener(event, initAudio));
    };
  }, [isInitialized]);

  // Keep a ref to the current audioMap to use in event listeners
  useEffect(() => {
    audioMapRef.current = audioMap;
  }, [audioMap]);

  const addTrack = async (character: Character) => {
    console.log('Adding track for character:', character.name, 'with audio:', character.audioTrack);
    
    // Check if track already exists
    if (audioMap.has(character.id)) {
      console.log('Track already exists for this character, skipping');
      return;
    }
    
    try {
      // Create new audio element for this character
      const audio = new Audio();
      
      // Set up event listeners before setting src
      audio.addEventListener('canplaythrough', async () => {
        console.log('Audio loaded and can play through for:', character.name);
        try {
          await audio.play();
          console.log('Started playing audio for:', character.name);
        } catch (playError) {
          console.error('Error playing audio for:', character.name, playError);
          toast.error(`Failed to play audio for ${character.name}`);
        }
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Audio error for ${character.name}:`, e);
        toast.error(`Audio error for ${character.name}`);
        
        // Remove from map on error
        setAudioMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(character.id);
          return newMap;
        });
      });
      
      // Set audio properties
      audio.loop = true;
      audio.volume = 0.7;
      audio.preload = 'auto';
      
      // Add to map first, then set src to avoid race conditions
      setAudioMap(prev => new Map(prev.set(character.id, audio)));
      
      // Now set the source
      audio.src = character.audioTrack;
      
      console.log('Audio element created and added to map for:', character.name);
      
    } catch (error) {
      console.error('Error creating audio for:', character.name, error);
      toast.error(`Error creating audio for ${character.name}`);
    }
  };
  
  const removeTrack = (characterId: string) => {
    console.log('Removing track for character ID:', characterId);
    
    // Use the ref to get the current audio map
    const audio = audioMapRef.current.get(characterId);
    if (audio) {
      try {
        // First pause the audio
        audio.pause();
        
        // Then remove all event listeners to prevent future callbacks
        audio.oncanplaythrough = null;
        audio.onerror = null;
        audio.onended = null;
        
        // Reset the audio element
        audio.currentTime = 0;
        
        console.log('Successfully stopped audio for character ID:', characterId);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
      
      // Remove from map
      setAudioMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(characterId);
        return newMap;
      });
    } else {
      console.log('No audio found for character ID:', characterId);
    }
  };
  
  const setVolume = (volume: number) => {
    console.log('Setting volume to:', volume);
    
    // Use the ref to get the current audio map
    audioMapRef.current.forEach((audio, characterId) => {
      try {
        const safeVolume = Math.max(0, Math.min(1, volume));
        audio.volume = safeVolume;
        console.log('Volume set for character:', characterId, 'to:', audio.volume);
      } catch (error) {
        console.error('Error setting volume for character:', characterId, error);
      }
    });
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up audio synchronizer');
      audioMapRef.current.forEach((audio, characterId) => {
        try {
          audio.pause();
          audio.src = '';
        } catch (error) {
          console.error('Error during cleanup for character:', characterId, error);
        }
      });
    };
  }, []);
  
  // Convert map to tracks array for compatibility
  const tracks = Array.from(audioMap.entries()).map(([characterId, audio]) => ({
    character: { id: characterId } as Character,
    audio,
    isPlaying: !audio.paused
  }));
  
  return {
    tracks,
    addTrack,
    removeTrack,
    setVolume,
    isPlaying: tracks.some(track => track.isPlaying)
  };
}
