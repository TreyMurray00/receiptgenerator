import { useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';
import ReceiptForm from '@/components/ReceiptForm';
import { Receipt, ReceiptItem } from '@/types';
import { saveReceipt } from '@/utils/storage';

export default function CreateScreen() {
  const router = useRouter();

  const handleCreateReceipt = async (data: Omit<Receipt, 'id' | 'createdAt'>) => {
    const newReceipt: Receipt = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    await saveReceipt(newReceipt);
    router.push(`/receipt/${newReceipt.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ReceiptForm 
          onSubmit={handleCreateReceipt}
          initialData={{
            title: '',
            date: new Date().toISOString(),
            customerName: '',
            customerEmail: '',
            items: [
              {
                id: uuidv4(),
                description: '',
                quantity: 1,
                price: 0,
              }
            ],
            taxRate: 0,
            currency: 'USD',
            notes: '',
            paymentMethod: 'cash',
            referenceNumber: '',
            bankName: '',
          }}
          submitLabel="Create Receipt"
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
  scrollView: {
    flex: 1,
  },
});