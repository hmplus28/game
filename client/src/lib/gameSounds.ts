/** Lightweight Web Audio cues: zero external files, enabled only after user interaction. */
export type GameSound = "roll" | "step" | "ladder" | "snake" | "win" | "blocked";

let audioContext: AudioContext | null = null;

function context() {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(frequency: number, duration: number, volume: number, offset = 0, type: OscillatorType = "sine") {
  const ctx = context();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + offset);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + offset + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(ctx.currentTime + offset);
  oscillator.stop(ctx.currentTime + offset + duration + 0.02);
}

export function playGameSound(sound: GameSound, enabled: boolean) {
  if (!enabled) return;
  if (sound === "roll") { tone(140, 0.09, 0.035, 0, "square"); tone(220, 0.09, 0.03, 0.09, "square"); tone(160, 0.12, 0.04, 0.18, "square"); }
  if (sound === "step") tone(360, 0.05, 0.018, 0, "sine");
  if (sound === "ladder") { tone(460, 0.1, 0.05, 0); tone(660, 0.1, 0.05, 0.11); tone(880, 0.18, 0.055, 0.22); }
  if (sound === "snake") { tone(330, 0.13, 0.045, 0, "sawtooth"); tone(215, 0.13, 0.04, 0.12, "sawtooth"); tone(125, 0.18, 0.035, 0.24, "sawtooth"); }
  if (sound === "win") { tone(523, 0.11, 0.06, 0); tone(659, 0.11, 0.06, 0.12); tone(784, 0.11, 0.06, 0.24); tone(1047, 0.25, 0.06, 0.36); }
  if (sound === "blocked") tone(125, 0.15, 0.04, 0, "triangle");
}
