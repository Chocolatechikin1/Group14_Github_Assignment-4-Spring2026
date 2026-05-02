import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { shared } from '../../styles/shared';

// Local notification data keeps the demo interactive before a real backend exists.
interface Notif {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  course: string;
  color: string;
  unread: boolean;
}

const SEED: Notif[] = [
  { id: 'n1', icon: '🔴', title: 'Physics HW 4 due tonight',
    body: 'Submit Chapter 4 problems by 11:59 PM.',
    time: '2h ago', course: 'Physics 2325', color: '#3B82F6', unread: true },
  { id: 'n2', icon: '⚠️', title: 'Calculus Problem Set 6 is overdue',
    body: 'Late penalty: -10% per day. Submit ASAP.',
    time: '1d ago', course: 'Math 2417', color: '#22C55E', unread: true },
  { id: 'n3', icon: '📅', title: 'Calculus Exam 2 in 5 days',
    body: 'Closed-book, 90 minutes. 4 formula sheets allowed.',
    time: '5h ago', course: 'Math 2417', color: '#22C55E', unread: true },
  { id: 'n4', icon: '💬', title: 'New announcement from Dr. Patel',
    body: 'Office hours moved to Thursday 4 PM this week.',
    time: 'Yesterday', course: 'CS 3354', color: '#DC2626', unread: false },
  { id: 'n5', icon: '✅', title: 'Grade posted: Physics Quiz 1',
    body: 'You scored 92/100. Great work!',
    time: '2d ago', course: 'Physics 2325', color: '#3B82F6', unread: false },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationModal({ visible, onClose }: Props) {
  const [items, setItems] = useState<Notif[]>(SEED);
  const unreadCount = items.filter(i => i.unread).length;

  const markRead   = (id: string) =>
    setItems(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = () =>
    setItems(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={shared.overlay}>
        <View style={[shared.sheet, s.sheet]}>
          <View style={shared.sheetHandle} />

          <View style={shared.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={shared.modalTitle}>Notifications</Text>
              <Text style={s.subtitle}>
                {unreadCount === 0 ? 'You\'re all caught up' : `${unreadCount} unread`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={shared.modalClose}>
              <Text style={shared.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={s.markAllBtn}>
              <Text style={s.markAllTxt}>Mark all as read</Text>
            </TouchableOpacity>
          )}

          <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
            {items.map(n => (
              <TouchableOpacity
                key={n.id}
                style={[s.item, n.unread && s.itemUnread, { borderLeftColor: n.color }]}
                onPress={() => markRead(n.id)}
                activeOpacity={0.7}
              >
                <Text style={s.icon}>{n.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.rowTop}>
                    <Text style={s.title} numberOfLines={1}>{n.title}</Text>
                    {n.unread && <View style={s.dot} />}
                  </View>
                  <Text style={s.body} numberOfLines={2}>{n.body}</Text>
                  <View style={s.rowBot}>
                    <Text style={[s.course, { color: n.color }]}>{n.course}</Text>
                    <Text style={s.time}>{n.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 8 }} />
          </ScrollView>

          <TouchableOpacity style={shared.dismissBtn} onPress={onClose}>
            <Text style={shared.dismissTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet:       { maxHeight: '85%' },
  subtitle:    { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  markAllBtn:  { alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: 8, marginBottom: 8 },
  markAllTxt:  { color: '#7C3AED', fontWeight: '700', fontSize: 12 },
  list:        { maxHeight: 460 },
  item:        { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, borderLeftWidth: 4, backgroundColor: '#F9FAFB', marginBottom: 8, alignItems: 'flex-start' },
  itemUnread:  { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  icon:        { fontSize: 20, marginTop: 2 },
  rowTop:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title:       { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
  body:        { fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 17 },
  rowBot:      { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  course:      { fontSize: 11, fontWeight: '700' },
  time:        { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED' },
});
