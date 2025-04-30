import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt, Settings } from '@/types';

const RECEIPTS_STORAGE_KEY = '@ReceiptGenerator:receipts';
const SETTINGS_STORAGE_KEY = '@ReceiptGenerator:settings';

// Receipt CRUD operations
export const saveReceipt = async (receipt: Receipt): Promise<void> => {
  try {
    const existingReceipts = await loadReceipts();
    const updatedReceipts = [...existingReceipts, receipt];
    await AsyncStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(updatedReceipts));
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

export const loadReceipts = async (): Promise<Receipt[]> => {
  try {
    const receiptsJson = await AsyncStorage.getItem(RECEIPTS_STORAGE_KEY);
    return receiptsJson ? JSON.parse(receiptsJson) : [];
  } catch (error) {
    console.error('Error loading receipts:', error);
    return [];
  }
};

export const getReceipt = async (id: string): Promise<Receipt | null> => {
  try {
    const receipts = await loadReceipts();
    return receipts.find(receipt => receipt.id === id) || null;
  } catch (error) {
    console.error('Error getting receipt:', error);
    return null;
  }
};

export const updateReceipt = async (updatedReceipt: Receipt): Promise<void> => {
  try {
    const receipts = await loadReceipts();
    const updatedReceipts = receipts.map(receipt => 
      receipt.id === updatedReceipt.id ? updatedReceipt : receipt
    );
    await AsyncStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(updatedReceipts));
  } catch (error) {
    console.error('Error updating receipt:', error);
    throw error;
  }
};

export const deleteReceipt = async (id: string): Promise<void> => {
  try {
    const receipts = await loadReceipts();
    const filteredReceipts = receipts.filter(receipt => receipt.id !== id);
    await AsyncStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(filteredReceipts));
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
};

export const clearAllReceipts = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RECEIPTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing receipts:', error);
    throw error;
  }
};

// Settings operations
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<Settings | null> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};