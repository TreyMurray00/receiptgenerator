import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import ReceiptForm from '@/components/ReceiptForm';
import { getReceipt, updateReceipt } from '@/utils/storage';
import { Receipt } from '@/types';

export default function EditReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!id) return;
      
      const foundReceipt = await getReceipt(id);
      setReceipt(foundReceipt);
      setIsLoading(false);
    };

    fetchReceipt();
  }, [id]);

  const handleGoBack = () => {
    console.log('[EditReceipt] Back/Cancel button pressed');
    router.back();
  };

  const handleUpdateReceipt = async (data: Omit<Receipt, 'id' | 'createdAt'>) => {
    if (!receipt) return;

    const updatedReceipt: Receipt = {
      ...receipt,
      ...data,
    };

    await updateReceipt(updatedReceipt);
    router.replace(`/receipt/${receipt.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading receipt...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Receipt not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.headerIconButton}
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Edit Receipt
          </Text>
        </View>
        
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.headerIconButton}
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ReceiptForm 
          onSubmit={handleUpdateReceipt}
          initialData={{
            title: receipt.title,
            date: receipt.date,
            customerName: receipt.customerName || '',
            customerEmail: receipt.customerEmail || '',
            items: receipt.items,
            taxRate: receipt.taxRate,
            currency: receipt.currency,
            notes: receipt.notes || '',
          }}
          submitLabel="Update Receipt"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeftContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRightContainer: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: Platform.OS === 'android' ? '#f5f5f7' : 'transparent',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9fb',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9fb',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3E7BFA',
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
  },
});