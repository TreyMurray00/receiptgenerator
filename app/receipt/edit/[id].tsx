import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
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
          headerShown: true,
          headerTitle: 'Edit Receipt',
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <ArrowLeft size={24} color="#1f2937" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          ),
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      />
      
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
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
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