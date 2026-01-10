import useSound from 'use-sound';

export const useAddictiveSound = (
  url: string, 
  { volume = 0.5, playbackRate = 1, soundEnabled = true } = {}
) => {
  const [play, { stop }] = useSound(url, {
    volume,
    playbackRate,
    interrupt: true, // Allow rapid-fire re-triggering
  });

  const trigger = () => {
    if (!soundEnabled) return;
    // THE SECRET SAUCE: Randomize pitch slightly (0.95x to 1.05x)
    // This makes it feel "physical" and less robotic.
    const randomRate = playbackRate * (0.95 + Math.random() * 0.1);
    
    // We need to use the exposed 'sound' instance to tweak rate on the fly
    // or just rely on the base play if the library version is simple.
    // For simple use-sound, we often just play. 
    // Ideally, you'd pass { playbackRate: randomRate } to play(), 
    // but use-sound fits the rate at init. 
    // Workaround: We define a 'juicy' play function.
    play({ playbackRate: randomRate });
  };

  return [trigger, { stop }];
};