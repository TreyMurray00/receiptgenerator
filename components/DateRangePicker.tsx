import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { format } from 'date-fns';
import { Calendar, Check } from 'lucide-react-native';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onClear: () => void;
}

// Define web-specific input type
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'input': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    }
  }
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangePickerProps) {
  const [startDateText, setStartDateText] = useState(startDate ? format(startDate, 'yyyy-MM-dd') : '');
  const [endDateText, setEndDateText] = useState(endDate ? format(endDate, 'yyyy-MM-dd') : '');
  
  // Update text fields when props change externally
  useEffect(() => {
    setStartDateText(startDate ? format(startDate, 'yyyy-MM-dd') : '');
  }, [startDate]);
  
  useEffect(() => {
    setEndDateText(endDate ? format(endDate, 'yyyy-MM-dd') : '');
  }, [endDate]);

  const parseDate = (dateStr: string): Date | null => {
    // Parse YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return null;
    }
    
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Check for valid date components
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    // Create date at noon to avoid timezone issues
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    // Verify the date is valid
    if (isNaN(date.getTime()) || date.getDate() !== day) {
      return null;
    }
    
    return date;
  };

  const applyDates = () => {
    // Try to parse and apply the start date
    if (startDateText) {
      const parsedStartDate = parseDate(startDateText);
      if (parsedStartDate) {
        onStartDateChange(parsedStartDate);
      }
    }
    
    // Try to parse and apply the end date
    if (endDateText) {
      const parsedEndDate = parseDate(endDateText);
      if (parsedEndDate) {
        onEndDateChange(parsedEndDate);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateInputs}>
        <View style={styles.dateInput}>
          <Text style={styles.label}>From</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={startDateText}
              onChange={(e) => setStartDateText(e.target.value)}
              style={webStyles.dateInput}
            />
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={startDateText}
                onChangeText={setStartDateText}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
              <Calendar size={20} color="#6b7280" />
            </View>
          )}
        </View>

        <View style={styles.dateInput}>
          <Text style={styles.label}>To</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={endDateText}
              onChange={(e) => setEndDateText(e.target.value)}
              style={webStyles.dateInput}
            />
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={endDateText}
                onChangeText={setEndDateText}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
              <Calendar size={20} color="#6b7280" />
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        {(startDateText || endDateText) && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setStartDateText('');
              setEndDateText('');
              onClear();
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.applyButton} 
          onPress={applyDates}
        >
          <Check size={18} color="#ffffff" style={styles.actionIcon} />
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Separate web styles using proper CSS properties
const webStyles = {
  dateInput: {
    width: '100%',
    height: 40,
    padding: '8px 12px',
    fontSize: '16px',
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
  } as React.CSSProperties
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  dateInputs: {
    flexDirection: 'row',
    // Use marginRight instead of gap for better compatibility
    marginHorizontal: -6, // Negative margin to compensate for paddingHorizontal in dateInput
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 6, // Use padding instead of gap
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
    height: '100%',
    paddingRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  clearButton: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ef4444',
  },
  applyButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E7BFA',
    borderRadius: 6,
    flex: 1,
  },
  applyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 4,
  },
  actionIcon: {
    marginRight: 4,
  }
});