import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { PROMPT_CHIPS, AI_REPLIES, nowTime } from '../data';
import { shared, RED } from '../styles/shared';
import Header from '../components/Header';

interface ChatMsg { id: string; role: 'user' | 'ai'; text: string; time: string; }

const INITIAL_MSGS: ChatMsg[] = [
  {
    id: 'm0', role: 'ai', time: '2:30 PM',
    text: "👋 Hi Ngoc! I'm MiniTA, your AI teaching assistant.\n\nI can help you with assignments, summarize syllabi, generate study plans, calculate grades, and more.\n\nWhat do you need help with today?",
  },
  {
    id: 'm1', role: 'user', time: '2:33 PM',
    text: 'Summarize the CS 3354 Rubric and show me the grading breakdown.',
  },
  {
    id: 'm2', role: 'ai', time: '2:34 PM',
    text: "Sure! Here's the CS 3354 grading breakdown:\n\n📘 Project 1 — Software Design Doc: 20%\nDue: Feb 28, 2026 ✅\n\n🟣 Project 2 — Full Stack App: 30% ← You are here\nDue: Apr 15, 2026\n\n🔴 Final Exam — Comprehensive: 50%\nDate: May 10, 2026\n\n💡 Recommendation: Project 2 is worth the most points you can still earn. Focus here for maximum grade impact!",
  },
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MSGS);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const scrollRef               = useRef<ScrollView>(null);

  // Animated typing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!typing) return;
    const anim = (d: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(d, { toValue: -6, duration: 280, useNativeDriver: true }),
        Animated.timing(d, { toValue:  0, duration: 280, useNativeDriver: true }),
      ]));
    const a = Animated.parallel([anim(dot1, 0), anim(dot2, 140), anim(dot3, 280)]);
    a.start();
    return () => a.stop();
  }, [typing]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', text: t, time: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      const reply = AI_REPLIES[t] ??
        `That's a great question! Let me analyze your schedule and courses.\n\nBased on your current workload, I can see you have several items needing attention. Would you like me to:\n\n• 📋 Prioritize your overdue tasks\n• 📅 Build a study schedule\n• 🧮 Calculate your current grades\n\nJust let me know!`;
      const aiMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: reply, time: nowTime() };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1800);
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header />

      {/* AI header strip */}
      <View style={s.aiStrip}>
        <View style={s.aiAvatar}><Text style={s.aiAvatarTxt}>AI</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.aiName}>MiniTA Assistant</Text>
          <Text style={s.aiStatus}>{typing ? '● Typing…' : '● Online · Ready to help'}</Text>
        </View>
        <TouchableOpacity style={s.clearBtn} onPress={() => setMessages([INITIAL_MSGS[0]])}>
          <Text style={s.clearBtnTxt}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={s.chatBody}
          contentContainerStyle={s.chatBodyContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
              {msg.role === 'ai' && (
                <View style={s.aiBubbleAvatar}><Text style={s.aiBubbleAvatarTxt}>AI</Text></View>
              )}
              <View style={{ maxWidth: '78%' }}>
                <View style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
                  <Text style={[s.bubbleTxt, msg.role === 'user' && s.bubbleTxtUser]}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={[s.msgTime, msg.role === 'user' && { textAlign: 'right' }]}>{msg.time}</Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {typing && (
            <View style={s.msgRow}>
              <View style={s.aiBubbleAvatar}><Text style={s.aiBubbleAvatarTxt}>AI</Text></View>
              <View style={[s.bubble, s.bubbleAI, { paddingVertical: 14, paddingHorizontal: 18 }]}>
                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  {[dot1, dot2, dot3].map((d, i) => (
                    <Animated.View key={i} style={[s.typingDot, { transform: [{ translateY: d }] }]} />
                  ))}
                </View>
              </View>
            </View>
          )}
          <View style={{ height: 8 }} />
        </ScrollView>

        {/* Prompt chips */}
        <View style={s.chipsSection}>
          <Text style={s.chipsSectionLabel}>Suggested Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
            {PROMPT_CHIPS.map((chip, i) => (
              <TouchableOpacity
                key={i}
                style={[s.promptChip, { backgroundColor: chip.color }]}
                onPress={() => send(chip.msg)}
                disabled={typing}
                activeOpacity={0.8}
              >
                <Text style={s.promptChipTxt}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input row */}
        <View style={s.inputRow}>
          <TouchableOpacity style={s.attachBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 22 }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={s.chatInput}
            placeholder="Type your question…"
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || typing) && s.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || typing}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  aiStrip:            { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiAvatar:           { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  aiAvatarTxt:        { color: 'white', fontWeight: '800', fontSize: 13 },
  aiName:             { color: 'white', fontWeight: '700', fontSize: 15 },
  aiStatus:           { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },
  clearBtn:           { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  clearBtnTxt:        { color: 'white', fontSize: 12, fontWeight: '600' },

  chatBody:           { flex: 1, backgroundColor: '#F9FAFB' },
  chatBodyContent:    { padding: 16 },

  msgRow:             { flexDirection: 'row', marginBottom: 16, gap: 8, alignItems: 'flex-end' },
  msgRowUser:         { flexDirection: 'row-reverse' },
  aiBubbleAvatar:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiBubbleAvatarTxt:  { color: 'white', fontWeight: '800', fontSize: 10 },

  bubble:             { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAI:           { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderBottomLeftRadius: 4 },
  bubbleUser:         { backgroundColor: RED, borderBottomRightRadius: 4 },
  bubbleTxt:          { fontSize: 14, color: '#111827', lineHeight: 21 },
  bubbleTxtUser:      { color: 'white' },
  msgTime:            { fontSize: 10, color: '#9CA3AF', marginTop: 4, marginHorizontal: 4 },

  typingDot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },

  chipsSection:       { backgroundColor: 'white', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  chipsSectionLabel:  { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  promptChip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  promptChipTxt:      { color: 'white', fontWeight: '700', fontSize: 12 },

  inputRow:           { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  attachBtn:          { padding: 8 },
  chatInput:          { flex: 1, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: '#111827', maxHeight: 100 },
  sendBtn:            { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:    { backgroundColor: '#D1D5DB' },
});
