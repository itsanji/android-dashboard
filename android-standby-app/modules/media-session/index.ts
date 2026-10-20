import { NativeModule, requireOptionalNativeModule } from 'expo';

/** What another app (Spotify, YouTube Music, ...) is currently playing */
export interface NowPlaying {
  packageName: string;
  appName: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  /** file:// URI of the album art, if the app provides one */
  artworkUri: string | null;
  durationMs: number | null;
  /** Position at the moment this snapshot was taken */
  positionMs: number | null;
  playbackSpeed: number;
  isPlaying: boolean;
  isBuffering: boolean;
  canSkipNext: boolean;
  canSkipPrevious: boolean;
  canSeek: boolean;
}

export interface MediaSessionState {
  /** Whether the user enabled notification access, which reading sessions requires */
  hasPermission: boolean;
  nowPlaying: NowPlaying | null;
}

type MediaSessionEvents = {
  /** Fired on track, playback or permission changes while a listener is attached */
  onStateChange: (state: MediaSessionState) => void;
};

declare class MediaSessionModule extends NativeModule<MediaSessionEvents> {
  hasPermission(): boolean;
  openPermissionSettings(): void;
  getState(): MediaSessionState;
  play(): void;
  pause(): void;
  togglePlayPause(): void;
  skipToNext(): void;
  skipToPrevious(): void;
  seekTo(positionMs: number): void;
}

/**
 * Native media session module (Android only). `null` when the native code
 * isn't in the build, e.g. in Expo Go, so callers can show a fallback.
 */
export default requireOptionalNativeModule<MediaSessionModule>('MediaSession');
