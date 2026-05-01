import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, useWindowDimensions,
} from 'react-native';
import {
  CAL_EVENTS, CalEvent, COURSES,
  WEEK_DAYS, WEEK_DATES, HOURS, HOUR_LABELS, formatHour,
} from '../data';
import { shared, ACCENT } from '../styles/shared';
import Header from '../components/Header';
import EventDetailModal from '../components/modals/EventDetailModal';
import ConflictModal from '../components/modals/ConflictModal';

export default function CalendarScreen() {
  const [selectedDay, setSelectedDay]     = useState(0); // 0 = Mon
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showConflict, setShowConflict]   = useState(false);

  const isConflictDay = selectedDay === 2; // Wednesday
  const dayEvents     = CAL_EVENTS.filter(e => e.day === selectedDay + 1);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleDayPress = (idx: number) => {
    setSelectedDay(idx);
    if (idx === 2) setShowConflict(true); // auto-open conflict warning for Wed
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header />

      {/* Title */}
      <View style={s.titleRow}>
        <View>
          <Text style={s.title}>Weekly Calendar</Text>
          <Text style={s.subtitle}>March 9 – 15, 2026</Text>
        </View>
        <View style={s.weekPill}>
          <Text style={s.weekPillTxt}>Week 10</Text>
        </View>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.daySelectorWrap}
        contentContainerStyle={s.daySelectorContent}
      >
        {WEEK_DAYS.map((day, i) => {
          const active     = i === selectedDay;
          const hasEvents  = CAL_EVENTS.some(e => e.day === i + 1);
          const isConflict = i === 2;
          return (
            <TouchableOpacity
              key={i}
              style={[s.dayBtn, active && s.dayBtnActive, isConflict && !active && s.dayBtnConflict]}
              onPress={() => handleDayPress(i)}
            >
              <Text style={[s.dayLabel, active && s.dayLabelActive]}>{day}</Text>
              <Text style={[s.dayDate, active && s.dayDateActive]}>{WEEK_DATES[i]}</Text>
              {isConflict && !active && <Text style={s.conflictMark}>⚠️</Text>}
              {hasEvents && !isConflict && (
                <View style={[s.eventDot, active && s.eventDotActive]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Conflict banner */}
      {isConflictDay && (
        <TouchableOpacity style={[s.conflictBanner, isDesktop && { maxWidth: 800, marginHorizontal: 'auto', width: '100%', borderRadius: 8, marginTop: 12 }]} onPress={() => setShowConflict(true)}>
          <Text style={s.conflictBannerTxt}>⚠️  4 overlapping events today — tap for details</Text>
          <Text style={s.conflictBannerChev}>›</Text>
        </TouchableOpacity>
      )}

      {/* Day label */}
      <View style={[s.dayHeader, isDesktop && { maxWidth: 800, marginHorizontal: 'auto', width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12, marginTop: 24 }]}>
        <Text style={s.dayHeaderTxt}>
          {WEEK_DAYS[selectedDay]}, March {WEEK_DATES[selectedDay]}
        </Text>
        <Text style={s.dayEventCount}>
          {dayEvents.length === 0 ? 'No events' : `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Time grid */}
      <ScrollView style={[shared.body, isDesktop && { maxWidth: 800, marginHorizontal: 'auto', width: '100%', backgroundColor: 'white', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingBottom: 20 }]} showsVerticalScrollIndicator={false}>
        {dayEvents.length === 0 && (
          <View style={s.emptyDay}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
            <Text style={s.emptyDayTxt}>No events scheduled</Text>
            <Text style={s.emptyDaySub}>Enjoy your free day!</Text>
          </View>
        )}
        {HOURS.map((hr, hi) => {
          const events = dayEvents.filter(e => Math.floor(e.startHour) === hr);
          return (
            <View key={hr} style={s.timeRow}>
              <Text style={s.timeLabel}>{HOUR_LABELS[hi]}</Text>
              <View style={s.timeSlot}>
                {events.map(ev => {
                  const c   = COURSES[ev.course];
                  const dur = ev.endHour - ev.startHour;
                  const h   = Math.max(dur * 60, 52);
                  return (
                    <TouchableOpacity
                      key={ev.id}
                      style={[s.eventBlock, { backgroundColor: c.color, minHeight: h }]}
                      onPress={() => setSelectedEvent(ev)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.eventTitle} numberOfLines={2}>{ev.title}</Text>
                      <Text style={s.eventTime}>{formatHour(ev.startHour)} – {formatHour(ev.endHour)}</Text>
                      {ev.course === 'SELF' && (
                        <View style={s.personalTag}>
                          <Text style={s.personalTagTxt}>PERSONAL</Text>
                        </View>
                      )}
                      <Text style={s.tapHint}>Tap for details ›</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <ConflictModal visible={showConflict} onClose={() => setShowConflict(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  titleRow:           { backgroundColor: ACCENT, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:              { color: 'white', fontSize: 20, fontWeight: '800' },
  subtitle:           { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  weekPill:           { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  weekPillTxt:        { color: 'white', fontSize: 12, fontWeight: '700' },

  daySelectorWrap:    { backgroundColor: ACCENT, maxHeight: 76 },
  daySelectorContent: { paddingHorizontal: 10, paddingBottom: 12, gap: 6, flexDirection: 'row', alignItems: 'center' },
  dayBtn:             { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minWidth: 46 },
  dayBtnActive:       { backgroundColor: 'white' },
  dayBtnConflict:     { backgroundColor: 'rgba(254,226,226,0.25)', borderWidth: 1.5, borderColor: 'rgba(254,202,202,0.6)' },
  dayLabel:           { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' },
  dayLabelActive:     { color: ACCENT, fontWeight: '800' },
  dayDate:            { color: 'white', fontSize: 18, fontWeight: '700', marginTop: 2 },
  dayDateActive:      { color: ACCENT },
  conflictMark:       { fontSize: 10, marginTop: 2 },
  eventDot:           { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)', marginTop: 3 },
  eventDotActive:     { backgroundColor: ACCENT },

  conflictBanner:     { backgroundColor: '#FEF3C7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FCD34D' },
  conflictBannerTxt:  { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '600' },
  conflictBannerChev: { fontSize: 18, color: '#92400E', fontWeight: '700' },

  dayHeader:          { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dayHeaderTxt:       { fontSize: 15, fontWeight: '700', color: '#111827' },
  dayEventCount:      { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  timeRow:            { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', minHeight: 60 },
  timeLabel:          { width: 58, paddingTop: 10, paddingLeft: 12, fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  timeSlot:           { flex: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  eventBlock:         { borderRadius: 10, padding: 10, marginBottom: 4 },
  eventTitle:         { color: 'white', fontWeight: '700', fontSize: 14 },
  eventTime:          { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },
  personalTag:        { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  personalTagTxt:     { color: 'white', fontSize: 9, fontWeight: '800' },
  tapHint:            { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4 },

  emptyDay:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyDayTxt:        { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyDaySub:        { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
});
