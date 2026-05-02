import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import type { TabName, AppNotification } from '../../App';
import { TASKS, COURSES, Task } from '../data';
import { AppTheme, getSharedStyles, RED } from '../styles/shared';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import AddStudyModal from '../components/modals/AddStudyModal';
import { StoredUser } from '../services/authStorage';

interface Props {
  goToTab: (t: TabName) => void;
  currentUser: StoredUser;
  theme: AppTheme;
  notifications: AppNotification[];
  onOpenSettings: () => void;
}

interface ExtraBlock {
  title: string;
  course: string;
  duration: string;
}

export default function DashboardScreen({ goToTab, currentUser, theme, notifications, onOpenSettings }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAddStudy, setShowAddStudy] = useState(false);
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);
  const shared = useMemo(() => getSharedStyles(theme), [theme]);

  const toggle = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = TASKS.filter(t =>
    !search || [t.title, COURSES[t.course].label, t.type].some(s => s.toLowerCase().includes(search.toLowerCase())),
  );

  const overdue = filtered.filter(t => t.status === 'overdue');
  const upcoming = filtered.filter(t => t.status === 'upcoming');

  return (
    <SafeAreaView style={shared.screen}>
      <Header netId={currentUser.netId} theme={theme} notifications={notifications} onProfilePress={onOpenSettings} />

      <ScrollView style={shared.body} contentContainerStyle={shared.bodyPad} showsVerticalScrollIndicator={false}>
        <View style={s.pageShell}>
          <View style={[s.searchBar, { backgroundColor: theme.mode === 'dark' ? '#D9D9DE' : theme.colors.surface, borderColor: theme.colors.border }, searchFocused && { borderColor: theme.colors.accent }]}>
            <IoniconsSearch color={theme.colors.textSoft} />
            <TextInput
              style={[s.searchInput, { color: theme.mode === 'dark' ? '#1F2937' : theme.colors.text }]}
              placeholder="Search assignments, courses, dates..."
              placeholderTextColor={theme.mode === 'dark' ? '#6B7280' : theme.colors.textSoft}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={[s.clearX, { color: theme.colors.textSoft }]}>x</Text>
              </TouchableOpacity>
            ) : null}
          </View>

        <View style={[s.welcomeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.welcomeTitle, { color: theme.colors.text }]}>
              Welcome back, <Text style={[s.welcomeName, { color: theme.colors.accent }]}>{currentUser.fullName}</Text>!
            </Text>
            <Text style={[s.welcomeSub, { color: theme.colors.textMuted }]}>Signed in as {currentUser.email}</Text>
          </View>
          <TouchableOpacity style={[s.studyBtn, { backgroundColor: theme.colors.accent }]} onPress={() => setShowAddStudy(true)}>
            <Text style={s.studyBtnTxt}>+ Study Block</Text>
          </TouchableOpacity>
        </View>

        <View style={s.chipRow}>
          <TouchableOpacity style={[s.chip, { backgroundColor: theme.mode === 'dark' ? '#563033' : '#FEE2E2' }]} onPress={() => setSearch('')}>
            <Text style={[s.chipNum, { color: theme.colors.danger }]}>{overdue.length}</Text>
            <Text style={[s.chipLbl, { color: theme.colors.danger }]}>Overdue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.chip, { backgroundColor: theme.mode === 'dark' ? '#35506B' : '#DBEAFE' }]} onPress={() => setSearch('')}>
            <Text style={[s.chipNum, { color: theme.mode === 'dark' ? '#C1E0FF' : '#1D4ED8' }]}>{upcoming.length}</Text>
            <Text style={[s.chipLbl, { color: theme.mode === 'dark' ? '#C1E0FF' : '#1D4ED8' }]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.chip, { backgroundColor: theme.mode === 'dark' ? '#305A43' : '#DCFCE7' }]} onPress={() => goToTab('Calendar')}>
            <Text style={[s.chipNum, { color: theme.colors.success }]}>{checked.size}</Text>
            <Text style={[s.chipLbl, { color: theme.colors.success }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {overdue.length > 0 ? (
          <>
            <View style={shared.sectionHead}>
              <View style={[shared.sectionAccent, { backgroundColor: theme.colors.danger }]} />
              <Text style={shared.sectionTitle}>Overdue Tasks</Text>
            </View>
            {overdue.map(t => (
              <TaskCard key={t.id} task={t} checked={checked.has(t.id)} onCheck={toggle} onViewDetails={setSelectedTask} theme={theme} />
            ))}
          </>
        ) : null}

        {upcoming.length > 0 ? (
          <>
            <View style={shared.sectionHead}>
              <View style={[shared.sectionAccent, { backgroundColor: theme.colors.accent }]} />
              <Text style={shared.sectionTitle}>Upcoming Tasks</Text>
            </View>
            {upcoming.map(t => (
              <TaskCard key={t.id} task={t} checked={checked.has(t.id)} onCheck={toggle} onViewDetails={setSelectedTask} theme={theme} />
            ))}
          </>
        ) : null}

        {extraBlocks.length > 0 ? (
          <>
            <View style={shared.sectionHead}>
              <View style={[shared.sectionAccent, { backgroundColor: theme.colors.accent }]} />
              <Text style={shared.sectionTitle}>My Study Blocks</Text>
            </View>
            {extraBlocks.map((blk, i) => {
              const c = COURSES[blk.course] ?? COURSES.SELF;
              return (
                <View key={i} style={[s.extraCard, { backgroundColor: theme.colors.surface, borderLeftColor: c.color }]}>
                  <View style={[s.extraDot, { backgroundColor: c.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.extraTitle, { color: theme.colors.text }]}>{blk.title}</Text>
                    <Text style={[s.extraSub, { color: theme.colors.textMuted }]}>{c.label} | {blk.duration}</Text>
                  </View>
                </View>
              );
            })}
          </>
        ) : null}

        <View style={[s.proTip, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <Text style={[s.proTipHead, { color: theme.colors.accent }]}>Study Prompt</Text>
          <Text style={[s.proTipBody, { color: theme.colors.textMuted }]}>
            Ask MiniTA to summarize your week, prioritize late work, or draft a project study plan.
          </Text>
          <TouchableOpacity style={[s.proTipBtn, { backgroundColor: theme.colors.accent }]} onPress={() => goToTab('AI Chat')}>
            <Text style={s.proTipBtnTxt}>Open MiniTA AI</Text>
          </TouchableOpacity>
        </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={id =>
          setChecked(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
          })
        }
      />
      <AddStudyModal
        visible={showAddStudy}
        onClose={() => setShowAddStudy(false)}
        onAdd={(title, course, duration) => setExtraBlocks(prev => [...prev, { title, course, duration }])}
      />
    </SafeAreaView>
  );
}

function IoniconsSearch({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 14 }}>⌕</Text>;
}

const s = StyleSheet.create({
  pageShell: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  searchBar: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 13 },
  clearX: { fontSize: 14, fontWeight: '600', paddingHorizontal: 4 },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  welcomeTitle: { fontSize: 15, fontWeight: '700' },
  welcomeName: { fontWeight: '900' },
  welcomeSub: { fontSize: 11, marginTop: 2 },
  studyBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  studyBtnTxt: { color: '#111827', fontWeight: '800', fontSize: 12 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  chipNum: { fontSize: 22, fontWeight: '800' },
  chipLbl: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  extraCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  extraDot: { width: 10, height: 10, borderRadius: 5 },
  extraTitle: { fontSize: 14, fontWeight: '700' },
  extraSub: { fontSize: 12, marginTop: 2 },
  proTip: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginTop: 4 },
  proTipHead: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  proTipBody: { fontSize: 12, lineHeight: 18 },
  proTipBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  proTipBtnTxt: { color: '#111827', fontWeight: '800', fontSize: 12 },
});
