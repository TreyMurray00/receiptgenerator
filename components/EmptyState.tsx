import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Receipt as ReceiptIcon } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface EmptyStateProps {
  title: string;
  message: string;
  onActionPress?: () => void;
  actionLabel?: string;
}

export default function EmptyState({ title, message, onActionPress, actionLabel }: EmptyStateProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(600).delay(300)}
    >
      <Animated.View
        entering={SlideInUp.duration(800).delay(400)}
      >
        <View style={styles.iconContainer}>
          <ReceiptIcon size={64} color="#d1d5db" />
        </View>
      </Animated.View>
      
      <Animated.Text 
        style={styles.title}
        entering={FadeIn.duration(600).delay(600)}
      >
        {title}
      </Animated.Text>
      
      <Animated.Text 
        style={styles.message}
        entering={FadeIn.duration(600).delay(700)}
      >
        {message}
      </Animated.Text>
      
      {onActionPress && actionLabel && (
        <Animated.View
          entering={FadeIn.duration(600).delay(800)}
        >
          <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#3E7BFA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});