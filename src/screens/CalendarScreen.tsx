import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import type { AppNotification } from '../../App';
import {
  CAL_EVENTS, CalEvent, COURSES,
  WEEK_DAYS, WEEK_DATES, HOURS, HOUR_LABELS, formatHour,
} from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import Header from '../components/Header';
import EventDetailModal from '../components/modals/EventDetailModal';
import ConflictModal from '../components/modals/ConflictModal';

interface Props {
  theme: AppTheme;
  netId: string;
  notifications: AppNotification[];
  onOpenSettings: () => void;
}

export default function CalendarScreen({ theme, netId, notifications, onOpenSettings }: Props) {
  const shared = getSharedStyles(theme);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showConflict, setShowConflict] = useState(false);

  const isConflictDay = selectedDay === 2;
  const dayEvents = CAL_EVENTS.filter(e => e.day === selectedDay + 1);

  const handleDayPress = (idx: number) => {
    setSelectedDay(idx);
    if (idx === 2) setShowConflict(true);
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header theme={theme} netId={netId} notifications={notifications} onProfilePress={onOpenSettings} />

      <View style={s.pageShell}>
      <View style={[s.titleRow, { backgroundColor: theme.colors.brandSoft }]}>
        <View>
          <Text style={[s.title, { color: theme.colors.text }]}>Weekly Calendar</Text>
          <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>March 9 - 15, 2026</Text>
        </View>
        <View style={[s.weekPill, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[s.weekPillTxt, { color: theme.colors.accent }]}>Week 10</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.daySelectorWrap, { backgroundColor: theme.colors.brandSoft }]}
        contentContainerStyle={s.daySelectorContent}
      >
        {WEEK_DAYS.map((day, i) => {
          const active = i === selectedDay;
          const hasEvents = CAL_EVENTS.some(e => e.day === i + 1);
          const isConflict = i === 2;
          return (
            <TouchableOpacity
              key={i}
              style={[
                s.dayBtn,
                active && { backgroundColor: theme.colors.surfaceMuted },
                isConflict && !active && { backgroundColor: '#4A2527', borderWidth: 1.5, borderColor: '#7D3A3D' },
              ]}
              onPress={() => handleDayPress(i)}
            >
              <Text style={[s.dayLabel, { color: active ? theme.colors.accent : theme.colors.textMuted }]}>{day}</Text>
              <Text style={[s.dayDate, { color: active ? theme.colors.text : theme.colors.text }]}>{WEEK_DATES[i]}</Text>
              {isConflict && !active ? <Text style={s.conflictMark}>!</Text> : null}
              {hasEvents && !isConflict ? <View style={[s.eventDot, { backgroundColor: active ? theme.colors.accent : theme.colors.textMuted }]} /> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isConflictDay ? (
        <TouchableOpacity style={[s.conflictBanner, { backgroundColor: theme.colors.warningSoft, borderBottomColor: theme.colors.accentSoft }]} onPress={() => setShowConflict(true)}>
          <Text style={[s.conflictBannerTxt, { color: theme.colors.warning }]}>4 overlapping events today. Tap for details.</Text>
          <Text style={[s.conflictBannerChev, { color: theme.colors.warning }]}>{'>'}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={[s.dayHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[s.dayHeaderTxt, { color: theme.colors.text }]}>
          {WEEK_DAYS[selectedDay]}, March {WEEK_DATES[selectedDay]}
        </Text>
        <Text style={[s.dayEventCount, { color: theme.colors.textMuted }]}>
          {dayEvents.length === 0 ? 'No events' : `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      <ScrollView style={shared.body} showsVerticalScrollIndicator={false} contentContainerStyle={s.bodyPad}>
        {dayEvents.length === 0 ? (
          <View style={s.emptyDay}>
            <Text style={[s.emptyDayTxt, { color: theme.colors.text }]}>No events scheduled</Text>
            <Text style={[s.emptyDaySub, { color: theme.colors.textMuted }]}>Enjoy your free day.</Text>
          </View>
        ) : null}

        {HOURS.map((hr, hi) => {
          const events = dayEvents.filter(e => Math.floor(e.startHour) === hr);
          return (
            <View key={hr} style={[s.timeRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[s.timeLabel, { color: theme.colors.textSoft }]}>{HOUR_LABELS[hi]}</Text>
              <View style={s.timeSlot}>
                {events.map(ev => {
                  const c = COURSES[ev.course];
                  const dur = ev.endHour - ev.startHour;
                  const h = Math.max(dur * 60, 52);
                  return (
                    <TouchableOpacity
                      key={ev.id}
                      style={[s.eventBlock, { backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : c.color, minHeight: h, borderColor: theme.mode === 'dark' ? theme.colors.border : c.color }]}
                      onPress={() => setSelectedEvent(ev)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.eventTitle, { color: theme.mode === 'dark' ? theme.colors.text : '#FFFFFF' }]} numberOfLines={2}>{ev.title}</Text>
                      <Text style={[s.eventTime, { color: theme.mode === 'dark' ? theme.colors.textMuted : 'rgba(255,255,255,0.85)' }]}>{formatHour(ev.startHour)} - {formatHour(ev.endHour)}</Text>
                      {ev.course === 'SELF' ? (
                        <View style={[s.personalTag, { backgroundColor: theme.colors.accentSoft }]}>
                          <Text style={[s.personalTagTxt, { color: theme.colors.accent }]}>PERSONAL</Text>
                        </View>
                      ) : null}
                      <Text style={[s.tapHint, { color: theme.colors.textSoft }]}>Tap for details</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
      </View>

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <ConflictModal visible={showConflict} onClose={() => setShowConflict(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pageShell: {
    flex: 1,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  bodyPad: {
    paddingBottom: 24,
  },
  titleRow: { paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  weekPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  weekPillTxt: { fontSize: 12, fontWeight: '700' },
  daySelectorWrap: { maxHeight: 76 },
  daySelectorContent: { paddingHorizontal: 10, paddingBottom: 12, gap: 6, flexDirection: 'row', alignItems: 'center' },
  dayBtn: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minWidth: 46 },
  dayLabel: { fontSize: 10, fontWeight: '700' },
  dayDate: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  conflictMark: { fontSize: 10, marginTop: 2, color: '#F6D46B' },
  eventDot: { width: 5, height: 5, borderRadius: 3, marginTop: 3 },
  conflictBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  conflictBannerTxt: { flex: 1, fontSize: 12, fontWeight: '600' },
  conflictBannerChev: { fontSize: 18, fontWeight: '700' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  dayHeaderTxt: { fontSize: 15, fontWeight: '700' },
  dayEventCount: { fontSize: 12, fontWeight: '500' },
  timeRow: { flexDirection: 'row', borderBottomWidth: 1, minHeight: 60 },
  timeLabel: { width: 58, paddingTop: 10, paddingLeft: 12, fontSize: 11, fontWeight: '600' },
  timeSlot: { flex: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  eventBlock: { borderRadius: 10, padding: 10, marginBottom: 4, borderWidth: 1 },
  eventTitle: { fontWeight: '700', fontSize: 14 },
  eventTime: { fontSize: 11, marginTop: 2 },
  personalTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  personalTagTxt: { fontSize: 9, fontWeight: '800' },
  tapHint: { fontSize: 10, marginTop: 4 },
  emptyDay: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyDayTxt: { fontSize: 16, fontWeight: '700' },
  emptyDaySub: { fontSize: 13, marginTop: 4 },
});
