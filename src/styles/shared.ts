import { Platform, StyleSheet } from 'react-native';

export const RED = '#BC0001';
export const LIGHT_RED = '#D65254';
export const GOLD = '#D4A63A';
export const SOFT_GOLD = '#F4D58D';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: {
    brand: string;
    brandSoft: string;
    accent: string;
    accentSoft: string;
    screen: string;
    body: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    textSoft: string;
    border: string;
    header: string;
    headerSub: string;
    headerIconBg: string;
    avatar: string;
    tabBar: string;
    success: string;
    warning: string;
    warningSoft: string;
    danger: string;
  };
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    brand: RED,
    brandSoft: LIGHT_RED,
    accent: GOLD,
    accentSoft: SOFT_GOLD,
    screen: RED,
    body: '#F6F2F1',
    surface: '#FFFFFF',
    surfaceMuted: '#FFF8F1',
    text: '#111827',
    textMuted: '#6B7280',
    textSoft: '#94A3B8',
    border: '#E8D9D3',
    header: '#FFFFFF',
    headerSub: 'rgba(255,255,255,0.78)',
    headerIconBg: '#FFF3DC',
    avatar: '#D4A63A',
    tabBar: '#FFFFFF',
    success: '#15803D',
    warning: '#92400E',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    brand: '#303036',
    brandSoft: '#393941',
    accent: '#D4A63A',
    accentSoft: '#4B4122',
    screen: '#24242A',
    body: '#2E2E35',
    surface: '#383842',
    surfaceMuted: '#44444E',
    text: '#F2F0EA',
    textMuted: '#C8C2B4',
    textSoft: '#A29C90',
    border: '#54545F',
    header: '#F5D58E',
    headerSub: 'rgba(245,213,142,0.72)',
    headerIconBg: '#3A321E',
    avatar: '#D4A63A',
    tabBar: '#31313A',
    success: '#7BD89A',
    warning: '#FBBF24',
    warningSoft: '#4A3B18',
    danger: '#F48A8A',
  },
};

export const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  android: { elevation: 3 },
}) ?? {};

export const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  android: { elevation: 4 },
}) ?? {};

export const getSharedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.screen },
    body: { flex: 1, backgroundColor: theme.colors.body },
    bodyPad: { padding: 16 },

    header: {
      backgroundColor: theme.colors.brand,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoBox: {
      width: 40,
      height: 40,
      backgroundColor: theme.colors.headerIconBg,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentSoft,
    },
    logoName: { color: theme.colors.header, fontSize: 17, fontWeight: '800' as const },
    logoSub: { color: theme.colors.headerSub, fontSize: 10 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    notifWrap: { position: 'relative' as const, padding: 4 },
    notifDot: {
      position: 'absolute' as const,
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
      borderWidth: 1.5,
      borderColor: theme.colors.brand,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.avatar,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTxt: { color: '#111827', fontWeight: '800' as const, fontSize: 12 },

    sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    sectionAccent: { width: 4, height: 20, borderRadius: 2 },
    sectionTitle: { fontSize: 15, fontWeight: '700' as const, color: theme.colors.text, flex: 1 },
    sectionBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    sectionBadgeTxt: { fontSize: 12, fontWeight: '700' as const },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' as const },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center' as const,
      marginBottom: 16,
    },
    modalTitle: { fontSize: 19, fontWeight: '800' as const, color: theme.colors.text, flex: 1 },
    modalHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      marginBottom: 12,
    },
    modalClose: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCloseTxt: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '700' as const },
    coursePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start' as const,
      marginBottom: 16,
    },
    coursePillTxt: { fontSize: 13, fontWeight: '700' as const },
    metaGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    metaCell: { flex: 1, backgroundColor: theme.colors.surfaceMuted, borderRadius: 10, padding: 10 },
    metaLabel: {
      fontSize: 10,
      color: theme.colors.textSoft,
      fontWeight: '600' as const,
      marginBottom: 3,
      textTransform: 'uppercase' as const,
    },
    metaVal: { fontSize: 13, color: theme.colors.text, fontWeight: '700' as const },
    detailHead: { fontSize: 13, fontWeight: '700' as const, color: theme.colors.textMuted, marginBottom: 6 },
    detailTxt: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 20, marginBottom: 20 },
    ctaBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    ctaTxt: { color: 'white', fontWeight: '800' as const, fontSize: 14 },
    dismissBtn: { paddingVertical: 10, alignItems: 'center' },
    dismissTxt: { color: theme.colors.textMuted, fontWeight: '600' as const, fontSize: 13 },
    dot: { width: 10, height: 10, borderRadius: 5 },
  });

export const shared = getSharedStyles(lightTheme);
