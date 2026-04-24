import { StyleSheet, Platform } from 'react-native';

export const ACCENT = '#BC0001'; // Original School/Canvas theme red
export const ACCENT_BG = '#ffffff';

export const SHADOW = Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' },
}) ?? {};

export const CARD_SHADOW = Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  android: { elevation: 3 },
  web:     { boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)' },
}) ?? {};

export const shared = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#FAFAFA' },
  body:      { flex: 1, backgroundColor: '#F9FAFB' },
  bodyPad:   { padding: 24 },

  // Header
  header:        { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox:       { width: 36, height: 36, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  logoEmoji:     { fontSize: 18 },
  logoName:      { color: '#111827', fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.5 },
  logoSub:       { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 16 },
  notifWrap:     { position: 'relative' as const, padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  notifEmoji:    { fontSize: 20 },
  notifDot:      { position: 'absolute' as const, top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#FFFFFF' },
  avatar:        { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  avatarTxt:     { color: '#111827', fontWeight: '700' as const, fontSize: 14 },

  // Section headers
  sectionHead:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  sectionAccent: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle:  { fontSize: 15, fontWeight: '700' as const, color: '#111827', flex: 1 },
  sectionBadge:  { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  sectionBadgeTxt: { fontSize: 12, fontWeight: '700' as const },

  // Modals
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' as const },
  sheet:           { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHandle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center' as const, marginBottom: 16 },
  modalTitle:      { fontSize: 19, fontWeight: '800' as const, color: '#111827', flex: 1 },
  modalHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between' as const, alignItems: 'flex-start' as const, marginBottom: 12 },
  modalClose:      { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt:   { fontSize: 14, color: '#6B7280', fontWeight: '700' as const },
  coursePill:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' as const, marginBottom: 16 },
  coursePillTxt:   { fontSize: 13, fontWeight: '700' as const },
  metaGrid:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metaCell:        { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10 },
  metaLabel:       { fontSize: 10, color: '#9CA3AF', fontWeight: '600' as const, marginBottom: 3, textTransform: 'uppercase' as const },
  metaVal:         { fontSize: 13, color: '#111827', fontWeight: '700' as const },
  detailHead:      { fontSize: 13, fontWeight: '700' as const, color: '#374151', marginBottom: 6 },
  detailTxt:       { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  ctaBtn:          { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  ctaTxt:          { color: 'white', fontWeight: '800' as const, fontSize: 14 },
  dismissBtn:      { paddingVertical: 10, alignItems: 'center' },
  dismissTxt:      { color: '#6B7280', fontWeight: '600' as const, fontSize: 13 },

  dot:             { width: 10, height: 10, borderRadius: 5 },
});
