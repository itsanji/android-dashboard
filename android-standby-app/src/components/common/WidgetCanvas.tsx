import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { DraggableWidget } from './DraggableWidget';
import { useWidgets } from '../../context/WidgetContext';
import { COLORS } from '../../constants/theme';

interface WidgetCanvasProps {
  renderWidget: (widget: any) => React.ReactNode;
}

export const WidgetCanvas: React.FC<WidgetCanvasProps> = ({ renderWidget }) => {
  const { widgets, selectedWidgetId, background } = useWidgets();
  const { width, height } = Dimensions.get('window');

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
              <Video
                source={{ uri: background.uri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
              />
              {renderWidgets()}
            </View>
          );
        }
        break;
        
      case 'color':
      default:
        return (
          <View
            style={[
              styles.background,
              { backgroundColor: background.color || COLORS.background },
            ]}
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
    <View style={styles.canvasContainer}>
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

