import { StyleSheet, ScrollView, View, Text, Platform } from 'react-native';
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
    console.log('[CreateReceipt] Back/Cancel button pressed');
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
            Create Receipt
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
});