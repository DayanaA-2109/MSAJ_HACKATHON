// src/lib/audio-manager.ts

/**
 * Stops all currently playing audio across the application.
 * Pauses all HTML5 <audio> elements in the DOM, resets their time to 0,
 * cancels any Web Speech Synthesis utterance, and fires a custom event
 * for React components managing audio state.
 */
export function stopAllAudio(): void {
  if (typeof window === "undefined") return;

  // 1. Immediately pause and reset all <audio> elements in the DOM
  try {
    const audios = document.querySelectorAll("audio");
    audios.forEach((audio) => {
      try {
        if (!audio.paused) {
          audio.pause();
        }
        audio.currentTime = 0;
      } catch (err) {
        console.warn("Could not pause audio element:", err);
      }
    });
  } catch (err) {
    console.warn("Error querying audio elements:", err);
  }

  // 2. Stop Web Speech Synthesis if running
  try {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    console.warn("Error cancelling speech synthesis:", err);
  }

  // 3. Dispatch global custom event for React components holding refs or custom state
  try {
    window.dispatchEvent(new CustomEvent("tamil-thadam:stop-all-audio"));
  } catch (err) {
    console.warn("Error dispatching stop audio event:", err);
  }
}
