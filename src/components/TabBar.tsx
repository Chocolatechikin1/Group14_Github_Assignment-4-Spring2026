import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabName } from '../../App';
import { ACCENT } from '../styles/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: TabName; icon: IoniconsName; iconActive: IoniconsName; label: string }[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline',       iconActive: 'grid'            },
  { name: 'Calendar',  label: 'Calendar',  icon: 'calendar-outline',   iconActive: 'calendar'        },
  { name: 'AI Chat',   label: 'MiniTA AI',   icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses'      },
  { name: 'Settings',  label: 'Settings',  icon: 'settings-outline',   iconActive: 'settings'        },
];

interface Props {
  activeTab: TabName;
  onChangeTab: (t: TabName) => void;
  isDesktop?: boolean;
}

export default function TabBar({ activeTab, onChangeTab, isDesktop }: Props) {
  const insets = useSafeAreaInsets();
  
  if (isDesktop) {
    return (
      <View style={s.sidebar}>
        <View style={s.sidebarBrand}>
            <View style={s.sidebarBrandIcon}><Text style={s.sidebarBrandTxt}>TA</Text></View>
        </View>
        <View style={s.sidebarMenu}>
          {TABS.map(tab => {
            const active = tab.name === activeTab;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[s.sideItem, active && s.sideItemActive]}
                onPress={() => onChangeTab(tab.name)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={active ? tab.iconActive : tab.icon}
                  size={20}
                  color={active ? ACCENT : '#64748B'}
                  style={s.sideIcon}
                />
                <Text style={[s.sideLabel, active && s.sideLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map(tab => {
        const active = tab.name === activeTab;
        return (
          <TouchableOpacity
            key={tab.name}
            style={s.item}
            onPress={() => onChangeTab(tab.name)}
            activeOpacity={0.65}
          >
            {/* Active pill background */}
            <View style={[s.iconPill, active && s.iconPillActive]}>
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={22}
                color={active ? 'white' : '#64748b'}
              />
            </View>
            <Text style={[s.label, active && s.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  // Bottom Bar (Mobile)
  bar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  item:          { flex: 1, alignItems: 'center', paddingVertical: 4 },
  iconPill:      { width: 48, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  iconPillActive:{ backgroundColor: ACCENT },
  label:         { fontSize: 11, color: '#64748b', fontWeight: '500' },
  labelActive:   { color: ACCENT, fontWeight: '700' },

  // Sidebar (Desktop)
  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sidebarBrand: { marginBottom: 32, paddingHorizontal: 12 },
  sidebarBrandIcon: { width: 40, height: 40, backgroundColor: ACCENT, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sidebarBrandTxt: { color: 'white', fontWeight: '800', fontSize: 18 },
  sidebarMenu: { flex: 1, gap: 4 },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sideItemActive: { backgroundColor: '#F3F4F6' },
  sideIcon: { marginRight: 12 },
  sideLabel: { fontSize: 15, color: '#4B5563', fontWeight: '600' },
  sideLabelActive: { color: ACCENT, fontWeight: '700' },
});
