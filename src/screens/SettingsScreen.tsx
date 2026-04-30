import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shared, RED } from '../styles/shared';
import Header from '../components/Header';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItem {
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  label: string;
  sub?: string;
  toggle?: boolean;
  danger?: boolean;
  action?: () => void;
}

interface Props {
  netId?: string;
  onLogout?: () => void;
}

export default function SettingsScreen({ netId, onLogout }: Props) {
  const [darkMode,      setDarkMode]      = useState(false);
  const [highContrast,  setHighContrast]  = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [largeText,     setLargeText]     = useState(false);

  const initials = netId ? netId.slice(0, 2).toUpperCase() : 'NG';

  const SECTIONS: { section: string; items: SettingItem[] }[] = [
    {
      section: 'Account',
      items: [
        { icon: 'person-circle-outline', iconColor: '#6366F1', iconBg: '#EEF2FF', label: 'Profile', sub: `${netId ?? 'Student'} · CS`, action: () => Alert.alert('Profile', 'Edit your profile information.') },
        { icon: 'book-outline',          iconColor: '#0891B2', iconBg: '#E0F2FE', label: 'My Courses', sub: '4 enrolled courses', action: () => Alert.alert('Courses', 'PHY 2325, MATH 2417, HIST 1301, CS 3354') },
        { icon: 'key-outline',           iconColor: '#D97706', iconBg: '#FEF3C7', label: 'Change Password', sub: '', action: () => Alert.alert('Password', 'Password change email sent.') },
      ],
    },
    {
      section: 'Notifications',
      items: [
        { icon: 'notifications-outline', iconColor: '#EC4899', iconBg: '#FCE7F3', label: 'Push Notifications', toggle: true },
        { icon: 'mail-outline',          iconColor: '#6366F1', iconBg: '#EEF2FF', label: 'Email Reminders', sub: '24h before due date', action: () => Alert.alert('Email', 'Email reminder settings opened.') },
        { icon: 'alarm-outline',         iconColor: '#F59E0B', iconBg: '#FEF3C7', label: 'Due Date Alerts', sub: '1 hour before', action: () => Alert.alert('Alerts', 'Choose when to receive alerts.') },
      ],
    },
    {
      section: 'Appearance',
      items: [
        { icon: 'moon-outline',          iconColor: '#6366F1', iconBg: '#EEF2FF', label: 'Dark Mode', toggle: true },
        { icon: 'text-outline',          iconColor: '#0891B2', iconBg: '#E0F2FE', label: 'Large Text', toggle: true },
        { icon: 'contrast-outline',      iconColor: '#374151', iconBg: '#F3F4F6', label: 'High Contrast', toggle: true },
      ],
    },
    {
      section: 'AI Assistant',
      items: [
        { icon: 'hardware-chip-outline', iconColor: RED,       iconBg: '#FEE2E2', label: 'MiniTA Persona', sub: 'Default', action: () => Alert.alert('Persona', 'Choose: Default, Formal, Casual, Motivating') },
        { icon: 'folder-open-outline',   iconColor: '#D97706', iconBg: '#FEF3C7', label: 'Uploaded Syllabi', sub: '3 files', action: () => Alert.alert('Syllabi', 'CS 3354, Physics 2325, History 1301') },
        { icon: 'trash-outline',         iconColor: '#DC2626', iconBg: '#FEE2E2', label: 'Clear Chat History', sub: '', action: () => Alert.alert('Clear Chat', 'Are you sure? This cannot be undone.', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive' }]) },
      ],
    },
    {
      section: 'About',
      items: [
        { icon: 'help-circle-outline',   iconColor: '#6366F1', iconBg: '#EEF2FF', label: 'Help & FAQ', action: () => Alert.alert('Help', 'Visit minita.university.edu/help') },
        { icon: 'star-outline',          iconColor: '#F59E0B', iconBg: '#FEF3C7', label: 'Rate the App', action: () => Alert.alert('Thanks!', "We'd love a 5-star review!") },
        { icon: 'information-circle-outline', iconColor: '#0891B2', iconBg: '#E0F2FE', label: 'Version', sub: '2.0.1 (build 42)', action: () => Alert.alert('MiniTA', 'Version 2.0.1\nBuilt for UTD students.') },
        { icon: 'log-out-outline',       iconColor: '#DC2626', iconBg: '#FEE2E2', label: 'Sign Out', danger: true, action: () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive', onPress: onLogout }]) },
      ],
    },
  ];

  const getToggleVal = (label: string) => {
    if (label === 'Dark Mode')           return darkMode;
    if (label === 'High Contrast')       return highContrast;
    if (label === 'Push Notifications')  return notifications;
    if (label === 'Large Text')          return largeText;
    return false;
  };

  const setToggleVal = (label: string, val: boolean) => {
    if (label === 'Dark Mode')           setDarkMode(val);
    if (label === 'High Contrast')       setHighContrast(val);
    if (label === 'Push Notifications')  setNotifications(val);
    if (label === 'Large Text')          setLargeText(val);
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header netId={netId} />

      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.profileAvatar}>
          <Text style={s.profileAvatarTxt}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profileName}>{netId ?? 'Student'}</Text>
          <Text style={s.profileSub}>Computer Science · UTD</Text>
          <View style={s.profileBadge}>
            <Ionicons name="school-outline" size={11} color="#1D4ED8" />
            <Text style={s.profileBadgeTxt}> Senior · Spring 2026</Text>
          </View>
        </View>
        <TouchableOpacity style={s.editBtn} onPress={() => Alert.alert('Edit Profile', 'Edit your name, major, and avatar.')}>
          <Text style={s.editBtnTxt}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={shared.body} contentContainerStyle={shared.bodyPad} showsVerticalScrollIndicator={false}>
        {SECTIONS.map(section => (
          <View key={section.section} style={{ marginBottom: 20 }}>
            <Text style={s.sectionLabel}>{section.section.toUpperCase()}</Text>
            <View style={s.group}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.row, i < section.items.length - 1 && s.rowBorder]}
                  onPress={() => !item.toggle && item.action?.()}
                  activeOpacity={item.toggle ? 1 : 0.6}
                >
                  {/* Colored icon pill */}
                  <View style={[s.iconPill, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={18} color={item.danger ? '#DC2626' : item.iconColor} />
                  </View>
                  <Text style={[s.rowLabel, item.danger && s.dangerTxt]}>{item.label}</Text>
                  <View style={{ flex: 1 }} />
                  {item.toggle ? (
                    <Switch
                      value={getToggleVal(item.label)}
                      onValueChange={v => setToggleVal(item.label, v)}
                      trackColor={{ false: '#E5E7EB', true: RED }}
                      thumbColor="white"
                    />
                  ) : (
                    <>
                      {item.sub ? <Text style={[s.rowSub, item.danger && s.dangerTxt]}>{item.sub}</Text> : null}
                      <Ionicons name="chevron-forward" size={16} color={item.danger ? '#DC2626' : '#D1D5DB'} />
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <Text style={s.footer}>MiniTA v2.0 · Powered by AI · University of Texas at Dallas</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  profileCard:      { backgroundColor: 'white', marginHorizontal: 16, marginVertical: 10, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  profileAvatar:    { width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  profileAvatarTxt: { color: 'white', fontWeight: '800', fontSize: 20 },
  profileName:      { fontSize: 17, fontWeight: '800', color: '#111827' },
  profileSub:       { fontSize: 12, color: '#6B7280', marginTop: 1 },
  profileBadge:     { marginTop: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  profileBadgeTxt:  { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  editBtn:          { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  editBtnTxt:       { fontSize: 13, fontWeight: '700', color: '#374151' },
  sectionLabel:     { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginLeft: 4 },
  group:            { backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  row:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  rowBorder:        { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconPill:         { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel:         { fontSize: 14, fontWeight: '600', color: '#111827' },
  rowSub:           { fontSize: 13, color: '#9CA3AF', marginRight: 4 },
  dangerTxt:        { color: '#DC2626' },
  footer:           { textAlign: 'center', color: '#9CA3AF', fontSize: 11, marginTop: 4, lineHeight: 16 },
});
