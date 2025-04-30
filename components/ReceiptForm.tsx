import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Receipt, ReceiptItem } from '@/types';
import { X, Plus, CreditCard, Banknote as Banknotes } from 'lucide-react-native';
import DatePickerComponent from '@/components/DatePickerComponent';
import { formatCurrency } from '@/utils/formatters';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface ReceiptFormProps {
  initialData: Omit<Receipt, 'id' | 'createdAt'>;
  onSubmit: (data: Omit<Receipt, 'id' | 'createdAt'>) => void;
  submitLabel: string;
}

export default function ReceiptForm({ initialData, onSubmit, submitLabel }: ReceiptFormProps) {
  const [formData, setFormData] = useState<Omit<Receipt, 'id' | 'createdAt'>>({
    ...initialData,
    paymentMethod: initialData.paymentMethod || 'cash',
    referenceNumber: initialData.referenceNumber || '',
    bankName: initialData.bankName || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      date: date.toISOString(),
    }));
  };

  const handleItemChange = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: uuidv4(),
      description: '',
      quantity: 1,
      price: 0,
    };
    
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length <= 1) {
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (formData.taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Receipt title is required';
    }
    
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`items[${index}].description`] = 'Description is required';
      }
      if (item.quantity <= 0) {
        newErrors[`items[${index}].quantity`] = 'Quantity must be positive';
      }
      if (item.price < 0) {
        newErrors[`items[${index}].price`] = 'Price cannot be negative';
      }
    });

    if (formData.paymentMethod === 'bank') {
      if (!formData.bankName?.trim()) {
        newErrors.bankName = 'Bank name is required for bank transfers';
      }
      if (!formData.referenceNumber?.trim()) {
        newErrors.referenceNumber = 'Reference number is required for bank transfers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receipt Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="e.g., Coffee Shop Receipt"
            placeholderTextColor="#9ca3af"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <DatePickerComponent
            date={new Date(formData.date)}
            onDateChange={handleDateChange}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            <TouchableOpacity
              style={[
                styles.paymentMethodOption,
                formData.paymentMethod === 'cash' && styles.paymentMethodSelected,
              ]}
              onPress={() => handleInputChange('paymentMethod', 'cash')}
            >
              <Banknotes
                size={24}
                color={formData.paymentMethod === 'cash' ? '#ffffff' : '#4b5563'}
                style={styles.paymentMethodIcon}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  formData.paymentMethod === 'cash' && styles.paymentMethodTextSelected,
                ]}
              >
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodOption,
                formData.paymentMethod === 'bank' && styles.paymentMethodSelected,
              ]}
              onPress={() => handleInputChange('paymentMethod', 'bank')}
            >
              <CreditCard
                size={24}
                color={formData.paymentMethod === 'bank' ? '#ffffff' : '#4b5563'}
                style={styles.paymentMethodIcon}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  formData.paymentMethod === 'bank' && styles.paymentMethodTextSelected,
                ]}
              >
                Bank Transfer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {formData.paymentMethod === 'bank' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={[styles.input, errors.bankName && styles.inputError]}
                value={formData.bankName}
                onChangeText={(value) => handleInputChange('bankName', value)}
                placeholder="Enter bank name"
                placeholderTextColor="#9ca3af"
              />
              {errors.bankName && (
                <Text style={styles.errorText}>{errors.bankName}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Reference Number</Text>
              <TextInput
                style={[styles.input, errors.referenceNumber && styles.inputError]}
                value={formData.referenceNumber}
                onChangeText={(value) => handleInputChange('referenceNumber', value)}
                placeholder="Enter bank transfer reference number"
                placeholderTextColor="#9ca3af"
              />
              {errors.referenceNumber && (
                <Text style={styles.errorText}>{errors.referenceNumber}</Text>
              )}
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            style={styles.input}
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
            placeholder="e.g., John Doe"
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Customer Email</Text>
          <TextInput
            style={styles.input}
            value={formData.customerEmail}
            onChangeText={(value) => handleInputChange('customerEmail', value)}
            placeholder="e.g., john@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        
        {formData.items.map((item, index) => (
          <Animated.View 
            key={item.id} 
            style={styles.itemContainer}
            entering={FadeInDown.duration(300).delay(index * 50)}
            exiting={FadeOutUp.duration(300)}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Item {index + 1}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                <X size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, errors[`items[${index}].description`] && styles.inputError]}
                value={item.description}
                onChangeText={(value) => handleItemChange(item.id, 'description', value)}
                placeholder="e.g., Coffee"
                placeholderTextColor="#9ca3af"
              />
              {errors[`items[${index}].description`] && (
                <Text style={styles.errorText}>{errors[`items[${index}].description`]}</Text>
              )}
            </View>
            
            <View style={styles.itemRow}>
              <View style={[styles.formGroup, styles.quantityInput]}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.numberInput,
                    errors[`items[${index}].quantity`] && styles.inputError
                  ]}
                  value={String(item.quantity)}
                  onChangeText={(value) => {
                    const numValue = value === '' ? 0 : parseFloat(value);
                    handleItemChange(item.id, 'quantity', isNaN(numValue) ? 0 : numValue);
                  }}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                />
                {errors[`items[${index}].quantity`] && (
                  <Text style={styles.errorText}>{errors[`items[${index}].quantity`]}</Text>
                )}
              </View>
              
              <View style={[styles.formGroup, styles.priceInput]}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.numberInput,
                    errors[`items[${index}].price`] && styles.inputError
                  ]}
                  value={String(item.price)}
                  onChangeText={(value) => {
                    const numValue = value === '' ? 0 : parseFloat(value);
                    handleItemChange(item.id, 'price', isNaN(numValue) ? 0 : numValue);
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                />
                {errors[`items[${index}].price`] && (
                  <Text style={styles.errorText}>{errors[`items[${index}].price`]}</Text>
                )}
              </View>
              
              <View style={styles.subtotalContainer}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.subtotalValue}>
                  {formatCurrency(item.quantity * item.price, formData.currency)}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
        
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Plus size={20} color="#3E7BFA" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tax Rate (%)</Text>
          <TextInput
            style={[styles.input, styles.numberInput]}
            value={String(formData.taxRate)}
            onChangeText={(value) => {
              const numValue = value === '' ? 0 : parseFloat(value);
              handleInputChange('taxRate', isNaN(numValue) ? 0 : numValue);
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencySelector}>
            {['USD', 'EUR', 'GBP', 'JPY', 'CAD'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyOption,
                  formData.currency === currency && styles.currencyOptionSelected,
                ]}
                onPress={() => handleInputChange('currency', currency)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    formData.currency === currency && styles.currencyTextSelected,
                  ]}
                >
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Additional notes or payment information..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={Platform.OS === 'ios' ? undefined : 4}
            textAlignVertical="top"
          />
        </View>
      </View>
      
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(calculateSubtotal(), formData.currency)}
          </Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({formData.taxRate}%)</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(calculateTax(), formData.currency)}
          </Text>
        </View>
        
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(calculateTotal(), formData.currency)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  numberInput: {
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  paymentMethodSelected: {
    backgroundColor: '#3E7BFA',
    borderColor: '#3E7BFA',
  },
  paymentMethodIcon: {
    marginRight: 8,
  },
  paymentMethodText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4b5563',
  },
  paymentMethodTextSelected: {
    color: '#ffffff',
  },
  itemContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#4b5563',
  },
  removeButton: {
    padding: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quantityInput: {
    flex: 1,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    marginRight: 8,
  },
  subtotalContainer: {
    flex: 1,
  },
  subtotalValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'right',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3E7BFA',
    marginLeft: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  currencyOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  currencyOptionSelected: {
    backgroundColor: '#3E7BFA',
    borderColor: '#3E7BFA',
  },
  currencyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4b5563',
  },
  currencyTextSelected: {
    color: '#ffffff',
  },
  totalsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  totalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4b5563',
  },
  totalValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1f2937',
  },
  grandTotalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
  },
  grandTotalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1f2937',
  },
  grandTotalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#3E7BFA',
  },
  submitButton: {
    backgroundColor: '#3E7BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
});