
import { useEffect, useState } from 'react';
import { Character } from '../types';
import { toast } from '@/components/ui/sonner';

export function useAudioSynchronizer() {
  const [audioMap, setAudioMap] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

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
      audio.addEventListener('loadstart', () => {
        console.log('Loading started for:', character.name);
      });
      
      audio.addEventListener('canplay', () => {
        console.log('Audio can play for:', character.name);
      });
      
      audio.addEventListener('canplaythrough', async () => {
        console.log('Audio loaded and can play through for:', character.name);
        try {
          await audio.play();
          console.log('Started playing audio for:', character.name);
        } catch (playError) {
          console.error('Error playing audio for:', character.name, playError);
          toast.error(`Failed to play audio for ${character.name}: ${playError.message}`);
        }
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Audio error for ${character.name}:`, e);
        console.error('Audio error details:', audio.error);
        if (audio.error) {
          console.error('Error code:', audio.error.code);
          console.error('Error message:', audio.error.message);
        }
        toast.error(`Audio error for ${character.name}: Unable to load audio file`);
        
        // Remove from map on error
        setAudioMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(character.id);
          return newMap;
        });
      });
      
      audio.addEventListener('loadeddata', () => {
        console.log('Audio data loaded for:', character.name);
      });
      
      // Set audio properties
      audio.loop = true;
      audio.volume = 0.7;
      audio.preload = 'auto';
      
      // Add to map before setting src
      setAudioMap(prev => new Map(prev.set(character.id, audio)));
      
      // Set src and load
      console.log('Setting audio src to:', character.audioTrack);
      audio.src = character.audioTrack;
      audio.load();
      
    } catch (error) {
      console.error('Error creating audio for:', character.name, error);
      toast.error(`Error creating audio for ${character.name}: ${error.message}`);
    }
  };
  
  const removeTrack = (characterId: string) => {
    console.log('Removing track for character ID:', characterId);
    
    const audio = audioMap.get(characterId);
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        // Don't set src to empty string as it causes errors
        console.log('Stopped audio for character ID:', characterId);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
      
      // Remove from map
      setAudioMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(characterId);
        return newMap;
      });
    }
  };
  
  const setVolume = (volume: number) => {
    audioMap.forEach((audio, characterId) => {
      try {
        audio.volume = volume;
      } catch (error) {
        console.error('Error setting volume for character:', characterId, error);
      }
    });
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up audio synchronizer');
      audioMap.forEach((audio, characterId) => {
        try {
          audio.pause();
          audio.currentTime = 0;
          // Don't clear src during cleanup to avoid errors
        } catch (error) {
          console.error('Error during cleanup for character:', characterId, error);
        }
      });
    };
  }, [audioMap]);
  
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
