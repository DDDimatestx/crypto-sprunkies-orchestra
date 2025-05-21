
import { Base } from '../types';

export const mockBases: Base[] = [
  {
    id: 'base-1',
    name: 'Crypto Beats',
    background: '/backgrounds/base-1-bg.jpg',
    characters: [
      {
        id: 'char-1',
        name: 'Bitcoin Drummer',
        image: '/characters/base-1/character-1.gif',
        audioTrack: '/audio/base-1/drums.mp3',
      },
      {
        id: 'char-2',
        name: 'Ethereum Synth',
        image: '/characters/base-1/character-2.gif',
        audioTrack: '/audio/base-1/synth.mp3',
      },
      {
        id: 'char-3',
        name: 'Dogecoin Bass',
        image: '/characters/base-1/character-3.gif',
        audioTrack: '/audio/base-1/drums.mp3', // Fallback to drums since bass.mp3 doesn't exist
      },
      {
        id: 'char-4',
        name: 'NFT Vocal',
        image: '/characters/base-1/character-4.gif',
        audioTrack: '/audio/base-1/synth.mp3', // Fallback to synth since vocal.mp3 doesn't exist
      },
      {
        id: 'char-5',
        name: 'Solana Beat',
        image: '/characters/base-1/character-1.gif',
        audioTrack: '/audio/base-1/drums.mp3',
      },
      {
        id: 'char-6',
        name: 'Cardano Melody',
        image: '/characters/base-1/character-2.gif',
        audioTrack: '/audio/base-1/synth.mp3',
      },
    ],
  },
  {
    id: 'base-2',
    name: 'Blockchain Lounge',
    background: '/backgrounds/base-2-bg.jpg',
    characters: [
      {
        id: 'char-7',
        name: 'Smart Contract Keys',
        image: '/characters/base-2/character-1.gif',
        audioTrack: '/audio/base-1/drums.mp3', // Fallback to base-1 audio
      },
      {
        id: 'char-8',
        name: 'Gas Fee Guitar',
        image: '/characters/base-2/character-2.gif',
        audioTrack: '/audio/base-1/synth.mp3', // Fallback to base-1 audio
      },
      {
        id: 'char-9',
        name: 'Altcoin Sax',
        image: '/characters/base-2/character-3.gif',
        audioTrack: '/audio/base-1/drums.mp3', // Fallback to base-1 audio
      },
      {
        id: 'char-10',
        name: 'Whale Trumpet',
        image: '/characters/base-2/character-4.gif',
        audioTrack: '/audio/base-1/synth.mp3', // Fallback to base-1 audio
      },
      {
        id: 'char-11',
        name: 'NFT Drums',
        image: '/characters/base-2/character-1.gif',
        audioTrack: '/audio/base-1/drums.mp3', // Fallback to base-1 audio
      },
      {
        id: 'char-12',
        name: 'Token Violin',
        image: '/characters/base-2/character-2.gif',
        audioTrack: '/audio/base-1/synth.mp3', // Fallback to base-1 audio
      },
    ],
  },
];
