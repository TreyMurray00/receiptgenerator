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
import { isWithinInterval, parseISO, startOfDay, endOfDay, format } from 'date-fns';
import DateRangePicker from '@/components/DateRangePicker';

export default function ReceiptsScreen() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const searchAnimation = new Animated.Value(0);

  // Load receipts when the screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchReceipts = async () => {
        const loadedReceipts = await loadReceipts();
        if (isActive) {
          setReceipts(loadedReceipts);
          filterReceipts(loadedReceipts, searchQuery, startDate, endDate);
        }
      };

      fetchReceipts();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const filterReceipts = (receipts: Receipt[], query: string, start: Date | null, end: Date | null) => {
    let filtered = [...receipts];

    // Apply search filter
    if (query.trim() !== '') {
      filtered = filtered.filter(receipt => 
        receipt.title.toLowerCase().includes(query.toLowerCase()) ||
        receipt.customerName?.toLowerCase().includes(query.toLowerCase()) ||
        receipt.items.some(item => item.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply date filter
    if (start && end) {
      const startOfRange = startOfDay(start);
      const endOfRange = endOfDay(end);

      filtered = filtered.filter(receipt => {
        const receiptDate = parseISO(receipt.date);
        return isWithinInterval(receiptDate, { start: startOfRange, end: endOfRange });
      });
    }

    setFilteredReceipts(filtered);
  };

  useEffect(() => {
    filterReceipts(receipts, searchQuery, startDate, endDate);
  }, [searchQuery, startDate, endDate, receipts]);

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

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const searchWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '85%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
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

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClear={clearDateFilter}
      />

      {receipts.length === 0 ? (
        <EmptyState 
          title="No receipts yet" 
          message="Tap the + button to create your first receipt"
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
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                {startDate && endDate
                  ? `No receipts found between ${format(startDate, 'MMM dd, yyyy')} and ${format(endDate, 'MMM dd, yyyy')}`
                  : searchQuery.length > 0
                  ? `No receipts found matching "${searchQuery}"`
                  : 'No receipts found'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerContent: {
    flex: 6,
    flexDirection: 'column',
    justifyContent: 'center',
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