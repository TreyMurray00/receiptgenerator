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
    console.log('[ReceiptDetail] Back button pressed');
    router.back();
  };

  const handleEdit = () => {
    console.log('[ReceiptDetail] Edit button pressed');
    if (!receipt) return;
    router.push(`/receipt/edit/${receipt.id}`);
  };

  const handleDelete = () => {
    console.log('[ReceiptDetail] Delete button pressed');
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
    console.log('[ReceiptDetail] Share/generatePDF button pressed');
    if (!receipt) return;

    try {
      setIsGenerating(true);
      const html = await generateReceiptHTML(receipt);
      
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

  // Custom button component with improved touch handling for Android
  const HeaderButton = ({ onPress, children, color = "#1f2937", disabled = false }: { onPress?: () => void; children: React.ReactNode; color?: string; disabled?: boolean }) => {
    // Wrap the onPress handler to add additional logging and ensure it's called
    const handlePress = () => {
      console.log('[HeaderButton] Button pressed directly');
      if (onPress && !disabled) {
        onPress();
      }
    };

    if (Platform.OS === 'android') {
      return (
        <View style={styles.androidButtonContainer}>
          <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.androidHeaderButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {children}
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity 
          onPress={onPress} 
          style={styles.headerButton}
          disabled={disabled}
          activeOpacity={0.7}
        >
          {children}
        </TouchableOpacity>
      );
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
          headerShown: false,
        }}
      />
      
      {/* Custom header */}
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
            {receipt.title}
          </Text>
        </View>
        
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={generatePDF}
            disabled={isGenerating}
            style={styles.headerIconButton}
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isGenerating ? (
              <FileDown size={22} color="#9ca3af" />
            ) : (
              <Share2 size={22} color="#1f2937" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.headerIconButton}
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit2 size={22} color="#1f2937" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.headerIconButton}
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
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
    width: 160,
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
    marginHorizontal: 4,
    borderRadius: 100,
    backgroundColor: Platform.OS === 'android' ? '#f5f5f7' : 'transparent',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
  },
  // Keep old styles for compatibility
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidButtonContainer: {
    marginHorizontal: 4,
    overflow: 'hidden',
    borderRadius: 24,
  },
  androidHeaderButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
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
