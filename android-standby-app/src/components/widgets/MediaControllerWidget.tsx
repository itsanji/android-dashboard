import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MediaControllerWidget as MediaControllerWidgetData } from '../../types';
import { useNowPlaying } from '../../hooks/useNowPlaying';
import { COLORS, TYPOGRAPHY, TOUCH_TARGET_SIZE } from '../../constants/theme';

interface MediaControllerWidgetProps {
  widget: MediaControllerWidgetData;
}

// Material icon paths (24x24 viewBox)
const ICONS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
  previous: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
};

// Below these sizes the widget switches to more compact layouts
const COMPACT_WIDTH = 240;
const COMPACT_HEIGHT = 220;
const SINGLE_ROW_HEIGHT = 150;

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const ControlButton: React.FC<{
  icon: keyof typeof ICONS;
  onPress: () => void;
  color: string;
  size?: number;
  disabled?: boolean;
  label: string;
}> = ({ icon, onPress, color, size = 28, disabled = false, label }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [styles.controlButton, { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }]}
  >
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={ICONS[icon]} fill={color} />
    </Svg>
  </Pressable>
);

const Artwork: React.FC<{ uri: string | null; size: number; color: string }> = ({
  uri,
  size,
  color,
}) =>
  uri ? (
    <Image source={{ uri }} style={[styles.artwork, { width: size, height: size }]} />
  ) : (
    <View style={[styles.artwork, styles.artworkPlaceholder, { width: size, height: size }]}>
      <Text style={{ fontSize: size * 0.4, color }}>♪</Text>
    </View>
  );

export const MediaControllerWidget: React.FC<MediaControllerWidgetProps> = ({ widget }) => {
  const { isAvailable, hasPermission, nowPlaying, positionMs, controls } = useNowPlaying();
  const color = widget.style?.textColor ?? COLORS.text.primary;
  const { width, height } = widget.position;
  const showArt = widget.config?.showAlbumArt ?? true;
  const compact =
    (widget.config?.compactMode ?? false) || width < COMPACT_WIDTH || height < COMPACT_HEIGHT;

  if (!isAvailable || !controls) {
    return (
      <View style={styles.message}>
        <Text style={[styles.messageText, { color }]}>
          Media controls need a development build (not Expo Go)
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.message}>
        <Text style={[styles.messageText, { color }]} numberOfLines={3}>
          Allow notification access to show what&apos;s playing
        </Text>
        <Pressable
          onPress={() => controls.openPermissionSettings()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.grantButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.grantButtonText}>Allow access</Text>
        </Pressable>
      </View>
    );
  }

  if (!nowPlaying) {
    return (
      <View style={styles.message}>
        <Text style={[styles.idleIcon, { color }]}>♪</Text>
        <Text style={[styles.messageText, { color }]}>Nothing playing</Text>
      </View>
    );
  }

  const title = nowPlaying.title ?? 'Unknown title';
  const subtitle = nowPlaying.artist ?? nowPlaying.appName;

  const playPause = (
    <ControlButton
      icon={nowPlaying.isPlaying ? 'pause' : 'play'}
      label={nowPlaying.isPlaying ? 'Pause' : 'Play'}
      onPress={() => controls.togglePlayPause()}
      color={color}
      size={compact ? 32 : 40}
    />
  );

  const controlRow = (
    <View style={styles.controls}>
      <ControlButton
        icon="previous"
        label="Previous"
        onPress={() => controls.skipToPrevious()}
        disabled={!nowPlaying.canSkipPrevious}
        color={color}
      />
      {playPause}
      <ControlButton
        icon="next"
        label="Next"
        onPress={() => controls.skipToNext()}
        disabled={!nowPlaying.canSkipNext}
        color={color}
      />
    </View>
  );

  const info = (
    <View style={styles.info}>
      <Text style={[styles.title, { color }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );

  // Very short widget: everything on one row
  if (height < SINGLE_ROW_HEIGHT) {
    return (
      <View style={styles.row}>
        {showArt && <Artwork uri={nowPlaying.artworkUri} size={40} color={color} />}
        {info}
        {playPause}
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compact}>
        <View style={styles.row}>
          {showArt && <Artwork uri={nowPlaying.artworkUri} size={48} color={color} />}
          {info}
        </View>
        {controlRow}
      </View>
    );
  }

  const progress =
    nowPlaying.durationMs && positionMs != null ? positionMs / nowPlaying.durationMs : null;
  const artSize = Math.min(width, height) * 0.4;

  return (
    <View style={styles.full}>
      {showArt && <Artwork uri={nowPlaying.artworkUri} size={artSize} color={color} />}
      <View style={styles.fullInfo}>
        <Text style={[styles.title, styles.centered, { color }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, styles.centered, { color }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {progress != null && nowPlaying.durationMs != null && positionMs != null && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[StyleSheet.absoluteFill, styles.trackBackground, { backgroundColor: color }]}
            />
            <View
              style={[
                styles.progressFill,
                { backgroundColor: color, width: `${Math.min(100, progress * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.times}>
            <Text style={[styles.time, { color }]}>{formatTime(positionMs)}</Text>
            <Text style={[styles.time, { color }]}>{formatTime(nowPlaying.durationMs)}</Text>
          </View>
        </View>
      )}
      {controlRow}
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    ...TYPOGRAPHY.body2,
    textAlign: 'center',
    opacity: 0.8,
  },
  idleIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 40,
    justifyContent: 'center',
  },
  grantButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullInfo: {
    alignSelf: 'stretch',
  },
  compact: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    opacity: 0.7,
  },
  centered: {
    textAlign: 'center',
  },
  artwork: {
    borderRadius: 8,
  },
  artworkPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignSelf: 'stretch',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackBackground: {
    // Faded text color, so it follows custom widget text colors
    opacity: 0.25,
  },
  progressFill: {
    height: '100%',
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    ...TYPOGRAPHY.caption,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
