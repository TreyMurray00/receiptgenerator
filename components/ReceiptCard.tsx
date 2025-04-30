import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Receipt } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
  index?: number;
}

export default function ReceiptCard({ receipt, onPress, index = 0 }: ReceiptCardProps) {
  const calculateTotal = () => {
    const subtotal = receipt.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * (receipt.taxRate / 100);
    return subtotal + tax;
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 100)}
    >
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{receipt.title}</Text>
          <Text style={styles.date}>{format(new Date(receipt.date), 'MMM dd, yyyy')}</Text>
        </View>
        
        {receipt.customerName ? (
          <Text style={styles.customer} numberOfLines={1}>
            {receipt.customerName}
          </Text>
        ) : null}
        
        <View style={styles.items}>
          <Text style={styles.itemCount}>
            {receipt.items.length} {receipt.items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.total}>
            {formatCurrency(calculateTotal(), receipt.currency)}
          </Text>
          <ChevronRight size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    flex: 1,
  },
  date: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
  },
  customer: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 12,
  },
  items: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginBottom: 12,
  },
  itemCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  total: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#3E7BFA',
  },
});