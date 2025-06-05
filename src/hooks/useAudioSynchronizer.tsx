
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
      audio.src = character.audioTrack;
      
      // Add to map
      setAudioMap(prev => new Map(prev.set(character.id, audio)));
      
      console.log('Audio element created and added to map for:', character.name);
      
    } catch (error) {
      console.error('Error creating audio for:', character.name, error);
      toast.error(`Error creating audio for ${character.name}`);
    }
  };
  
  const removeTrack = (characterId: string) => {
    console.log('Removing track for character ID:', characterId);
    
    const audio = audioMap.get(characterId);
    if (audio) {
      try {
        // Simply pause and remove from map
        audio.pause();
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
    audioMap.forEach((audio, characterId) => {
      try {
        audio.volume = Math.max(0, Math.min(1, volume));
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
      audioMap.forEach((audio, characterId) => {
        try {
          audio.pause();
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
