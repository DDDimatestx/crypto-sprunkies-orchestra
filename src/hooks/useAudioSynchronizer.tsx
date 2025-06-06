
import { useEffect, useState, useRef } from 'react';
import { Character } from '../types';
import { toast } from '@/components/ui/sonner';

export function useAudioSynchronizer() {
  const [audioMap, setAudioMap] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

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
    console.log('Adding track for character:', character.name);
    
    try {
      // Check if we already have this character's audio playing
      if (audioElementsRef.current.has(character.id)) {
        console.log('Track already exists for', character.name);
        return;
      }
      
      // Create new audio element
      const audio = new Audio();
      audio.src = character.audioTrack;
      audio.loop = true;
      
      // Store in our ref map for immediate access
      audioElementsRef.current.set(character.id, audio);
      
      // Add play event handler
      const playHandler = () => {
        console.log(`Playing audio for: ${character.name}`);
      };
      
      const errorHandler = (e: Event) => {
        console.error(`Audio error for ${character.name}:`, e);
        toast.error(`Audio error for ${character.name}`);
        
        // Remove from maps on error
        audioElementsRef.current.delete(character.id);
        setAudioMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(character.id);
          return newMap;
        });
      };
      
      // Add event listeners
      audio.addEventListener('play', playHandler);
      audio.addEventListener('error', errorHandler);
      
      // Play the audio
      try {
        await audio.play();
      } catch (playError) {
        console.error('Failed to play audio for:', character.name, playError);
        toast.error(`Failed to play audio for ${character.name}`);
        return;
      }
      
      // Update state with the new audio only after successfully playing
      setAudioMap(prev => {
        const newMap = new Map(prev);
        newMap.set(character.id, audio);
        return newMap;
      });
      
      console.log('Audio started playing for:', character.name);
    } catch (error) {
      console.error('Error setting up audio for:', character.name, error);
      toast.error(`Error setting up audio for ${character.name}`);
    }
  };
  
  const removeTrack = (characterId: string) => {
    console.log('Removing track for character ID:', characterId);
    
    // Get audio element from ref
    const audioElement = audioElementsRef.current.get(characterId);
    
    if (audioElement) {
      // Pause and reset the audio
      audioElement.pause();
      audioElement.currentTime = 0;
      
      // Remove event listeners to prevent memory leaks
      audioElement.onplay = null;
      audioElement.onerror = null;
      
      // Remove from both maps
      audioElementsRef.current.delete(characterId);
      setAudioMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(characterId);
        return newMap;
      });
      
      console.log('Successfully removed audio for character ID:', characterId);
    } else {
      console.warn('No audio found to remove for character ID:', characterId);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up all audio elements');
      audioElementsRef.current.forEach((audio) => {
        try {
          audio.pause();
          audio.onplay = null;
          audio.onerror = null;
        } catch (error) {
          console.error('Error during audio cleanup:', error);
        }
      });
      
      // Clear all maps
      audioElementsRef.current.clear();
      setAudioMap(new Map());
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
    isPlaying: tracks.some(track => track.isPlaying)
  };
}
