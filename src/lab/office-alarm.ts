export function officeAlarm() {
  let audio: { context: AudioContext; volume: GainNode } | undefined;
  let audible = false;

  function setLevel() {
    if (!audio) return;
    const { context, volume } = audio;
    volume.gain.setTargetAtTime(audible ? .045 : 0, context.currentTime, .08);
  }

  return {
    unlock() {
      if (!window.AudioContext) return;
      if (!audio) {
        const context = new window.AudioContext();
        const volume = context.createGain();
        volume.gain.value = 0;
        volume.connect(context.destination);
        const tone = context.createOscillator();
        tone.type = 'triangle';
        tone.frequency.value = 560;
        tone.connect(volume);
        const sweep = context.createOscillator();
        const frequencyRange = context.createGain();
        sweep.frequency.value = .88;
        frequencyRange.gain.value = 140;
        sweep.connect(frequencyRange).connect(tone.frequency);
        sweep.start();
        tone.start();
        audio = { context, volume };
        setLevel();
      }
      if (audio.context.state !== 'running') void audio.context.resume().catch(() => {});
    },
    setAudible(value: boolean) {
      if (value === audible) return;
      audible = value;
      setLevel();
    },
  };
}
