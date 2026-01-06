import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, IconButton, Modal } from '../components/ui';
import { useScreenDimensions } from '../hooks/useScreenDimensions';
import { useFoldState } from '../hooks/useFoldState';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const DemoScreen: React.FC = () => {
  const screenDimensions = useScreenDimensions();
  const foldState = useFoldState();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Android Standby Mode</Text>
          <Text style={styles.subtitle}>Responsive Component Demo</Text>
        </View>

        {/* Screen Info Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📱 Screen Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Width:</Text>
            <Text style={styles.infoValue}>{Math.round(screenDimensions.width)}dp</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height:</Text>
            <Text style={styles.infoValue}>{Math.round(screenDimensions.height)}dp</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Screen Size:</Text>
            <Text style={styles.infoValue}>{screenDimensions.screenSize.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Orientation:</Text>
            <Text style={styles.infoValue}>
              {screenDimensions.isPortrait ? 'Portrait' : 'Landscape'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Is Tablet:</Text>
            <Text style={styles.infoValue}>{screenDimensions.isTablet ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Is Foldable:</Text>
            <Text style={styles.infoValue}>{screenDimensions.isFoldable ? 'Yes' : 'No'}</Text>
          </View>
        </Card>

        {/* Foldable Info Card (only shown on foldable devices) */}
        {foldState.isFoldable && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>📲 Foldable Device Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>State:</Text>
              <Text style={[styles.infoValue, styles.highlight]}>
                {foldState.screenMode.toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Is Folded:</Text>
              <Text style={styles.infoValue}>{foldState.isFolded ? 'Yes ⬆️' : 'No ⬇️'}</Text>
            </View>
            <Text style={styles.foldInfo}>
              {foldState.isFolded
                ? '📱 Device is in folded state (compact mode)'
                : '📱 Device is unfolded (full screen mode)'}
            </Text>
          </Card>
        )}

        {/* Button Showcase */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>🔘 Responsive Buttons</Text>
          
          <Text style={styles.sectionLabel}>Primary Buttons:</Text>
          <View style={styles.buttonRow}>
            <Button title="Small" size="small" onPress={handleButtonPress} />
            <Button title="Medium" size="medium" onPress={handleButtonPress} />
            <Button title="Large" size="large" onPress={handleButtonPress} />
          </View>

          <Text style={styles.sectionLabel}>Button Variants:</Text>
          <Button
            title="Primary Button"
            variant="primary"
            onPress={handleButtonPress}
            style={styles.buttonSpacing}
            fullWidth
          />
          <Button
            title="Secondary Button"
            variant="secondary"
            onPress={handleButtonPress}
            style={styles.buttonSpacing}
            fullWidth
          />
          <Button
            title="Outline Button"
            variant="outline"
            onPress={handleButtonPress}
            style={styles.buttonSpacing}
            fullWidth
          />
          <Button
            title="Loading Button"
            variant="primary"
            onPress={handleButtonPress}
            loading={loading}
            style={styles.buttonSpacing}
            fullWidth
          />
          <Button
            title="Disabled Button"
            variant="primary"
            onPress={handleButtonPress}
            disabled
            fullWidth
          />
        </Card>

        {/* Icon Buttons */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>⭕ Icon Buttons</Text>
          <View style={styles.iconButtonRow}>
            <IconButton onPress={() => console.log('Icon 1')}>
              <Text style={styles.iconText}>🏠</Text>
            </IconButton>
            <IconButton onPress={() => console.log('Icon 2')} backgroundColor={COLORS.primary}>
              <Text style={styles.iconText}>⚙️</Text>
            </IconButton>
            <IconButton onPress={() => console.log('Icon 3')} size={60}>
              <Text style={[styles.iconText, { fontSize: 28 }]}>⭐</Text>
            </IconButton>
            <IconButton
              onPress={() => console.log('Icon 4')}
              backgroundColor={COLORS.secondary}
            >
              <Text style={styles.iconText}>❤️</Text>
            </IconButton>
          </View>
        </Card>

        {/* Modal Demo */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>🪟 Modal Demo</Text>
          <Text style={styles.description}>
            Modal adapts its width based on screen size. Try it in folded and unfolded states!
          </Text>
          <Button title="Open Modal" onPress={() => setModalVisible(true)} fullWidth />
        </Card>

        {/* Grid Preview */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📐 Grid System</Text>
          <View style={styles.gridPreview}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <View key={num} style={styles.gridCell}>
                <Text style={styles.gridCellText}>{num}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.gridInfo}>
            Grid adapts to screen size: {screenDimensions.screenSize === 'xs' && '2 columns'}
            {screenDimensions.screenSize === 'sm' && '3 columns'}
            {screenDimensions.screenSize === 'md' && '4 columns'}
            {screenDimensions.screenSize === 'lg' && '5 columns'}
            {screenDimensions.screenSize === 'xl' && '6 columns'}
          </Text>
        </Card>

        {/* Device Dimensions */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📏 Raw Dimensions</Text>
          <Text style={styles.rawData}>
            {JSON.stringify(
              {
                width: Math.round(screenDimensions.width),
                height: Math.round(screenDimensions.height),
                scale: screenDimensions.scale,
                fontScale: screenDimensions.fontScale,
              },
              null,
              2
            )}
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={styles.modalTitle}>Responsive Modal</Text>
        <Text style={styles.modalText}>
          This modal automatically adjusts its width based on your screen size:
        </Text>
        <View style={styles.modalInfo}>
          <Text style={styles.modalInfoText}>• Small phones: 90% width</Text>
          <Text style={styles.modalInfoText}>• Regular phones: 90% width</Text>
          <Text style={styles.modalInfoText}>• Large phones/tablets: 70% width</Text>
          <Text style={styles.modalInfoText}>• Tablets/Unfolded: Max 600dp</Text>
        </View>
        <Text style={styles.modalText}>
          Current screen: <Text style={styles.highlight}>{screenDimensions.screenSize}</Text>
        </Text>
        <Button title="Close Modal" onPress={() => setModalVisible(false)} fullWidth />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  infoValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  highlight: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  foldInfo: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  sectionLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  buttonSpacing: {
    marginBottom: SPACING.sm,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  iconText: {
    fontSize: 24,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  gridPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  gridCell: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCellText: {
    color: COLORS.onPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  gridInfo: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  rawData: {
    ...TYPOGRAPHY.body2,
    color: COLORS.secondary,
    fontFamily: 'monospace',
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  modalText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  modalInfo: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  modalInfoText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
});

