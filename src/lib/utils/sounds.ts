// Sound effects utility using Web Audio API

export function playSuccessSound() {
    // Play a pleasant cha-ching/success sound
    try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.15; // Low volume (15%)
        gainNode.connect(audioContext.destination);

        // Create a pleasant coin/cha-ching sound with multiple tones
        const frequencies = [523, 659, 784]; // C5, E5, G5 - a major chord

        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const envelope = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

            envelope.gain.setValueAtTime(0, audioContext.currentTime);
            envelope.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
            envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.connect(envelope);
            envelope.connect(gainNode);

            const startDelay = index * 0.08; // Stagger each note
            oscillator.start(audioContext.currentTime + startDelay);
            oscillator.stop(audioContext.currentTime + startDelay + 0.4);
        });

        // High sparkle sound
        const sparkle = audioContext.createOscillator();
        const sparkleEnvelope = audioContext.createGain();

        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(1318, audioContext.currentTime + 0.2); // E6

        sparkleEnvelope.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
        sparkleEnvelope.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.22);
        sparkleEnvelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        sparkle.connect(sparkleEnvelope);
        sparkleEnvelope.connect(gainNode);
        sparkle.start(audioContext.currentTime + 0.2);
        sparkle.stop(audioContext.currentTime + 0.6);

    } catch (e) {
        // Silently fail if audio context is not supported
        console.log('Sound not supported:', e);
    }
}
