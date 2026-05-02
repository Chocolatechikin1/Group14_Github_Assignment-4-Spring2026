import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TabBar from './src/components/TabBar';
import { ExtraBlock } from './src/data';
import { AppTheme, darkTheme, lightTheme, RED } from './src/styles/shared';
import { StoredUser } from './src/services/authStorage';

// Top-level navigation names are kept here so the tab bar and screens stay in sync.
export type TabName = 'Dashboard' | 'Calendar' | 'AI Chat' | 'Settings';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const theme: AppTheme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Vector icon fonts must load before the first screen renders, otherwise icons can flash blank.
    Font.loadAsync({
      ...Ionicons.font,
      ...MaterialCommunityIcons.font,
    })
      .then(() => setFontsLoaded(true))
      .catch(() => setFontsLoaded(true));
  }, []);

  const toggleChecked = (id: string) => {
    // Store completed item ids in a Set so seeded tasks and custom items can share one checkbox system.
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Custom study blocks/tasks live in App so dashboard and calendar share one source.
  const addBlock = (block: ExtraBlock) => setExtraBlocks(prev => [...prev, block]);
  const updateBlock = (block: ExtraBlock) => {
    setExtraBlocks(prev => prev.map(item => (item.id === block.id ? block : item)));
  };

  const notifications: AppNotification[] = currentUser && notificationsEnabled
    ? [
        {
          id: 'n1',
          title: 'Exam Reminder',
          message: 'CS 3354 midterm opens Friday at 9:00 AM and closes at noon.',
          time: 'Today',
        },
        {
          id: 'n2',
          title: 'Project Deadline',
          message: 'Project 2 milestone is due in 2 days. A summary was emailed to you.',
          time: '2h ago',
        },
        {
          id: 'n3',
          title: 'Assignment Digest',
          message: `MiniTA emailed ${currentUser.email} with this week's assignment checklist.`,
          time: 'Yesterday',
        },
      ]
    : [];

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingRoot, { backgroundColor: theme.colors.brand }]}>
          <ActivityIndicator color="white" size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  const handleLogin = (user: StoredUser) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('Dashboard');
    setChecked(new Set());
    setExtraBlocks([]);
  };

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={RED} />
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  const openSettings = () => setActiveTab('Settings');

  // Screen props are wired centrally so cross-page state stays predictable.
  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <DashboardScreen
            goToTab={setActiveTab}
            currentUser={currentUser}
            theme={theme}
            notifications={notifications}
            onOpenSettings={openSettings}
            checked={checked}
            toggleChecked={toggleChecked}
            extraBlocks={extraBlocks}
            addBlock={addBlock}
            updateBlock={updateBlock}
          />
        );
      case 'Calendar':
        return (
          <CalendarScreen
            theme={theme}
            netId={currentUser.netId}
            notifications={notifications}
            onOpenSettings={openSettings}
            extraBlocks={extraBlocks}
            addBlock={addBlock}
            updateBlock={updateBlock}
          />
        );
      case 'AI Chat':
        return (
          <AIChatScreen
            theme={theme}
            netId={currentUser.netId}
            notifications={notifications}
            onOpenSettings={openSettings}
          />
        );
      case 'Settings':
        return (
          <SettingsScreen
            user={currentUser}
            onLogout={handleLogout}
            darkMode={darkMode}
            onToggleDarkMode={setDarkMode}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
            notifications={notifications}
            theme={theme}
            onOpenSettings={openSettings}
          />
        );
    }
  };

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={theme.colors.brand} />
      <View style={[styles.root, isDesktop && styles.rootDesktop, { backgroundColor: theme.colors.screen }]}>
        {isDesktop ? (
          <TabBar activeTab={activeTab} onChangeTab={setActiveTab} theme={theme} isDesktop />
        ) : null}
        <View style={styles.content}>{renderScreen()}</View>
        {!isDesktop ? (
          <TabBar activeTab={activeTab} onChangeTab={setActiveTab} theme={theme} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    fontFamily: Platform.OS === 'web'
      ? 'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      : undefined,
  },
  rootDesktop: { flexDirection: 'row' },
  content: { flex: 1, overflow: 'hidden' },
  loadingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
