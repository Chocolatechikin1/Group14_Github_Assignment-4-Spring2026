import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabName } from '../../App';
import { AppTheme } from '../styles/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: TabName; icon: IoniconsName; iconActive: IoniconsName; label: string }[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'Calendar', label: 'Calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'AI Chat', label: 'MiniTA AI', icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
  { name: 'Settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

interface Props {
  activeTab: TabName;
  onChangeTab: (t: TabName) => void;
  theme: AppTheme;
  isDesktop?: boolean;
}

export default function TabBar({ activeTab, onChangeTab, theme, isDesktop = false }: Props) {
  const insets = useSafeAreaInsets();

  if (isDesktop) {
    return (
      <View style={[s.sidebar, { backgroundColor: theme.colors.tabBar, borderRightColor: theme.colors.border }]}>
        <View style={s.sidebarBrand}>
          <View style={[s.sidebarBrandIcon, { backgroundColor: theme.colors.accent }]}>
            <Ionicons name="school" size={22} color="#111827" />
          </View>
          <View>
            <Text style={[s.sidebarTitle, { color: theme.colors.text }]}>MiniTA</Text>
            <Text style={[s.sidebarSub, { color: theme.colors.textMuted }]}>AI Teaching Assistant</Text>
          </View>
        </View>
        <View style={s.sidebarMenu}>
          {TABS.map(tab => {
            const active = tab.name === activeTab;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[
                  s.sideItem,
                  active && {
                    backgroundColor: theme.mode === 'dark' ? '#44444E' : 'rgba(188,0,1,0.08)',
                    borderColor: theme.mode === 'dark' ? '#5B5B66' : 'rgba(188,0,1,0.18)',
                  },
                ]}
                onPress={() => onChangeTab(tab.name)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={active ? tab.iconActive : tab.icon}
                  size={20}
                  color={active ? theme.colors.accent : theme.colors.textSoft}
                  style={s.sideIcon}
                />
                <Text style={[s.sideLabel, { color: theme.colors.textMuted }, active && { color: theme.colors.accent }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        s.bar,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      <View style={[s.inner, { backgroundColor: theme.colors.tabBar, borderColor: theme.colors.border }]}>
        {TABS.map(tab => {
          const active = tab.name === activeTab;
          return (
            <TouchableOpacity key={tab.name} style={s.item} onPress={() => onChangeTab(tab.name)} activeOpacity={0.65}>
              <View
                style={[
                  s.iconPill,
                  active && { backgroundColor: theme.mode === 'dark' ? '#38383E' : 'rgba(188,0,1,0.09)' },
                ]}
              >
                <Ionicons
                  name={active ? tab.iconActive : tab.icon}
                  size={22}
                  color={active ? theme.colors.accent : theme.colors.textSoft}
                />
              </View>
              <Text style={[s.label, { color: theme.colors.textSoft }, active && { color: theme.colors.accent }]}>
                {tab.label}
              </Text>
              {active ? <View style={[s.dot, { backgroundColor: theme.colors.accent }]} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 16 },
    }),
  },
  inner: {
    width: '100%',
    maxWidth: 720,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  item: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  iconPill: { width: 44, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  label: { fontSize: 10.5, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sidebarBrand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30, paddingHorizontal: 8 },
  sidebarBrandIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sidebarTitle: { fontSize: 18, fontWeight: '900' },
  sidebarSub: { fontSize: 10, marginTop: 2 },
  sidebarMenu: { flex: 1, gap: 6 },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sideIcon: { marginRight: 12 },
  sideLabel: { fontSize: 14, fontWeight: '700' },
});
