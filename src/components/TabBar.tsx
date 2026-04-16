import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabName } from '../../App';
import { RED } from '../styles/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: TabName; icon: IoniconsName; iconActive: IoniconsName; label: string }[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline',       iconActive: 'grid'            },
  { name: 'Calendar',  label: 'Calendar',  icon: 'calendar-outline',   iconActive: 'calendar'        },
  { name: 'AI Chat',   label: 'AI Chat',   icon: 'chatbubble-outline', iconActive: 'chatbubble'      },
  { name: 'Settings',  label: 'Settings',  icon: 'settings-outline',   iconActive: 'settings'        },
];

interface Props {
  activeTab: TabName;
  onChangeTab: (t: TabName) => void;
}

export default function TabBar({ activeTab, onChangeTab }: Props) {
  const insets = useSafeAreaInsets();
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
                size={24}
                color={active ? RED : '#9CA3AF'}
              />
            </View>
            <Text style={[s.label, active && s.labelActive]}>{tab.label}</Text>
            {/* Active dot indicator */}
            {active && <View style={s.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 16 },
    }),
  },
  item:          { flex: 1, alignItems: 'center', paddingVertical: 2 },
  iconPill:      { width: 44, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  iconPillActive:{ backgroundColor: 'rgba(188,0,1,0.09)' },
  label:         { fontSize: 10.5, color: '#9CA3AF', fontWeight: '600' },
  labelActive:   { color: RED, fontWeight: '800' },
  dot:           { width: 4, height: 4, borderRadius: 2, backgroundColor: RED, marginTop: 3 },
});
