import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
  style?: any;
}

/**
 * Doğrulanmış kullanıcılar için mavi tik ikonu
 * Twitter/Instagram benzeri verified badge
 */
export default function VerifiedBadge({ 
  size = 16, 
  color = '#1DA1F2', // Twitter mavi
  style 
}: VerifiedBadgeProps) {
  return (
    <View style={[styles.container, style]}>
      <MaterialIcons 
        name="verified" 
        size={size} 
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
