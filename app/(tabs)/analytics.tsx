import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { loadReceipts } from '@/utils/storage';
import { Receipt } from '@/types';
import { ChartBar as BarChart3 } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';

export default function AnalyticsScreen() {
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ month: string; total: number; cash: number; bank: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentMethodSummary, setPaymentMethodSummary] = useState({ cash: 0, bank: 0 });

  const calculateAnalytics = async () => {
    const receipts = await loadReceipts();
    
    // Calculate monthly breakdown
    const breakdown = receipts.reduce((acc: { [key: string]: { total: number; cash: number; bank: number } }, receipt: Receipt) => {
      const date = parseISO(receipt.date);
      const monthKey = format(date, 'yyyy-MM');
      
      const total = receipt.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const tax = total * (receipt.taxRate / 100);
      const finalTotal = total + tax;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, cash: 0, bank: 0 };
      }
      
      acc[monthKey].total += finalTotal;
      if (receipt.paymentMethod === 'cash') {
        acc[monthKey].cash += finalTotal;
      } else {
        acc[monthKey].bank += finalTotal;
      }
      
      return acc;
    }, {});

    const sortedBreakdown = Object.entries(breakdown)
      .map(([month, data]) => ({
        month: format(parseISO(month + '-01'), 'MMMM yyyy'),
        total: data.total,
        cash: data.cash,
        bank: data.bank
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());

    setMonthlyBreakdown(sortedBreakdown);

    // Calculate total revenue and payment method summary
    const totals = receipts.reduce((acc, receipt) => {
      const total = receipt.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const tax = total * (receipt.taxRate / 100);
      const finalTotal = total + tax;

      acc.total += finalTotal;
      if (receipt.paymentMethod === 'cash') {
        acc.cash += finalTotal;
      } else {
        acc.bank += finalTotal;
      }

      return acc;
    }, { total: 0, cash: 0, bank: 0 });

    setTotalRevenue(totals.total);
    setPaymentMethodSummary({ cash: totals.cash, bank: totals.bank });
  };

  useFocusEffect(
    React.useCallback(() => {
      calculateAnalytics();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.overviewCard}>
            <Text style={styles.totalRevenueLabel}>Total Revenue</Text>
            <Text style={styles.totalRevenueValue}>{formatCurrency(totalRevenue, 'USD')}</Text>
            
            <View style={styles.paymentMethodSummary}>
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodLabel}>Cash Payments</Text>
                <Text style={styles.paymentMethodValue}>
                  {formatCurrency(paymentMethodSummary.cash, 'USD')}
                </Text>
                <Text style={styles.paymentMethodPercentage}>
                  {((paymentMethodSummary.cash / totalRevenue) * 100).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodLabel}>Bank Transfers</Text>
                <Text style={styles.paymentMethodValue}>
                  {formatCurrency(paymentMethodSummary.bank, 'USD')}
                </Text>
                <Text style={styles.paymentMethodPercentage}>
                  {((paymentMethodSummary.bank / totalRevenue) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
          {monthlyBreakdown.map((item, index) => (
            <View key={index} style={styles.monthlyCard}>
              <Text style={styles.monthLabel}>{item.month}</Text>
              
              <View style={styles.monthlyDetails}>
                <View style={styles.monthlyTotal}>
                  <Text style={styles.monthlyTotalLabel}>Total</Text>
                  <Text style={styles.monthlyTotalValue}>
                    {formatCurrency(item.total, 'USD')}
                  </Text>
                </View>
                
                <View style={styles.monthlyPayments}>
                  <View style={styles.paymentDetail}>
                    <Text style={styles.paymentDetailLabel}>Cash</Text>
                    <Text style={styles.paymentDetailValue}>
                      {formatCurrency(item.cash, 'USD')}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentDetail}>
                    <Text style={styles.paymentDetailLabel}>Bank</Text>
                    <Text style={styles.paymentDetailValue}>
                      {formatCurrency(item.bank, 'USD')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 12,
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  totalRevenueLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalRevenueValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#3E7BFA',
    marginBottom: 20,
  },
  paymentMethodSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  paymentMethodItem: {
    flex: 1,
  },
  paymentMethodLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  paymentMethodValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 2,
  },
  paymentMethodPercentage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  monthlyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
  },
  monthlyDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  monthlyTotal: {
    marginBottom: 12,
  },
  monthlyTotalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  monthlyTotalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#3E7BFA',
  },
  monthlyPayments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentDetail: {
    flex: 1,
  },
  paymentDetailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  paymentDetailValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1f2937',
  },
});