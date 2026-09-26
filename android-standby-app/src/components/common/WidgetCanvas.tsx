import React from 'react';
import { View, StyleSheet, ImageBackground, LayoutChangeEvent } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { DraggableWidget } from './DraggableWidget';
import { useWidgets } from '../../context/WidgetContext';
import { COLORS } from '../../constants/theme';
import { Widget } from '../../types';

/**
 * Muted, looping, full-bleed video background
 */
const BackgroundVideo: React.FC<{ uri: string }> = ({ uri }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
};

interface WidgetCanvasProps {
  renderWidget: (widget: Widget) => React.ReactNode;
}

export const WidgetCanvas: React.FC<WidgetCanvasProps> = ({ renderWidget }) => {
  const { widgets, selectedWidgetId, background, selectWidget, setCanvasSize } = useWidgets();

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  const renderBackground = () => {
    switch (background.type) {
      case 'image':
        if (background.uri) {
          return (
            <ImageBackground
              source={{ uri: background.uri }}
              style={styles.background}
              resizeMode="cover"
            >
              {renderWidgets()}
            </ImageBackground>
          );
        }
        break;

      case 'video':
        if (background.uri) {
          return (
            <View style={styles.background}>
              <BackgroundVideo uri={background.uri} />
              {renderWidgets()}
            </View>
          );
        }
        break;

      case 'color':
      default:
        return (
          <View
            style={[styles.background, { backgroundColor: background.color || COLORS.background }]}
          >
            {renderWidgets()}
          </View>
        );
    }

    return (
      <View style={[styles.background, { backgroundColor: COLORS.background }]}>
        {renderWidgets()}
      </View>
    );
  };

  const renderWidgets = () => (
    <View
      style={styles.canvasContainer}
      onLayout={handleLayout}
      // Tapping empty canvas (not a widget) clears the selection
      onStartShouldSetResponder={() => true}
      onResponderRelease={() => selectWidget(null)}
    >
      {/* Sort widgets by z-index */}
      {[...widgets]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((widget) => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            isSelected={widget.id === selectedWidgetId}
          >
            {renderWidget(widget)}
          </DraggableWidget>
        ))}
    </View>
  );

  return <View style={styles.container}>{renderBackground()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
});
