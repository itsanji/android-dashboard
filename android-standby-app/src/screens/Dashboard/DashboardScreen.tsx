import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Button, Card } from '../../components/ui';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { useFoldState } from '../../hooks/useFoldState';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { width, height, screenSize, isPortrait } = useScreenDimensions();
  const { isFoldable, screenMode } = useFoldState();

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>
                {width.toFixed(0)} x {height.toFixed(0)} • {screenSize.toUpperCase()}
                {isFoldable && ` • ${screenMode.toUpperCase()}`}
              </Text>
            </View>
            <Button title="Settings" size="small" onPress={handleSettingsPress} />
          </View>
        </View>

        {/* Widget Area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.widgetContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>📱 Welcome to Dashboard</Text>
            <Text style={styles.cardText}>
              This is your customizable dashboard where widgets will be displayed.
            </Text>
            <Text style={styles.cardText}>
              • Add widgets from Settings
            </Text>
            <Text style={styles.cardText}>
              • Customize their position and appearance
            </Text>
            <Text style={styles.cardText}>
              • Set a custom background (image or video)
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Screen Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Orientation:</Text>
              <Text style={styles.infoValue}>
                {isPortrait ? 'Portrait' : 'Landscape'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Screen Size:</Text>
              <Text style={styles.infoValue}>{screenSize.toUpperCase()}</Text>
            </View>
            {isFoldable && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fold State:</Text>
                <Text style={[styles.infoValue, styles.highlight]}>
                  {screenMode.toUpperCase()}
                </Text>
              </View>
            )}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
            <Button
              title="Go to Settings"
              variant="outline"
              onPress={handleSettingsPress}
              fullWidth
              style={styles.actionButton}
            />
            <Text style={styles.helperText}>
              Tap to add and configure widgets for your dashboard
            </Text>
          </Card>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  widgetContainer: {
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  cardText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
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
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  helperText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

