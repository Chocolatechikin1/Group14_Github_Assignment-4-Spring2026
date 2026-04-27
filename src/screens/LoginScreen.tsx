import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RED, LIGHT_RED, GOLD } from '../styles/shared';
import { loginUser, registerUser, StoredUser } from '../services/authStorage';

interface Props {
  onLogin: (user: StoredUser) => void;
}

type Tab = 'login' | 'register';

export default function LoginScreen({ onLogin }: Props) {
  const [tab, setTab] = useState<Tab>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [netId, setNetId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [ssoHovered, setSsoHovered] = useState(false);

  const withLoading = async (work: () => Promise<void>) => {
    try {
      setLoading(true);
      setFormError(null);
      await work();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    if (!netId.trim() || !password.trim()) {
      setFormError('Please enter your NetID and password.');
      return;
    }

    withLoading(async () => {
      const user = await loginUser(netId, password);
      Alert.alert('Welcome Back', `Welcome back, ${user.fullName}!`);
      onLogin(user);
    });
  };

  const handleRegister = () => {
    if (!firstName.trim() || !lastName.trim() || !netId.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    withLoading(async () => {
      const user = await registerUser({
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        firstName,
        lastName,
        netId,
        password,
      });
      Alert.alert('Account Created', `Welcome, ${user.fullName}! Your account is ready.`);
      onLogin(user);
    });
  };

  const inputStyle = (field: string) => [s.inputWrap, focused === field && s.inputWrapFocused];

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View pointerEvents="none" style={s.backgroundGlowTop} />
        <View pointerEvents="none" style={s.backgroundGlowBottom} />
        <View pointerEvents="none" style={s.patternOne} />
        <View pointerEvents="none" style={s.patternTwo} />

        <View style={s.centerWrap}>
          <View style={s.card}>
            <View style={s.logoWrap}>
              <View style={s.logoHalo} />
              <View style={s.logoMark}>
                <View style={s.logoCap}>
                  <Ionicons name="school" size={22} color={RED} />
                </View>
                <View style={s.logoSpark}>
                  <Ionicons name="sparkles" size={12} color="#6B3E00" />
                </View>
              </View>
              <Text style={s.logoName}>MiniTA</Text>
              <Text style={s.logoSub}>Course help that feels organized, calm, and ready for class.</Text>
            </View>

            <View style={s.tabRow}>
              {(['login', 'register'] as Tab[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.tabBtn, tab === t && s.tabBtnActive]}
                  onPress={() => {
                    setTab(t);
                    setFormError(null);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t === 'login' ? 'Login' : 'Register'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formError ? (
              <View style={s.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#B42318" />
                <Text style={s.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            {tab === 'login' ? (
              <>
                <Text style={s.fieldLabel}>NetID</Text>
                <View style={inputStyle('netid')}>
                  <Ionicons name="person-outline" size={18} color={focused === 'netid' ? RED : '#9CA3AF'} style={s.icon} />
                  <TextInput
                    style={s.input}
                    placeholder="abc1234"
                    placeholderTextColor="#9CA3AF"
                    value={netId}
                    onChangeText={value => {
                      setNetId(value);
                      if (formError) setFormError(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused('netid')}
                    onBlur={() => setFocused(null)}
                  />
                </View>

                <Text style={s.fieldLabel}>Password</Text>
                <View style={inputStyle('password')}>
                  <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? RED : '#9CA3AF'} style={s.icon} />
                  <TextInput
                    style={s.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={value => {
                      setPassword(value);
                      if (formError) setFormError(null);
                    }}
                    secureTextEntry={!pwVisible}
                    autoCapitalize="none"
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    onSubmitEditing={handleSignIn}
                  />
                  <TouchableOpacity onPress={() => setPwVisible(v => !v)} style={s.eyeBtn}>
                    <Ionicons name={pwVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View style={s.rowBetween}>
                  <TouchableOpacity style={s.remRow} onPress={() => setRemember(v => !v)} activeOpacity={0.7}>
                    <View style={[s.checkbox, remember && s.checkboxOn]}>
                      {remember ? <Ionicons name="checkmark" size={11} color="white" /> : null}
                    </View>
                    <Text style={s.remTxt}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Password Reset', 'Password recovery is not wired up yet.')}>
                    <Text style={s.forgotTxt}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={[s.primaryBtn, loading && s.btnDim]} onPress={handleSignIn} disabled={loading} activeOpacity={0.88}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={s.primaryBtnTxt}>Sign In</Text>}
                </TouchableOpacity>

                <Pressable
                  style={[s.ssoBtn, ssoHovered && s.ssoBtnHover]}
                  onPress={() => Alert.alert('SSO Unavailable', 'University SSO is reserved for a future integration and does not work yet.')}
                  onHoverIn={() => setSsoHovered(true)}
                  onHoverOut={() => setSsoHovered(false)}
                >
                  <View style={s.ssoIconWrap}>
                    <Ionicons name="school-outline" size={18} color={RED} />
                  </View>
                  <Text style={s.ssoTxt}>University SSO</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={s.nameRow}>
                <View style={s.nameCol}>
                <Text style={s.fieldLabel}>First Name</Text>
                <View style={inputStyle('first-name')}>
                  <Ionicons name="person-outline" size={18} color={focused === 'first-name' ? RED : '#9CA3AF'} style={s.icon} />
                  <TextInput
                    style={s.input}
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={value => {
                      setFirstName(value);
                      if (formError) setFormError(null);
                    }}
                    autoCapitalize="words"
                    onFocus={() => setFocused('first-name')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
                </View>
                <View style={s.nameCol}>
                <Text style={s.fieldLabel}>Last Name</Text>
                <View style={inputStyle('last-name')}>
                  <Ionicons name="person-outline" size={18} color={focused === 'last-name' ? RED : '#9CA3AF'} style={s.icon} />
                  <TextInput
                    style={s.input}
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={value => {
                      setLastName(value);
                      if (formError) setFormError(null);
                    }}
                    autoCapitalize="words"
                    onFocus={() => setFocused('last-name')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
                </View>
                </View>

                <Text style={s.fieldLabel}>University ID</Text>
                <View style={inputStyle('uid')}>
                  <Ionicons name="card-outline" size={18} color={focused === 'uid' ? RED : '#9CA3AF'} style={s.icon} />
                  <TextInput
                    style={s.input}
                    placeholder="abc1234"
                    placeholderTextColor="#9CA3AF"
                    value={netId}
                    onChangeText={value => {
                      setNetId(value);
                      if (formError) setFormError(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused('uid')}
                    onBlur={() => setFocused(null)}
                  />
                </View>

                <Text style={s.fieldLabel}>Password</Text>
                <View style={inputStyle('register-password')}>
                  <Ionicons name="lock-closed-outline" size={18} color={focused === 'register-password' ? RED : '#9CA3AF'} style={s.icon} />
                  <TextInput
                    style={s.input}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={value => {
                      setPassword(value);
                      if (formError) setFormError(null);
                    }}
                    secureTextEntry={!pwVisible}
                    autoCapitalize="none"
                    onFocus={() => setFocused('register-password')}
                    onBlur={() => setFocused(null)}
                    onSubmitEditing={handleRegister}
                  />
                  <TouchableOpacity onPress={() => setPwVisible(v => !v)} style={s.eyeBtn}>
                    <Ionicons name={pwVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={[s.primaryBtn, loading && s.btnDim]} onPress={handleRegister} disabled={loading} activeOpacity={0.88}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={s.primaryBtnTxt}>Create Account</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: RED },
  backgroundGlowTop: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 224, 175, 0.2)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -70,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(214, 82, 84, 0.26)',
  },
  patternOne: {
    position: 'absolute',
    top: 110,
    left: 28,
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '18deg' }],
  },
  patternTwo: {
    position: 'absolute',
    bottom: 120,
    right: 34,
    width: 110,
    height: 110,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,130,0.28)',
    transform: [{ rotate: '12deg' }],
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 470,
    backgroundColor: 'white',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F4E3D0',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoHalo: {
    position: 'absolute',
    top: 4,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF3D8',
  },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#FFF9EF',
    borderWidth: 1.5,
    borderColor: '#F3D08A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  logoCap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSpark: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F3D08A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF6DD',
  },
  logoName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  logoSub: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    maxWidth: 260,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F4',
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEE4E2',
    borderWidth: 1,
    borderColor: '#F7B7B2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#912018',
    fontWeight: '700',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: RED,
  },
  tabTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78716C',
  },
  tabTxtActive: {
    color: 'white',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameCol: {
    flex: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E7D8D1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 16,
    backgroundColor: '#FFFDFC',
  },
  inputWrapFocused: {
    borderColor: RED,
    backgroundColor: 'white',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  eyeBtn: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 18,
  },
  remRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D6D3D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: RED,
    borderColor: RED,
  },
  remTxt: {
    fontSize: 13,
    color: '#44403C',
  },
  forgotTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: LIGHT_RED,
  },
  primaryBtn: {
    backgroundColor: RED,
    borderRadius: 14,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnTxt: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  btnDim: {
    opacity: 0.7,
  },
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#FFF8EA',
    borderWidth: 1.5,
    borderColor: '#F3D08A',
    gap: 10,
    paddingHorizontal: 16,
  },
  ssoBtnHover: {
    backgroundColor: '#FFFFFF',
  },
  ssoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ssoTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C2D12',
  },
});
