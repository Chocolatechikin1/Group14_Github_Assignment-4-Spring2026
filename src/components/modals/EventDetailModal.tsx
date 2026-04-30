import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalEvent, COURSES, formatHour } from '../../data';
import { shared } from '../../styles/shared';

interface Props {
  event: CalEvent | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: Props) {
  if (!event) return null;
  const course = COURSES[event.course];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={shared.overlay}>
        <View style={[shared.sheet, { padding: 0 }]}>
          {/* Colored header */}
          <View style={[s.head, { backgroundColor: course.color }]}>
            <Text style={s.headTitle}>{event.title}</Text>
            <Text style={s.headTime}>
              {formatHour(event.startHour)} – {formatHour(event.endHour)}
            </Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 24 }}>
            {/* Course pill */}
            <View style={[shared.coursePill, { backgroundColor: course.color + '20' }]}>
              <View style={[shared.dot, { backgroundColor: course.color }]} />
              <Text style={[shared.coursePillTxt, { color: course.color }]}>{course.label}</Text>
            </View>

            {/* Meta */}
            <View style={shared.metaGrid}>
              <View style={shared.metaCell}>
                <Text style={shared.metaLabel}>Day</Text>
                <Text style={shared.metaVal}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][event.day - 1]}, Mar {8 + event.day}</Text>
              </View>
              <View style={shared.metaCell}>
                <Text style={shared.metaLabel}>Duration</Text>
                <Text style={shared.metaVal}>{((event.endHour - event.startHour) * 60).toFixed(0)} min</Text>
              </View>
            </View>

            <Text style={shared.detailHead}>Notes</Text>
            <Text style={shared.detailTxt}>{event.detail}</Text>

            <TouchableOpacity style={[shared.ctaBtn, { backgroundColor: course.color }]} onPress={onClose}>
              <Text style={shared.ctaTxt}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  head:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 28 },
  headTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  headTime:  { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  closeBtn:  { position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  closeTxt:  { color: 'white', fontSize: 16, fontWeight: '700' },
});
