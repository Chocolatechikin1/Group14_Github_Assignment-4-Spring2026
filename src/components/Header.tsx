import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shared, RED } from '../styles/shared';

interface Props {
  right?: React.ReactNode;
  netId?: string;
}

export default function Header({ right, netId }: Props) {
  const initials = netId ? netId.slice(0, 2).toUpperCase() : 'NG';
  return (
    <View style={shared.header}>
      <View style={shared.logoRow}>
        <View style={shared.logoBox}>
          <Ionicons name="school" size={20} color={RED} />
        </View>
        <View>
          <Text style={shared.logoName}>MiniTA</Text>
          <Text style={shared.logoSub}>AI Teaching Assistant</Text>
        </View>
      </View>
      <View style={shared.headerRight}>
        {right}
        <TouchableOpacity style={shared.notifWrap}>
          <Ionicons name="notifications-outline" size={22} color="white" />
          <View style={shared.notifDot} />
        </TouchableOpacity>
        <View style={shared.avatar}>
          <Text style={shared.avatarTxt}>{initials}</Text>
        </View>
      </View>
    </View>
  );
}
