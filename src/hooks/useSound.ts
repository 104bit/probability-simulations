/* ============================================================
   useSound — Synthetic Sound Engine using Web Audio API
   ============================================================ */

import { useCallback, useState } from 'react';

// Tarayıcı güvenlik kuralları gereği, ses bağlamı (AudioContext)
// kullanıcı etkileşimi olmadan başlatılamaz.
// Bu yüzden singleton bir bağlamı lazy loading ile oluşturacağız.
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Local storage key for sound preference
const SOUND_PREF_KEY = 'paradoxes_sound_enabled';

export function useSound() {
  // Varsayılan olarak sesi açık başlat, localStorage'a bak
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_PREF_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_PREF_KEY, String(next));
      return next;
    });
  }, []);

  // Helper: Oscillator oluşturur
  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
      if (!isSoundEnabled) return;
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    },
    [isSoundEnabled]
  );

  // Buton tıklaması (hafif, kısa)
  const playClick = useCallback(() => {
    playTone(600, 'sine', 0.05, 0.05);
  }, [playTone]);

  // Başarı / Eşleşme (Yukarı doğru neşeli)
  const playSuccess = useCallback(() => {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); // C#
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, [isSoundEnabled]);

  // Hata / İflas (Aşağı doğru düşük ton)
  const playError = useCallback(() => {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [isSoundEnabled]);

  // Kapı açılma / Yeni kişi (Pop/Thump)
  const playPop = useCallback(() => {
    playTone(120, 'square', 0.1, 0.08);
  }, [playTone]);

  // Yazı Tura / Coin (Metalik çınlama)
  const playCoin = useCallback(() => {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Metalik akort
    osc1.frequency.setValueAtTime(1200, ctx.currentTime);
    osc2.frequency.setValueAtTime(2000, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  }, [isSoundEnabled]);

  return {
    isSoundEnabled,
    toggleSound,
    playClick,
    playSuccess,
    playError,
    playPop,
    playCoin,
  };
}
