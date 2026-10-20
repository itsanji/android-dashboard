import { useEffect, useState } from 'react';
import MediaSession, { MediaSessionState } from '../../modules/media-session';

interface Snapshot {
  state: MediaSessionState;
  receivedAt: number;
}

const readSnapshot = (): Snapshot | null =>
  MediaSession ? { state: MediaSession.getState(), receivedAt: Date.now() } : null;

/**
 * Live "now playing" info from other media apps plus a ticking playback
 * position. `isAvailable` is false when the native module isn't in the
 * build (e.g. Expo Go).
 */
export const useNowPlaying = () => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(readSnapshot);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!MediaSession) return;
    // Adding the first listener starts native observation, which also emits
    // the current state
    const subscription = MediaSession.addListener('onStateChange', (state) => {
      setSnapshot({ state, receivedAt: Date.now() });
    });
    return () => subscription.remove();
  }, []);

  const nowPlaying = snapshot?.state.nowPlaying ?? null;
  const isPlaying = nowPlaying?.isPlaying ?? false;

  // Tick once a second while playing so the progress bar moves
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  let positionMs: number | null = null;
  if (nowPlaying?.positionMs != null && snapshot) {
    const elapsed = isPlaying ? Math.max(0, now - snapshot.receivedAt) : 0;
    positionMs = nowPlaying.positionMs + elapsed * nowPlaying.playbackSpeed;
    if (nowPlaying.durationMs != null) {
      positionMs = Math.min(positionMs, nowPlaying.durationMs);
    }
  }

  return {
    isAvailable: MediaSession != null,
    hasPermission: snapshot?.state.hasPermission ?? false,
    nowPlaying,
    positionMs,
    controls: MediaSession,
  };
};
