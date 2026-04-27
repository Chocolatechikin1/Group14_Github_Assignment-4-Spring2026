import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '../../App';
import { AppTheme, getSharedStyles } from '../styles/shared';

interface Props {
  right?: React.ReactNode;
  netId?: string;
  theme: AppTheme;
  notifications?: AppNotification[];
  onProfilePress?: () => void;
}

export default function Header({ right, netId, theme, notifications = [], onProfilePress }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const initials = netId ? netId.slice(0, 2).toUpperCase() : 'NG';
  const shared = useMemo(() => getSharedStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <View style={shared.header}>
        <View style={shared.logoRow}>
          <View style={shared.logoBox}>
            <View style={[styles.logoCap, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="school" size={16} color={theme.colors.brand} />
            </View>
            <View style={[styles.logoSpark, { backgroundColor: theme.colors.accent }]}>
              <Ionicons name="sparkles" size={9} color="#6B3E00" />
            </View>
          </View>
          <View>
            <Text style={shared.logoName}>MiniTA</Text>
            <Text style={shared.logoSub}>AI Teaching Assistant</Text>
          </View>
        </View>
        <View style={shared.headerRight}>
          {right}
          <TouchableOpacity style={shared.notifWrap} onPress={() => setMenuOpen(open => !open)}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.header} />
            {notifications.length > 0 ? <View style={shared.notifDot} /> : null}
          </TouchableOpacity>
          <TouchableOpacity style={shared.avatar} onPress={onProfilePress} activeOpacity={onProfilePress ? 0.75 : 1}>
            <Text style={shared.avatarTxt}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {menuOpen ? (
        <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.dropdownTitle, { color: theme.colors.text }]}>Email Notifications</Text>
          {notifications.length === 0 ? (
            <Text style={[styles.dropdownEmpty, { color: theme.colors.textMuted }]}>No notifications yet.</Text>
          ) : (
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {notifications.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    index < notifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                  ]}
                >
                  <View style={[styles.dropdownDot, { backgroundColor: theme.colors.accent }]} />
                  <View style={styles.dropdownCopy}>
                    <Pressable
                      onPress={() => {}}
                      onHoverIn={() => setHoveredId(item.id)}
                      onHoverOut={() => setHoveredId(current => (current === item.id ? null : current))}
                      style={hoveredId === item.id ? styles.linkHover : undefined}
                    >
                      <Text
                        style={[
                          styles.dropdownItemTitle,
                          {
                            color: hoveredId === item.id ? theme.colors.accent : theme.colors.text,
                            textDecorationLine: hoveredId === item.id ? 'underline' : 'none',
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                    <Text style={[styles.dropdownMessage, { color: theme.colors.textMuted }]}>{item.message}</Text>
                  </View>
                  <Text style={[styles.dropdownTime, { color: theme.colors.textSoft }]}>{item.time}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 20,
  },
  logoCap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSpark: {
    position: 'absolute',
    right: -3,
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7E9BF',
  },
  dropdown: {
    position: 'absolute',
    top: 66,
    right: 12,
    width: 338,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  dropdownEmpty: {
    fontSize: 12,
    lineHeight: 18,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  dropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dropdownCopy: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  dropdownMessage: {
    fontSize: 11,
    lineHeight: 16,
  },
  dropdownTime: {
    fontSize: 10,
    marginTop: 1,
  },
  linkHover: {
    alignSelf: 'flex-start',
  },
});
