import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import type { AppNotification } from '../../App';
import { PROMPT_CHIPS, AI_REPLIES, nowTime } from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import Header from '../components/Header';

interface ChatMsg { id: string; role: 'user' | 'ai'; text: string; time: string; }

const INITIAL_MSGS: ChatMsg[] = [
  {
    id: 'm0', role: 'ai', time: '2:30 PM',
    text: "Hi! I'm MiniTA, your AI teaching assistant.\n\nI can help with assignments, syllabi, study plans, and grade calculations.\n\nWhat do you need help with today?",
  },
  {
    id: 'm1', role: 'user', time: '2:33 PM',
    text: 'Summarize the CS 3354 Rubric and show me the grading breakdown.',
  },
  {
    id: 'm2', role: 'ai', time: '2:34 PM',
    text: "Sure! Here's the CS 3354 grading breakdown:\n\nProject 1 - Software Design Doc: 20%\nDue: Feb 28, 2026\n\nProject 2 - Full Stack App: 30%\nDue: Apr 15, 2026\n\nFinal Exam - Comprehensive: 50%\nDate: May 10, 2026\n\nRecommendation: Project 2 is worth the most points you can still earn.",
  },
];

interface Props {
  theme: AppTheme;
  netId: string;
  notifications: AppNotification[];
  onOpenSettings: () => void;
}

export default function AIChatScreen({ theme, netId, notifications, onOpenSettings }: Props) {
  const shared = getSharedStyles(theme);
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MSGS);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!typing) return;
    const anim = (d: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(d, { toValue: -6, duration: 280, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]));
    const a = Animated.parallel([anim(dot1, 0), anim(dot2, 140), anim(dot3, 280)]);
    a.start();
    return () => a.stop();
  }, [typing, dot1, dot2, dot3]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', text: t, time: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      const reply =
        AI_REPLIES[t] ??
        `That's a great question. Based on your current workload, would you like me to:\n\n- Prioritize overdue tasks\n- Build a study schedule\n- Estimate your current grades\n\nJust let me know.`;
      const aiMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: reply, time: nowTime() };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1800);
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header theme={theme} netId={netId} notifications={notifications} onProfilePress={onOpenSettings} />

      <View style={s.pageShell}>
      <View style={[s.aiStrip, { backgroundColor: theme.colors.brandSoft, borderBottomColor: theme.colors.border }]}>
        <View style={[s.aiAvatar, { backgroundColor: theme.colors.accentSoft }]}>
          <Text style={[s.aiAvatarTxt, { color: theme.colors.accent }]}>AI</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.aiName, { color: theme.colors.text }]}>MiniTA Assistant</Text>
          <Text style={[s.aiStatus, { color: theme.colors.textMuted }]}>{typing ? 'Typing...' : 'Online | Ready to help'}</Text>
        </View>
        <TouchableOpacity style={[s.clearBtn, { backgroundColor: theme.colors.surfaceMuted }]} onPress={() => setMessages([INITIAL_MSGS[0]])}>
          <Text style={[s.clearBtnTxt, { color: theme.colors.accent }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={[s.chatBody, { backgroundColor: theme.colors.body }]}
          contentContainerStyle={s.chatBodyContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
              {msg.role === 'ai' ? (
                <View style={[s.aiBubbleAvatar, { backgroundColor: theme.colors.accentSoft }]}>
                  <Text style={[s.aiBubbleAvatarTxt, { color: theme.colors.accent }]}>AI</Text>
                </View>
              ) : null}
              <View style={{ maxWidth: '78%' }}>
                <View
                  style={[
                    s.bubble,
                    msg.role === 'user'
                      ? { backgroundColor: theme.colors.accentSoft, borderBottomRightRadius: 4 }
                      : { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderBottomLeftRadius: 4 },
                  ]}
                >
                  <Text
                    style={[
                      s.bubbleTxt,
                      { color: msg.role === 'user' ? theme.colors.accent : theme.colors.text },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text style={[s.msgTime, { color: theme.colors.textSoft }, msg.role === 'user' && { textAlign: 'right' }]}>{msg.time}</Text>
              </View>
            </View>
          ))}

          {typing ? (
            <View style={s.msgRow}>
              <View style={[s.aiBubbleAvatar, { backgroundColor: theme.colors.accentSoft }]}>
                <Text style={[s.aiBubbleAvatarTxt, { color: theme.colors.accent }]}>AI</Text>
              </View>
              <View style={[s.bubble, { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, paddingVertical: 14, paddingHorizontal: 18 }]}>
                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  {[dot1, dot2, dot3].map((d, i) => (
                    <Animated.View key={i} style={[s.typingDot, { backgroundColor: theme.colors.textSoft, transform: [{ translateY: d }] }]} />
                  ))}
                </View>
              </View>
            </View>
          ) : null}
          <View style={{ height: 8 }} />
        </ScrollView>

        <View style={[s.chipsSection, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <Text style={[s.chipsSectionLabel, { color: theme.colors.textSoft }]}>Suggested Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
            {PROMPT_CHIPS.map((chip, i) => (
              <TouchableOpacity
                key={i}
                style={[s.promptChip, { backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : chip.color }]}
                onPress={() => send(chip.msg)}
                disabled={typing}
                activeOpacity={0.8}
              >
                <Text style={[s.promptChipTxt, { color: theme.mode === 'dark' ? theme.colors.text : '#FFFFFF' }]}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[s.inputRow, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity style={s.attachBtn}>
            <Text style={{ fontSize: 18, color: theme.colors.accent }}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={[s.chatInput, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surfaceMuted }]}
            placeholder="Type your question..."
            placeholderTextColor={theme.colors.textSoft}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: input.trim() && !typing ? theme.colors.accent : theme.colors.surfaceMuted }]}
            onPress={() => send(input)}
            disabled={!input.trim() || typing}
          >
            <Text style={{ color: '#111827', fontSize: 18 }}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </View>
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
  aiStrip: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1 },
  aiAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  aiAvatarTxt: { fontWeight: '800', fontSize: 13 },
  aiName: { fontWeight: '700', fontSize: 15 },
  aiStatus: { fontSize: 11, marginTop: 1 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  clearBtnTxt: { fontSize: 12, fontWeight: '700' },
  chatBody: { flex: 1 },
  chatBodyContent: { padding: 16 },
  msgRow: { flexDirection: 'row', marginBottom: 16, gap: 8, alignItems: 'flex-end' },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiBubbleAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiBubbleAvatarTxt: { fontWeight: '800', fontSize: 10 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleTxt: { fontSize: 14, lineHeight: 21 },
  msgTime: { fontSize: 10, marginTop: 4, marginHorizontal: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  chipsSection: { paddingTop: 10, paddingBottom: 8, paddingHorizontal: 16, borderTopWidth: 1 },
  chipsSectionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  promptChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  promptChipTxt: { fontWeight: '700', fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1 },
  attachBtn: { padding: 8 },
  chatInput: { flex: 1, borderWidth: 2, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
