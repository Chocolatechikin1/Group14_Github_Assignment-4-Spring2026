import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Task, COURSES } from '../../data';
import { shared } from '../../styles/shared';

interface Props {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export default function TaskDetailModal({ task, onClose, onComplete }: Props) {
  if (!task) return null;
  const course = COURSES[task.course];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={shared.overlay}>
        <View style={[shared.sheet, s.sheet]}>
          <View style={shared.sheetHandle} />

          {/* Color bar */}
          <View style={[s.colorBar, { backgroundColor: course.color }]} />

          {/* Header */}
          <View style={shared.modalHeaderRow}>
            <Text style={shared.modalTitle}>{task.title}</Text>
            <TouchableOpacity onPress={onClose} style={shared.modalClose}>
              <Text style={shared.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Course pill */}
          <View style={[shared.coursePill, { backgroundColor: course.color + '20' }]}>
            <View style={[shared.dot, { backgroundColor: course.color }]} />
            <Text style={[shared.coursePillTxt, { color: course.color }]}>{course.label}</Text>
          </View>

          {/* Meta grid */}
          <View style={shared.metaGrid}>
            <View style={shared.metaCell}>
              <Text style={shared.metaLabel}>Due</Text>
              <Text style={shared.metaVal}>{task.due}</Text>
            </View>
            <View style={shared.metaCell}>
              <Text style={shared.metaLabel}>Type</Text>
              <Text style={shared.metaVal}>{task.type}</Text>
            </View>
            <View style={shared.metaCell}>
              <Text style={shared.metaLabel}>Status</Text>
              <Text style={[shared.metaVal, { color: task.status === 'overdue' ? '#DC2626' : '#16A34A' }]}>
                {task.status === 'overdue' ? '⚠️ Overdue' : `⏳ ${task.daysLabel}`}
              </Text>
            </View>
          </View>

          {/* Detail */}
          <Text style={shared.detailHead}>Assignment Details</Text>
          <Text style={shared.detailTxt}>{task.detail}</Text>

          {/* CTA */}
          <TouchableOpacity
            style={[shared.ctaBtn, { backgroundColor: course.color }]}
            onPress={() => { onComplete(task.id); onClose(); }}
          >
            <Text style={shared.ctaTxt}>✓  Mark as Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={shared.dismissBtn} onPress={onClose}>
            <Text style={shared.dismissTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet:    { maxHeight: '90%' },
  colorBar: { height: 6, borderRadius: 3, marginBottom: 16 },
});
