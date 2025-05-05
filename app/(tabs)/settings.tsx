import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert, useColorScheme, TextInput, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, Trash2, CreditCard as Edit2, FileSpreadsheet, ChartBar as BarChart3 } from 'lucide-react-native';
import { loadSettings, saveSettings, clearAllReceipts, loadReceipts } from '@/utils/storage';
import { Settings, Receipt } from '@/types';
import { useRouter } from 'expo-router';
import SignatureModal from '@/components/SignatureModal';
import * as XLSX from 'xlsx/xlsx.mjs';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export default function SettingsScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    showLogo: true,
    darkMode: systemColorScheme === 'dark',
    signature: '',
  });
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const loadedSettings = await loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
      await calculateMonthlyBreakdown();
    };

    fetchSettings();
  }, []);

  const calculateMonthlyBreakdown = async () => {
    const receipts = await loadReceipts();
    const breakdown = receipts.reduce((acc: { [key: string]: number }, receipt: Receipt) => {
      const date = parseISO(receipt.date);
      const monthKey = format(date, 'yyyy-MM');
      
      const total = receipt.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
      
      const tax = total * (receipt.taxRate / 100);
      const finalTotal = total + tax;
      
      acc[monthKey] = (acc[monthKey] || 0) + finalTotal;
      return acc;
    }, {});

    const sortedBreakdown = Object.entries(breakdown)
      .map(([month, total]) => ({
        month: format(parseISO(month + '-01'), 'MMMM yyyy'),
        total
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());

    setMonthlyBreakdown(sortedBreakdown);
  };

  const handleInputChange = async (key: keyof Settings, value: string | number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const exportToExcel = async () => {
    try {
      const receipts = await loadReceipts();
      const workbook = XLSX.utils.book_new();

      // Main Receipts Sheet
      const receiptData = receipts.map(receipt => {
        const subtotal = receipt.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * (receipt.taxRate / 100);
        const total = subtotal + tax;

        return {
          'Receipt ID': receipt.id,
          'Date': format(new Date(receipt.date), 'yyyy-MM-dd'),
          'Created At': format(new Date(receipt.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          'Title': receipt.title,
          'Customer Name': receipt.customerName || '',
          'Customer Email': receipt.customerEmail || '',
          'Payment Method': receipt.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer',
          'Bank Name': receipt.bankName || '',
          'Reference Number': receipt.referenceNumber || '',
          'Currency': receipt.currency,
          'Subtotal': subtotal,
          'Tax Rate (%)': receipt.taxRate,
          'Tax Amount': tax,
          'Total Amount': total,
          'Notes': receipt.notes || '',
        };
      });
      
      const receiptWS = XLSX.utils.json_to_sheet(receiptData);
      XLSX.utils.book_append_sheet(workbook, receiptWS, 'Receipts');

      // Detailed Items Sheet
      const itemData: any[] = [];
      receipts.forEach(receipt => {
        receipt.items.forEach(item => {
          itemData.push({
            'Receipt ID': receipt.id,
            'Receipt Date': format(new Date(receipt.date), 'yyyy-MM-dd'),
            'Receipt Title': receipt.title,
            'Customer Name': receipt.customerName || '',
            'Item Description': item.description,
            'Quantity': item.quantity,
            'Unit Price': item.price,
            'Total': item.quantity * item.price,
            'Currency': receipt.currency,
          });
        });
      });
      
      const itemsWS = XLSX.utils.json_to_sheet(itemData);
      XLSX.utils.book_append_sheet(workbook, itemsWS, 'Items');

      // Monthly Summary Sheet
      const monthlyData = monthlyBreakdown.map(item => ({
        'Month': item.month,
        'Total Revenue': item.total,
      }));
      
      const monthlyWS = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(workbook, monthlyWS, 'Monthly Summary');

      // Payment Methods Summary Sheet
      const paymentMethodSummary = receipts.reduce((acc: { [key: string]: number }, receipt) => {
        const total = receipt.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * (1 + receipt.taxRate / 100);
        const method = receipt.paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer';
        acc[method] = (acc[method] || 0) + total;
        return acc;
      }, {});

      const paymentMethodData = Object.entries(paymentMethodSummary).map(([method, total]) => ({
        'Payment Method': method,
        'Total Amount': total,
      }));

      const paymentMethodWS = XLSX.utils.json_to_sheet(paymentMethodData);
      XLSX.utils.book_append_sheet(workbook, paymentMethodWS, 'Payment Methods');

      // Handle platform-specific file saving and sharing
      if (Platform.OS === 'web') {
        // For web, use the XLSX built-in writeFile method to directly download the file
        const fileName = `receipts_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } else {
        // For native platforms (iOS, Android), use FileSystem and Sharing
        const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
        const fileName = `receipts_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(filePath, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Receipts',
          UTI: 'com.microsoft.excel.xlsx',
        });
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Error', 'Failed to export receipts. Please try again.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Receipts',
      'Are you sure you want to delete all receipts? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllReceipts();
              Alert.alert('Success', 'All receipts have been deleted.');
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete receipts. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={settings.businessName}
              onChangeText={(value) => handleInputChange('businessName', value)}
              placeholder="Enter business name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={styles.input}
              value={settings.businessEmail}
              onChangeText={(value) => handleInputChange('businessEmail', value)}
              placeholder="Enter business email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Phone</Text>
            <TextInput
              style={styles.input}
              value={settings.businessPhone}
              onChangeText={(value) => handleInputChange('businessPhone', value)}
              placeholder="Enter business phone"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.businessAddress}
              onChangeText={(value) => handleInputChange('businessAddress', value)}
              placeholder="Enter business address"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Signature</Text>
            <TouchableOpacity 
              style={styles.signatureButton}
              onPress={() => setIsSignatureModalVisible(true)}
            >
              {settings.signature ? (
                <Image 
                  source={{ uri: settings.signature }} 
                  style={styles.signaturePreview}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.signaturePlaceholder}>
                  <Edit2 size={24} color="#6b7280" />
                  <Text style={styles.signaturePlaceholderText}>Add Signature</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>



        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Show Logo</Text>
              <Text style={styles.settingDescription}>Display your business logo on receipts</Text>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#a7c5ff' }}
              thumbColor={settings.showLogo ? '#3E7BFA' : '#f4f3f4'}
              onValueChange={(value) => handleInputChange('showLogo', value)}
              value={settings.showLogo}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#a7c5ff' }}
              thumbColor={settings.darkMode ? '#3E7BFA' : '#f4f3f4'}
              onValueChange={(value) => handleInputChange('darkMode', value)}
              value={settings.darkMode}
            />
          </View>
        </View> */}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={exportToExcel}>
            <FileSpreadsheet size={20} color="#3E7BFA" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Export to Excel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
            <Trash2 size={20} color="#ef4444" style={styles.dangerIcon} />
            <Text style={styles.dangerButtonText}>Clear All Receipts</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Info size={16} color="#6b7280" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Receipt Generator v1.0.0
          </Text>
        </View>
      </ScrollView>

      <SignatureModal
        isVisible={isSignatureModalVisible}
        onClose={() => setIsSignatureModalVisible(false)}
        onSave={(signature) => handleInputChange('signature', signature)}
        initialValue={settings.signature}
      />
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  signatureButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  signaturePreview: {
    width: '100%',
    height: 100,
    backgroundColor: '#ffffff',
  },
  signaturePlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePlaceholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3E7BFA',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dangerIcon: {
    marginRight: 8,
  },
  dangerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ef4444',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  monthLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
  },
  monthAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#3E7BFA',
  },
});