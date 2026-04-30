import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import LoginScreen     from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CalendarScreen  from './src/screens/CalendarScreen';
import AIChatScreen    from './src/screens/AIChatScreen';
import SettingsScreen  from './src/screens/SettingsScreen';
import TabBar          from './src/components/TabBar';
import { ExtraBlock }  from './src/data';

export type TabName = 'Dashboard' | 'Calendar' | 'AI Chat' | 'Settings';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [netId, setNetId]             = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<TabName>('Dashboard');

  // ─── Shared state across Dashboard ↔ Calendar ─────────────────────────────
  const [checked, setChecked]         = useState<Set<string>>(new Set());
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);

  const toggleChecked = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addBlock = (b: ExtraBlock) => setExtraBlocks(prev => [...prev, b]);

  useEffect(() => {
    Font.loadAsync({
      ...Ionicons.font,
      ...MaterialCommunityIcons.font,
    }).then(() => setFontsLoaded(true)).catch(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#BC0001', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="white" size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  const handleLogin  = (id: string) => setNetId(id);
  const handleLogout = ()           => { setNetId(null); setActiveTab('Dashboard'); };

  if (!netId) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#BC0001" />
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
            checked={checked}
            toggleChecked={toggleChecked}
            extraBlocks={extraBlocks}
            addBlock={addBlock}
          />
        );
      case 'Calendar':
        return <CalendarScreen extraBlocks={extraBlocks} />;
      case 'AI Chat':
        return <AIChatScreen />;
      case 'Settings':
        return <SettingsScreen netId={netId} onLogout={handleLogout} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#BC0001" />
      <View style={styles.root}>
        <View style={styles.content}>{renderScreen()}</View>
        <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#BC0001' },
  content: { flex: 1 },
});
