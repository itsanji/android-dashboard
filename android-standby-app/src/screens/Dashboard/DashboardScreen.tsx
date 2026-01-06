import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from '../../components/ui';
import { WidgetCanvas } from '../../components/common/WidgetCanvas';
import { PlaceholderWidget } from '../../components/widgets';
import { useWidgets } from '../../context/WidgetContext';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Widget } from '../../types';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { widgets } = useWidgets();

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const renderWidget = (widget: Widget) => {
    // For now, render placeholder for all widgets
    // Will be replaced with actual widget implementations
    return <PlaceholderWidget widget={widget} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Floating Settings Button */}
        <View style={styles.floatingButton}>
          <IconButton
            onPress={handleSettingsPress}
            size={56}
            backgroundColor={COLORS.primary}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </IconButton>
        </View>

        {/* Widget Canvas */}
        <WidgetCanvas renderWidget={renderWidget} />

        {/* Empty State */}
        {widgets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>No Widgets Yet</Text>
            <Text style={styles.emptyText}>
              Tap the settings button to add widgets to your dashboard
            </Text>
          </View>
        )}
      </View>
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
  floatingButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsIcon: {
    fontSize: 28,
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    pointerEvents: 'none',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});

