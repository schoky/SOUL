let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (audioContext) {
    return audioContext;
  }

  const Ctor =
    window.AudioContext ??
    (
      window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!Ctor) {
    return null;
  }

  audioContext = new Ctor();

  return audioContext;
}

/**
 * Проигрывает короткий двухнотный сигнал
 * «Твой ход». Не бросает ошибок, если
 * AudioContext недоступен или заблокирован.
 */
export function playYourTurnSound(): void {
  try {
    const ctx = getAudioContext();

    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    const gain = ctx.createGain();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    gain.connect(ctx.destination);

    const tones = [659.25, 987.77];

    tones.forEach((frequency, index) => {
      const osc = ctx.createOscillator();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, now + index * 0.12);

      osc.connect(gain);
      osc.start(now + index * 0.12);
      osc.stop(now + 0.5);
    });
  } catch {
    // Ничего страшного, если звук не сработал —
    // важно, что UI продолжает работать.
  }
}
