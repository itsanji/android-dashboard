import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, IconButton } from '../../components/ui';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { WidgetType } from '../../types';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const AVAILABLE_WIDGETS = [
  { type: WidgetType.CALENDAR, icon: '📅', name: 'Calendar', description: 'View your events' },
  { type: WidgetType.WEATHER, icon: '🌤️', name: 'Weather', description: 'Current weather' },
  {
    type: WidgetType.MEDIA_CONTROLLER,
    icon: '🎵',
    name: 'Media',
    description: 'Control playback',
  },
  { type: WidgetType.CUSTOM_TEXT, icon: '✏️', name: 'Text', description: 'Custom notes' },
  { type: WidgetType.CLOCK, icon: '🕐', name: 'Clock', description: 'Time display' },
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { screenSize, isTablet } = useScreenDimensions();
  const [activeTab, setActiveTab] = useState<'widgets' | 'added'>('widgets');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddWidget = (widgetType: WidgetType) => {
    console.log('Add widget:', widgetType);
    // TODO: Implement widget addition logic
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <IconButton onPress={handleBackPress} size={40}>
                <Text style={styles.backIcon}>←</Text>
              </IconButton>
              <View>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Configure your dashboard</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Button
            title="Available Widgets"
            variant={activeTab === 'widgets' ? 'primary' : 'outline'}
            onPress={() => setActiveTab('widgets')}
            style={styles.tabButton}
          />
          <Button
            title="Added Widgets"
            variant={activeTab === 'added' ? 'primary' : 'outline'}
            onPress={() => setActiveTab('added')}
            style={styles.tabButton}
          />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'widgets' ? (
            <>
              <Text style={styles.sectionTitle}>🎨 Add Widgets to Dashboard</Text>
              <Text style={styles.sectionDescription}>
                Choose from available widgets to customize your dashboard
              </Text>

              {AVAILABLE_WIDGETS.map((widget) => (
                <Card key={widget.type} style={styles.widgetCard}>
                  <View style={styles.widgetRow}>
                    <View style={styles.widgetInfo}>
                      <Text style={styles.widgetIcon}>{widget.icon}</Text>
                      <View style={styles.widgetDetails}>
                        <Text style={styles.widgetName}>{widget.name}</Text>
                        <Text style={styles.widgetDescription}>{widget.description}</Text>
                      </View>
                    </View>
                    <Button
                      title="Add"
                      size="small"
                      onPress={() => handleAddWidget(widget.type)}
                    />
                  </View>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>📋 Your Widgets</Text>
              <Text style={styles.sectionDescription}>
                Manage position, content, and style of added widgets
              </Text>

              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No Widgets Added Yet</Text>
                <Text style={styles.emptyText}>
                  Go to Available Widgets tab to add widgets to your dashboard
                </Text>
                <Button
                  title="Browse Widgets"
                  variant="outline"
                  onPress={() => setActiveTab('widgets')}
                  style={styles.emptyButton}
                />
              </Card>
            </>
          )}

          {/* Background Settings */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>🖼️ Background</Text>
            <Text style={styles.cardDescription}>
              Set a custom image or video as your dashboard background
            </Text>
            <Button
              title="Choose Background"
              variant="outline"
              onPress={() => console.log('Choose background')}
              fullWidth
              style={styles.backgroundButton}
            />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text.primary,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  tabButton: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  widgetCard: {
    marginBottom: SPACING.sm,
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  widgetIcon: {
    fontSize: 32,
  },
  widgetDetails: {
    flex: 1,
  },
  widgetName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  widgetDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emptyButton: {
    minWidth: 200,
  },
  card: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  cardDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  backgroundButton: {
    marginTop: SPACING.xs,
  },
});

