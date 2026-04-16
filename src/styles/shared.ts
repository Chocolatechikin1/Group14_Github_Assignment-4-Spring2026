import { StyleSheet, Platform } from 'react-native';
export const RED = '#BC0001';

export const SHADOW = Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  android: { elevation: 3 },
}) ?? {};

export const CARD_SHADOW = Platform.select({
  ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  android: { elevation: 4 },
}) ?? {};

export const shared = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: RED },
  body:      { flex: 1, backgroundColor: '#F3F4F6' },
  bodyPad:   { padding: 16 },

  // Header
  header:        { backgroundColor: RED, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox:       { width: 36, height: 36, backgroundColor: 'white', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoEmoji:     { fontSize: 18 },
  logoName:      { color: 'white', fontSize: 17, fontWeight: '800' as const },
  logoSub:       { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifWrap:     { position: 'relative' as const, padding: 4 },
  notifEmoji:    { fontSize: 20 },
  notifDot:      { position: 'absolute' as const, top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FBBF24', borderWidth: 1.5, borderColor: RED },
  avatar:        { width: 34, height: 34, borderRadius: 17, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { color: 'white', fontWeight: '700' as const, fontSize: 12 },

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
  ctaBtn:          { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  ctaTxt:          { color: 'white', fontWeight: '800' as const, fontSize: 14 },
  dismissBtn:      { paddingVertical: 10, alignItems: 'center' },
  dismissTxt:      { color: '#6B7280', fontWeight: '600' as const, fontSize: 13 },

  dot:             { width: 10, height: 10, borderRadius: 5 },
});
