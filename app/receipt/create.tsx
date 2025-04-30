import { StyleSheet, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';
import ReceiptForm from '@/components/ReceiptForm';
import { Receipt } from '@/types';
import { saveReceipt } from '@/utils/storage';

export default function CreateReceiptScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleCreateReceipt = async (data: Omit<Receipt, 'id' | 'createdAt'>) => {
    const newReceipt: Receipt = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    await saveReceipt(newReceipt);
    router.replace(`/receipt/${newReceipt.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Create Receipt',
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
});