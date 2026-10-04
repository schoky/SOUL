type SoundName =
  | "card-select"
  | "card-deselect"
  | "success"
  | "fail"
  | "risk-win"
  | "risk-lose"
  | "game-over"
  | "your-turn"
  | "notification";

type Tone = {
  frequency: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  volume?: number;
};

type SoundDefinition = {
  tones: Tone[];
  masterVolume: number;
};

const SOUND_DEFINITIONS: Record<SoundName, SoundDefinition> = {
  "card-select": {
    tones: [{ frequency: 880, duration: 0.06, type: "sine", volume: 1 }],
    masterVolume: 0.14,
  },

  "card-deselect": {
    tones: [{ frequency: 550, duration: 0.06, type: "sine", volume: 1 }],
    masterVolume: 0.11,
  },

  success: {
    tones: [
      { frequency: 523.25, duration: 0.12, type: "sine", volume: 0.7 },
      {
        frequency: 783.99,
        duration: 0.18,
        type: "sine",
        volume: 0.9,
        delay: 0.1,
      },
    ],
    masterVolume: 0.18,
  },

  fail: {
    tones: [
      { frequency: 392, duration: 0.15, type: "triangle", volume: 0.8 },
      {
        frequency: 196,
        duration: 0.25,
        type: "triangle",
        volume: 0.9,
        delay: 0.1,
      },
    ],
    masterVolume: 0.18,
  },

  "risk-win": {
    tones: [
      { frequency: 523.25, duration: 0.08, type: "sine", volume: 0.6 },
      {
        frequency: 659.25,
        duration: 0.08,
        type: "sine",
        volume: 0.7,
        delay: 0.07,
      },
      {
        frequency: 783.99,
        duration: 0.08,
        type: "sine",
        volume: 0.8,
        delay: 0.14,
      },
      {
        frequency: 1046.5,
        duration: 0.25,
        type: "sine",
        volume: 1,
        delay: 0.21,
      },
    ],
    masterVolume: 0.22,
  },

  "risk-lose": {
    tones: [
      { frequency: 220, duration: 0.2, type: "sawtooth", volume: 0.55 },
      {
        frequency: 180,
        duration: 0.3,
        type: "sawtooth",
        volume: 0.75,
        delay: 0.15,
      },
    ],
    masterVolume: 0.13,
  },

  "game-over": {
    tones: [
      { frequency: 523.25, duration: 0.15, type: "sine", volume: 0.7 },
      {
        frequency: 659.25,
        duration: 0.15,
        type: "sine",
        volume: 0.8,
        delay: 0.13,
      },
      {
        frequency: 783.99,
        duration: 0.15,
        type: "sine",
        volume: 0.9,
        delay: 0.26,
      },
      {
        frequency: 1046.5,
        duration: 0.4,
        type: "sine",
        volume: 1,
        delay: 0.39,
      },
    ],
    masterVolume: 0.22,
  },

  "your-turn": {
    tones: [
      { frequency: 659.25, duration: 0.12, type: "sine", volume: 0.7 },
      {
        frequency: 987.77,
        duration: 0.3,
        type: "sine",
        volume: 0.9,
        delay: 0.12,
      },
    ],
    masterVolume: 0.16,
  },

  notification: {
    tones: [
      { frequency: 880, duration: 0.08, type: "sine", volume: 0.5 },
      {
        frequency: 1174.66,
        duration: 0.14,
        type: "sine",
        volume: 0.7,
        delay: 0.1,
      },
    ],
    masterVolume: 0.14,
  },
};

const STORAGE_KEY = "soul:sounds-enabled";

let audioContext: AudioContext | null = null;

let enabled = true;

try {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored !== null) {
    enabled = stored === "true";
  }
} catch {
  // localStorage недоступен — оставляем по умолчанию.
}

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

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;

  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

export function playSound(name: SoundName): void {
  if (!enabled) {
    return;
  }

  try {
    const ctx = getAudioContext();

    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const definition = SOUND_DEFINITIONS[name];

    const now = ctx.currentTime;

    const masterGain = ctx.createGain();

    masterGain.gain.setValueAtTime(definition.masterVolume, now);

    masterGain.connect(ctx.destination);

    for (const tone of definition.tones) {
      const startAt = now + (tone.delay ?? 0);

      const endAt = startAt + tone.duration;

      const osc = ctx.createOscillator();

      osc.type = tone.type ?? "sine";

      osc.frequency.setValueAtTime(tone.frequency, startAt);

      const envelope = ctx.createGain();

      const peak = tone.volume ?? 1;

      envelope.gain.setValueAtTime(0.0001, startAt);

      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, peak),
        startAt + 0.02,
      );

      envelope.gain.exponentialRampToValueAtTime(0.0001, endAt);

      osc.connect(envelope);
      envelope.connect(masterGain);

      osc.start(startAt);
      osc.stop(endAt);
    }

    setTimeout(() => {
      try {
        masterGain.disconnect();
      } catch {
        // ignore
      }
    }, 2000);
  } catch {
    // Никогда не падаем из-за звука.
  }
}

export function preloadSounds(): void {
  const ctx = getAudioContext();

  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
}

export function playYourTurnSound(): void {
  playSound("your-turn");
}
