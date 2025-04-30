import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { Receipt } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface ReceiptDetailViewProps {
  receipt: Receipt;
}

export default function ReceiptDetailView({ receipt }: ReceiptDetailViewProps) {
  const calculateSubtotal = () => {
    return receipt.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (receipt.taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  return (
    <View style={styles.container}>
      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>{receipt.title}</Text>
          <Text style={styles.receiptDate}>
            {format(new Date(receipt.date), 'MMMM dd, yyyy')}
          </Text>
        </View>
        
        {(receipt.customerName || receipt.customerEmail) && (
          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>Customer</Text>
            {receipt.customerName && (
              <Text style={styles.customerName}>{receipt.customerName}</Text>
            )}
            {receipt.customerEmail && (
              <Text style={styles.customerEmail}>{receipt.customerEmail}</Text>
            )}
          </View>
        )}
        
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items</Text>
          
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemHeaderText, styles.itemDescriptionHeader]}>Description</Text>
            <Text style={[styles.itemHeaderText, styles.itemQuantityHeader]}>Qty</Text>
            <Text style={[styles.itemHeaderText, styles.itemPriceHeader]}>Price</Text>
            <Text style={[styles.itemHeaderText, styles.itemTotalHeader]}>Total</Text>
          </View>
          
          {receipt.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemText, styles.itemDescription]}>{item.description}</Text>
              <Text style={[styles.itemText, styles.itemQuantity]}>{item.quantity}</Text>
              <Text style={[styles.itemText, styles.itemPrice]}>
                {formatCurrency(item.price, receipt.currency)}
              </Text>
              <Text style={[styles.itemText, styles.itemTotal]}>
                {formatCurrency(item.quantity * item.price, receipt.currency)}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculateSubtotal(), receipt.currency)}
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({receipt.taxRate}%)</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculateTax(), receipt.currency)}
            </Text>
          </View>
          
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(calculateTotal(), receipt.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentLabel}>Method:</Text>
            <Text style={styles.paymentValue}>
              {receipt.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}
            </Text>
          </View>
          
          {receipt.paymentMethod === 'bank' && (
            <>
              {receipt.bankName && (
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentLabel}>Bank:</Text>
                  <Text style={styles.paymentValue}>{receipt.bankName}</Text>
                </View>
              )}
              {receipt.referenceNumber && (
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentLabel}>Reference:</Text>
                  <Text style={styles.paymentValue}>{receipt.referenceNumber}</Text>
                </View>
              )}
            </>
          )}
        </View>
        
        {receipt.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.createdAt}>
            Created: {format(new Date(receipt.createdAt), 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  receiptTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  receiptDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  customerSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 8,
  },
  customerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
  },
  customerEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
    marginTop: 4,
  },
  itemsSection: {
    marginBottom: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
    marginBottom: 8,
  },
  itemHeaderText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#4b5563',
  },
  itemDescriptionHeader: {
    flex: 3,
  },
  itemQuantityHeader: {
    flex: 1,
    textAlign: 'center',
  },
  itemPriceHeader: {
    flex: 2,
    textAlign: 'right',
  },
  itemTotalHeader: {
    flex: 2,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
  },
  itemDescription: {
    flex: 3,
  },
  itemQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 2,
    textAlign: 'right',
  },
  itemTotal: {
    flex: 2,
    textAlign: 'right',
    fontFamily: 'Inter-Medium',
  },
  totalsSection: {
    marginBottom: 24,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4b5563',
  },
  totalValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  grandTotalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1f2937',
  },
  grandTotalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#3E7BFA',
  },
  paymentSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  paymentDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  paymentLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4b5563',
    width: 100,
  },
  paymentValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  createdAt: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9ca3af',
  },
});