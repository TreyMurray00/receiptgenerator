import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Pressable} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, CreditCard as Edit2, Trash2, FileDown } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import { getReceipt, deleteReceipt } from '@/utils/storage';
import { generateReceiptHTML } from '@/utils/generateReceiptHTML';
import { Receipt } from '@/types';
import ReceiptDetailView from '@/components/ReceiptDetailView';

export default function ReceiptDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleEdit = () => {
    if (!receipt) return;
    router.push(`/receipt/edit/${receipt.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!receipt) return;
            await deleteReceipt(receipt.id);
            router.replace('/(tabs)');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const generatePDF = async () => {
    if (!receipt) return;

    try {
      setIsGenerating(true);
      const html =  await generateReceiptHTML(receipt);
      
      if (Platform.OS === 'web') {
        // For web, open in a new tab
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      }

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Get the filename from the receipt
      const fileName = `receipt-${receipt.id.slice(0, 8)}.pdf`;
      
      // Move the file to a shareable location
      const shareableUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.moveAsync({
        from: uri,
        to: shareableUri,
      });

      // Share the PDF
      await Sharing.shareAsync(shareableUri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share Receipt',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Failed to generate PDF. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
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
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>{receipt.title}</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <ArrowLeft size={24} color="#1f2937" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={generatePDF} 
                style={styles.headerButton}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <FileDown size={22} color="#9ca3af" />
                ) : (
                  <Share2 size={22} color="#1f2937" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Edit2 size={22} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Trash2 size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ReceiptDetailView receipt={receipt} />
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
    marginHorizontal: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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