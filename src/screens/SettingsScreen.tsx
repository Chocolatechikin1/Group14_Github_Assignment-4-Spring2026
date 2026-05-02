import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '../../App';
import { AppTheme, getSharedStyles } from '../styles/shared';
import Header from '../components/Header';
import { StoredUser, updateUserPassword } from '../services/authStorage';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type SettingsView = 'main' | 'password' | 'profile';

interface SettingItem {
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  label: string;
  sub?: string;
  action?: () => void;
  danger?: boolean;
  clickable?: boolean;
}

interface Props {
  user: StoredUser;
  onLogout?: () => void;
  darkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (value: boolean) => void;
  notifications: AppNotification[];
  theme: AppTheme;
  onOpenSettings: () => void;
}

export default function SettingsScreen({
  user,
  onLogout,
  darkMode,
  onToggleDarkMode,
  notificationsEnabled,
  onToggleNotifications,
  notifications,
  theme,
  onOpenSettings,
}: Props) {
  const initials = user.netId.slice(0, 2).toUpperCase();
  const shared = useMemo(() => getSharedStyles(theme), [theme]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<SettingsView>('main');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const sections: { section: string; items: SettingItem[] }[] = [
    {
      section: 'Account',
      items: [
        {
          icon: 'person-circle-outline',
          iconColor: '#2563EB',
          iconBg: theme.mode === 'dark' ? '#2F3644' : '#DBEAFE',
          label: 'Profile',
          sub: `${user.fullName} | ${user.netId}`,
          action: () => setActiveView('profile'),
          clickable: true,
        },
        {
          icon: 'mail-outline',
          iconColor: '#0F766E',
          iconBg: theme.mode === 'dark' ? '#243B38' : '#CCFBF1',
          label: 'University Email',
          sub: user.email,
          clickable: false,
        },
        {
          icon: 'book-outline',
          iconColor: '#B45309',
          iconBg: theme.mode === 'dark' ? '#463723' : '#FEF3C7',
          label: 'Major',
          sub: user.major,
          clickable: false,
        },
        {
          icon: 'key-outline',
          iconColor: '#A855F7',
          iconBg: theme.mode === 'dark' ? '#3A2D4B' : '#F3E8FF',
          label: 'Password',
          sub: 'Change your password',
          action: () => setActiveView('password'),
          clickable: true,
        },
      ],
    },
    {
      section: 'Session',
      items: [
        {
          icon: 'log-out-outline',
          iconColor: theme.colors.danger,
          iconBg: theme.mode === 'dark' ? '#4A2527' : '#FEE2E2',
          label: 'Log Out',
          sub: 'Return to the login page',
          danger: true,
          action: onLogout,
          clickable: true,
        },
      ],
    },
  ];

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setStatusMessage('Please fill in every password field.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await updateUserPassword({
        netId: user.netId,
        currentPassword,
        newPassword,
      });
      resetPasswordForm();
      Alert.alert(
        'Password Updated',
        'Your password was updated successfully. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => onLogout?.(),
          },
        ],
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderBackRow = (label: string) => (
    <TouchableOpacity style={s.backRow} onPress={() => setActiveView('main')} activeOpacity={0.75}>
      <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
      <Text style={[s.backText, { color: theme.colors.accent }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderProfileView = () => (
    <View style={s.sectionWrap}>
      {renderBackRow('Back to Settings')}
      <View style={[s.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[s.detailTitle, { color: theme.colors.text }]}>Profile Details</Text>
        <Text style={[s.detailSub, { color: theme.colors.textMuted }]}>
          Your stored MiniTA account details are shown below.
        </Text>

        <View style={s.detailGrid}>
          <View style={[s.detailGridCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
            <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>First Name</Text>
            <Text style={[s.detailValue, { color: theme.colors.text }]}>{user.firstName}</Text>
          </View>
          <View style={[s.detailGridCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
            <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>Last Name</Text>
            <Text style={[s.detailValue, { color: theme.colors.text }]}>{user.lastName}</Text>
          </View>
        </View>

        <View style={s.detailGrid}>
          <View style={[s.detailGridCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
            <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>NetID</Text>
            <Text style={[s.detailValue, { color: theme.colors.text }]}>{user.netId}</Text>
          </View>
          <View style={[s.detailGridCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
            <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>Class</Text>
            <Text style={[s.detailValue, { color: theme.colors.text }]}>{user.classLevel}</Text>
          </View>
        </View>

        <View style={[s.detailCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>Email</Text>
          <Text style={[s.detailValue, { color: theme.colors.text }]}>{user.email}</Text>
        </View>

        <View style={[s.detailCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>Major</Text>
          <Text style={[s.detailValue, { color: theme.colors.text }]}>{user.major}</Text>
        </View>

        <View style={[s.detailCell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <Text style={[s.detailLabel, { color: theme.colors.textSoft }]}>Courses</Text>
          <View style={s.courseList}>
            {user.courses.map((course, index) => (
              <View
                key={course}
                style={[
                  s.courseItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={[s.courseIndex, { backgroundColor: theme.colors.accentSoft }]}>
                  <Text style={[s.courseIndexText, { color: theme.colors.accent }]}>{index + 1}</Text>
                </View>
                <Text style={[s.courseLine, { color: theme.colors.text }]}>{course}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderPasswordView = () => (
    <View style={s.sectionWrap}>
      {renderBackRow('Back to Settings')}
      <View style={[s.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[s.detailTitle, { color: theme.colors.text }]}>Change Password</Text>
        <Text style={[s.detailSub, { color: theme.colors.textMuted }]}>
          Update the password linked to your MiniTA account.
        </Text>

        <Text style={[s.passwordLabel, { color: theme.colors.text }]}>Current Password</Text>
        <TextInput
          style={[s.passwordInput, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Enter current password"
          placeholderTextColor={theme.colors.textSoft}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <Text style={[s.passwordLabel, { color: theme.colors.text }]}>New Password</Text>
        <TextInput
          style={[s.passwordInput, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Create new password"
          placeholderTextColor={theme.colors.textSoft}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Text style={[s.passwordLabel, { color: theme.colors.text }]}>Confirm New Password</Text>
        <TextInput
          style={[s.passwordInput, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Confirm new password"
          placeholderTextColor={theme.colors.textSoft}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={s.passwordButtonRow}>
          <TouchableOpacity
            style={[s.passwordBtnSecondary, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
            activeOpacity={0.85}
            onPress={() => {
              resetPasswordForm();
              setActiveView('main');
            }}
          >
            <Text style={[s.passwordBtnSecondaryTxt, { color: theme.colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.passwordBtnPrimary, { backgroundColor: theme.colors.accent, opacity: passwordLoading ? 0.7 : 1 }]}
            activeOpacity={0.85}
            onPress={handlePasswordUpdate}
            disabled={passwordLoading}
          >
            <Text style={s.passwordBtnPrimaryTxt}>{passwordLoading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={shared.screen}>
      <Header netId={user.netId} theme={theme} notifications={notifications} onProfilePress={onOpenSettings} />

      <ScrollView style={shared.body} contentContainerStyle={shared.bodyPad} showsVerticalScrollIndicator={false}>
        <View style={s.pageShell}>
          {statusMessage ? (
            <View style={[s.banner, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent }]}>
              <Ionicons name="notifications-outline" size={16} color={theme.colors.accent} />
              <Text style={[s.bannerText, { color: theme.colors.text }]}>{statusMessage}</Text>
            </View>
          ) : null}

          <View style={[s.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={s.avatarWrap}>
              <View style={[s.profileAvatar, { backgroundColor: theme.colors.accent }]}>
                <Text style={s.profileAvatarTxt}>{initials}</Text>
              </View>
              <View style={[s.editAvatarBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="camera-outline" size={14} color={theme.colors.accent} />
              </View>
            </View>
            <Text style={[s.profileName, { color: theme.colors.text }]}>{user.fullName}</Text>
            <Text style={[s.profileSub, { color: theme.colors.textMuted }]}>{user.email}</Text>
            <Text style={[s.profileMeta, { color: theme.colors.textSoft }]}>{user.major} | {user.netId}</Text>
          </View>

          {activeView === 'password' ? (
            renderPasswordView()
          ) : activeView === 'profile' ? (
            renderProfileView()
          ) : (
            <>
              <View style={s.sectionWrap}>
                <Text style={[s.sectionLabel, { color: theme.colors.textSoft }]}>PREFERENCES</Text>
                <View style={[s.group, { backgroundColor: theme.colors.surface }]}>
                  <View style={[s.row, { borderBottomColor: theme.colors.border }]}>
                    <View style={[s.iconPill, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <Ionicons name="moon-outline" size={18} color={theme.colors.accent} />
                    </View>
                    <View style={s.rowTextWrap}>
                      <Text style={[s.rowLabel, { color: theme.colors.text }]}>Dark Mode</Text>
                      <Text style={[s.rowSubBlock, { color: theme.colors.textMuted }]}>
                        Shift the app to softer charcoals, grays, and gold accents.
                      </Text>
                    </View>
                    <Switch
                      value={darkMode}
                      onValueChange={value => {
                        onToggleDarkMode(value);
                        setStatusMessage(value ? 'Dark mode has been enabled.' : 'Dark mode has been disabled.');
                      }}
                      trackColor={{ false: '#6B7280', true: theme.colors.accent }}
                      thumbColor={theme.mode === 'dark' ? '#F2F0EA' : 'white'}
                    />
                  </View>

                  <View style={s.row}>
                    <View style={[s.iconPill, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <Ionicons name="notifications-outline" size={18} color={theme.colors.accent} />
                    </View>
                    <View style={s.rowTextWrap}>
                      <Text style={[s.rowLabel, { color: theme.colors.text }]}>Push Notifications</Text>
                      <Text style={[s.rowSubBlock, { color: theme.colors.textMuted }]}>
                        Email alerts for exams, assignments, and project deadlines.
                      </Text>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={value => {
                        onToggleNotifications(value);
                        setStatusMessage(
                          value
                            ? 'Notifications have been enabled.'
                            : 'Notifications have been disabled.',
                        );
                      }}
                      trackColor={{ false: '#6B7280', true: theme.colors.accent }}
                      thumbColor={theme.mode === 'dark' ? '#F2F0EA' : 'white'}
                    />
                  </View>
                </View>
              </View>

              {sections.map(section => (
                <View key={section.section} style={s.sectionWrap}>
                  <Text style={[s.sectionLabel, { color: theme.colors.textSoft }]}>{section.section.toUpperCase()}</Text>
                  <View style={[s.group, { backgroundColor: theme.colors.surface }]}>
                    {section.items.map((item, i) => {
                      const isClickable = Boolean(item.clickable && item.action);
                      return (
                        <TouchableOpacity
                          key={item.label}
                          style={[s.row, i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                          onPress={item.action}
                          activeOpacity={isClickable ? 0.72 : 1}
                          disabled={!isClickable}
                        >
                          <View style={[s.iconPill, { backgroundColor: item.iconBg }]}>
                            <Ionicons name={item.icon} size={18} color={item.iconColor} />
                          </View>
                          <View style={s.rowTextWrap}>
                            <Text style={[s.rowLabel, { color: item.danger ? theme.colors.danger : theme.colors.text }]}>{item.label}</Text>
                            {item.sub ? (
                              <Text style={[s.rowSubBlock, { color: item.danger ? theme.colors.danger : theme.colors.textMuted }]}>{item.sub}</Text>
                            ) : null}
                          </View>
                          {item.clickable ? (
                            <Ionicons name="chevron-forward" size={16} color={item.danger ? theme.colors.danger : theme.colors.textSoft} />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pageShell: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  profileCard: {
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileAvatarTxt: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 28,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileSub: {
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileMeta: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 15,
    gap: 12,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowSubBlock: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  detailSub: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCell: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  detailGridCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  courseLine: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    flex: 1,
  },
  courseList: {
    gap: 10,
    marginTop: 4,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  courseIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  passwordLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: -4,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  passwordButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  passwordBtnSecondary: {
    minWidth: 120,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  passwordBtnSecondaryTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  passwordBtnPrimary: {
    minWidth: 150,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordBtnPrimaryTxt: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
});
