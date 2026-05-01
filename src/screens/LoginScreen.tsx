import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT } from '../styles/shared';

interface Props { onLogin: (netId: string) => void; }
type Tab = 'login' | 'register';

export default function LoginScreen({ onLogin }: Props) {
  const [tab, setTab]           = useState<Tab>('login');
  const [name, setName]         = useState('');
  const [netId, setNetId]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const proceed = (id: string) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(id.trim()); }, 900);
  };

  const handleSignIn = () => {
    if (!netId.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your NetID and password.'); return;
    }
    proceed(netId);
  };

  const handleRegister = () => {
    if (!name.trim() || !netId.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.'); return;
    }
    proceed(netId);
  };

  const inputStyle = (field: string) => [
    s.inputWrap,
    focused === field && s.inputWrapFocused,
  ];

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Logo ── */}
          <View style={s.logoArea}>
            <View style={s.logoCard}>
              <View style={s.logoInner}>
                <Text style={s.logoTA}>TA</Text>
              </View>
              <View style={s.logoDot} />
            </View>
            <Text style={s.logoName}>MiniTA</Text>
            <Text style={s.logoSub}>Your AI Teaching Assistant</Text>
          </View>

          {/* ── Card ── */}
          <View style={s.card}>

            {/* Tab switcher */}
            <View style={s.tabRow}>
              {(['login', 'register'] as Tab[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.tabBtn, tab === t && s.tabBtnActive]}
                  onPress={() => setTab(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                    {t === 'login' ? 'Login' : 'Register'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && <>
              <Text style={s.fieldLabel}>NetID</Text>
              <View style={inputStyle('netid')}>
                <Ionicons name="person-outline" size={18} color={focused === 'netid' ? ACCENT : '#9CA3AF'} style={s.icon} />
                <TextInput
                  style={s.input}
                  placeholder="e.g., abc1234"
                  placeholderTextColor="#C4C4C4"
                  value={netId}
                  onChangeText={setNetId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setFocused('netid')}
                  onBlur={() => setFocused(null)}
                />
              </View>
              <Text style={s.hint}>Use your university-issued NetID</Text>

              <Text style={s.fieldLabel}>Password</Text>
              <View style={inputStyle('password')}>
                <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? ACCENT : '#9CA3AF'} style={s.icon} />
                <TextInput
                  style={s.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#C4C4C4"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!pwVisible}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setPwVisible(v => !v)} style={s.eyeBtn}>
                  <Ionicons name={pwVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={s.rowBetween}>
                <TouchableOpacity style={s.remRow} onPress={() => setRemember(v => !v)} activeOpacity={0.7}>
                  <View style={[s.checkbox, remember && s.checkboxOn]}>
                    {remember && <Ionicons name="checkmark" size={11} color="white" />}
                  </View>
                  <Text style={s.remTxt}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={s.forgotTxt}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[s.signInBtn, loading && s.btnDim]}
                onPress={handleSignIn}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={s.signInTxt}>Sign In</Text>}
              </TouchableOpacity>

              <View style={s.divRow}>
                <View style={s.divLine} />
                <Text style={s.divTxt}>OR</Text>
                <View style={s.divLine} />
              </View>

              <TouchableOpacity style={s.ssoBtn} activeOpacity={0.8}>
                <View style={s.gCircle}><Text style={s.gTxt}>G</Text></View>
                <Text style={s.ssoTxt}>Sign in with University SSO</Text>
              </TouchableOpacity>

              {/* Security notice */}
              <View style={s.noticeBox}>
                <Ionicons name="shield-checkmark-outline" size={17} color="#92400E" style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.noticeTitle}>Security Notice</Text>
                  <Text style={s.noticeTxt}>
                    Access is restricted to current university members only. Graduated students will automatically lose access. Never share your credentials.
                  </Text>
                </View>
              </View>
            </>}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && <>
              <Text style={s.fieldLabel}>Full Name</Text>
              <View style={inputStyle('name')}>
                <Ionicons name="person-outline" size={18} color={focused === 'name' ? ACCENT : '#9CA3AF'} style={s.icon} />
                <TextInput
                  style={s.input}
                  placeholder="Your full name"
                  placeholderTextColor="#C4C4C4"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                />
              </View>

              <Text style={s.fieldLabel}>University ID</Text>
              <View style={inputStyle('uid')}>
                <Ionicons name="card-outline" size={18} color={focused === 'uid' ? ACCENT : '#9CA3AF'} style={s.icon} />
                <TextInput
                  style={s.input}
                  placeholder="e.g., S12345678"
                  placeholderTextColor="#C4C4C4"
                  value={netId}
                  onChangeText={setNetId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setFocused('uid')}
                  onBlur={() => setFocused(null)}
                />
              </View>
              <Text style={s.hint}>Use your university-issued student/staff ID</Text>

              <Text style={s.fieldLabel}>Password</Text>
              <View style={inputStyle('rpw')}>
                <Ionicons name="lock-closed-outline" size={18} color={focused === 'rpw' ? ACCENT : '#9CA3AF'} style={s.icon} />
                <TextInput
                  style={s.input}
                  placeholder="Create a password"
                  placeholderTextColor="#C4C4C4"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!pwVisible}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  onFocus={() => setFocused('rpw')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setPwVisible(v => !v)} style={s.eyeBtn}>
                  <Ionicons name={pwVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[s.signInBtn, loading && s.btnDim]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={s.signInTxt}>Create Account</Text>}
              </TouchableOpacity>

              <Text style={s.switchTxt}>
                Already have an account?{'  '}
                <Text style={s.switchLink} onPress={() => setTab('login')}>Sign In</Text>
              </Text>
            </>}
          </View>

          <Text style={s.footer}>© {new Date().getFullYear()} MiniTA · University of Texas at Dallas</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: ACCENT },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 36 },

  // Logo
  logoArea:  { alignItems: 'center', marginBottom: 26 },
  logoCard:  { width: 82, height: 82, backgroundColor: 'white', borderRadius: 24,
               alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative',
               shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 14 },
  logoInner: { width: 54, height: 54, backgroundColor: ACCENT, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  logoTA:    { color: 'white', fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  logoDot:   { position: 'absolute', bottom: 10, right: 10, width: 15, height: 15,
               borderRadius: 8, backgroundColor: '#FBBF24', borderWidth: 2.5, borderColor: 'white' },
  logoName:  { color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: 0.3 },
  logoSub:   { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 5 },

  // Card
  card: { backgroundColor: 'white', borderRadius: 24, padding: 22,
          shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 28, elevation: 14,
          maxWidth: 400, width: '100%', alignSelf: 'center' },

  // Tab switcher
  tabRow:      { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4, marginBottom: 22 },
  tabBtn:      { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  tabBtnActive:{ backgroundColor: ACCENT, shadowColor: ACCENT,
                 shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
  tabTxt:      { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  tabTxtActive:{ color: 'white' },

  // Fields
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 },
  hint:       { fontSize: 12, color: '#9CA3AF', marginTop: -10, marginBottom: 14 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB',
                borderRadius: 13, paddingHorizontal: 14, height: 54, marginBottom: 16, backgroundColor: '#FAFAFA' },
  inputWrapFocused: { borderColor: ACCENT, backgroundColor: 'white' },
  icon:       { marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: '#111827' },
  eyeBtn:     { padding: 4 },

  // Remember / forgot
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: -4 },
  remRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox:   { width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  remTxt:     { fontSize: 13, color: '#374151', fontWeight: '500' },
  forgotTxt:  { fontSize: 13, color: ACCENT, fontWeight: '700' },

  // Sign in button
  signInBtn:  { backgroundColor: ACCENT, borderRadius: 14, height: 54,
                alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  btnDim:     { opacity: 0.65 },
  signInTxt:  { color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  // Divider
  divRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  divTxt:  { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  // SSO
  ssoBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
             borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, height: 54, marginBottom: 20, gap: 10 },
  gCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  gTxt:    { color: 'white', fontSize: 13, fontWeight: '900' },
  ssoTxt:  { fontSize: 14, fontWeight: '700', color: '#374151' },

  // Security notice
  noticeBox:   { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 12,
                 padding: 14, gap: 10, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  noticeTitle: { fontSize: 13, fontWeight: '800', color: '#92400E', marginBottom: 3 },
  noticeTxt:   { fontSize: 12, color: '#B45309', lineHeight: 18 },

  // Register
  switchTxt:  { textAlign: 'center', color: '#6B7280', fontSize: 13, marginTop: 16 },
  switchLink: { color: ACCENT, fontWeight: '700' },

  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 26 },
});
