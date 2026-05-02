import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
import { AppTheme, darkTheme, lightTheme, RED } from './src/styles/shared';
import { StoredUser } from './src/services/authStorage';

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

  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font,
      ...MaterialCommunityIcons.font,
    })
      .then(() => setFontsLoaded(true))
      .catch(() => setFontsLoaded(true));
  }, []);

  const theme: AppTheme = darkMode ? darkTheme : lightTheme;
  const notifications: AppNotification[] = currentUser
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
        {
          id: 'n4',
          title: 'Lab Prep Notice',
          message: 'Physics 2325 lab prep notes are due tomorrow night.',
          time: 'Yesterday',
        },
        {
          id: 'n5',
          title: 'Group Project Check-In',
          message: 'Your project team asked for an update before Thursday afternoon.',
          time: '2d ago',
        },
        {
          id: 'n6',
          title: 'Reading Review',
          message: 'History reading questions were posted and summarized for email review.',
          time: '3d ago',
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
  };

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={RED} />
        <LoginScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <DashboardScreen
            goToTab={setActiveTab}
            currentUser={currentUser}
            theme={theme}
            notifications={notifications}
            onOpenSettings={() => setActiveTab('Settings')}
          />
        );
      case 'Calendar':
        return <CalendarScreen theme={theme} netId={currentUser.netId} notifications={notifications} onOpenSettings={() => setActiveTab('Settings')} />;
      case 'AI Chat':
        return <AIChatScreen theme={theme} netId={currentUser.netId} notifications={notifications} onOpenSettings={() => setActiveTab('Settings')} />;
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
            onOpenSettings={() => setActiveTab('Settings')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={theme.colors.brand} />
      <View style={[styles.root, { backgroundColor: theme.colors.screen }]}>
        <View style={styles.content}>{renderScreen()}</View>
        <TabBar activeTab={activeTab} onChangeTab={setActiveTab} theme={theme} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  loadingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
