import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Animated } from 'react-native';
import { Search as SearchIcon, X, CirclePlus as PlusCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReceiptCard from '@/components/ReceiptCard';
import { loadReceipts } from '@/utils/storage';
import { Receipt } from '@/types';
import EmptyState from '@/components/EmptyState';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ReceiptsScreen() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchAnimation = new Animated.Value(0);

  // Load receipts when the screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchReceipts = async () => {
        const loadedReceipts = await loadReceipts();
        if (isActive) {
          setReceipts(loadedReceipts);
          setFilteredReceipts(loadedReceipts);
        }
      };

      fetchReceipts();

      return () => {
        // cleanup: prevent setState on unfocused/unmounted screen
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReceipts(receipts);
    } else {
      const filtered = receipts.filter(receipt => 
        receipt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.items.some(item => item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredReceipts(filtered);
    }
  }, [searchQuery, receipts]);

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    setIsSearchVisible(!isSearchVisible);

    Animated.timing(searchAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    if (toValue === 0) {
      setSearchQuery('');
    }
  };

  const handleCreateReceipt = () => {
    router.push('/receipt/create');
  };

  const handleReceiptPress = (id: string) => {
    router.push(`/receipt/${id}`);
  };

  const searchWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '85%'],
  });

  const headerOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {/* flex column for header */}
        <View style={styles.headerContent}>
          {/* <Animated.View style={[styles.titleContainer, { opacity: headerOpacity }]}>
            <Text style={styles.title}>Receipts</Text>
          </Animated.View> */}
          
          <View style={styles.headerButtons}>
            <Animated.View style={[styles.searchInputContainer, { width: searchWidth }]}>
              {isSearchVisible && (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search receipts..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={isSearchVisible}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            </Animated.View>

            <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
              {isSearchVisible ? (
                <X size={22} color="#4B5563" />
              ) : (
                <SearchIcon size={22} color="#4B5563" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleCreateReceipt} style={styles.iconButton}>
              <PlusCircle size={22} color="#3E7BFA" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {receipts.length === 0 ? (
        <EmptyState 
          title="No receipts yet" 
          message="Tap the + button to create your first receipt"
          onActionPress={handleCreateReceipt}
          actionLabel="Create Receipt"
        />
      ) : (
        <FlatList
          data={filteredReceipts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReceiptCard receipt={item} onPress={() => handleReceiptPress(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No receipts found matching "{searchQuery}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 6,                         // fill available space in the row
    flexDirection: 'column',        // stack title above buttons :contentReference[oaicite:1]{index=1}
    justifyContent: 'center',       // vertically center within header height
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  titleContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexGrow: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  searchInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});