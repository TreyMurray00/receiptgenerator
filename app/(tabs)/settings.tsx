import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert, useColorScheme, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, Trash2, CreditCard as Edit2 } from 'lucide-react-native';
import { loadSettings, saveSettings, clearAllReceipts } from '@/utils/storage';
import { Settings } from '@/types';
import { useRouter } from 'expo-router';
import SignatureModal from '@/components/SignatureModal';

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

  useEffect(() => {
    const fetchSettings = async () => {
      const loadedSettings = await loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = async (key: keyof Settings, value: string | number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
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

        <View style={styles.section}>
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
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
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
});