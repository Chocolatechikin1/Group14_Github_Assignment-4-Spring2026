import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shared, ACCENT } from '../styles/shared';

interface Props {
  right?: React.ReactNode;
  netId?: string;
}

export default function Header({ right, netId }: Props) {
  const [hasNotif, setHasNotif] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const initials = netId ? netId.slice(0, 2).toUpperCase() : 'NG';

  const handleNotifPress = () => {
    setShowModal(true);
    setHasNotif(false);
  };

  return (
    <>
      <View style={shared.header}>
        <View style={shared.logoRow}>
          <View>
            <Text style={shared.logoName}>MiniTA</Text>
            <Text style={shared.logoSub}>AI Teaching Assistant</Text>
          </View>
        </View>
        <View style={shared.headerRight}>
          {right}
          <TouchableOpacity style={shared.notifWrap} onPress={handleNotifPress}>
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
            {hasNotif && <View style={shared.notifDot} />}
          </TouchableOpacity>
          <View style={shared.avatar}>
            <Text style={shared.avatarTxt}>{initials}</Text>
          </View>
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 60 }} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                <View style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 10, marginRight: 12 }}>
                  <Text style={{ fontSize: 16 }}>⚠️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>3 Overdue Assignments</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>You have an overdue Physics HW, Calculus Problem Set, and History Essay.</Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>10 minutes ago</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                <View style={{ backgroundColor: '#DBEAFE', padding: 8, borderRadius: 10, marginRight: 12 }}>
                  <Text style={{ fontSize: 16 }}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Upcoming: Physics Quiz 2</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Don't forget! Physics Quiz 2 is scheduled for March 12 at 2:00 PM.</Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>2 hours ago</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 }}>
                <View style={{ backgroundColor: '#F3E8FF', padding: 8, borderRadius: 10, marginRight: 12 }}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>MiniTA Sync Complete</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Your Canvas schedule has been fully synchronized.</Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Yesterday</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
