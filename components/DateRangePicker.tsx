import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import DatePickerComponent from './DatePickerComponent';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onClear: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangePickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dateInputs}>
        <View style={styles.dateInput}>
          <Text style={styles.label}>From</Text>
          <DatePickerComponent
            date={startDate || new Date()}
            onDateChange={onStartDateChange}
          />
        </View>

        <View style={styles.dateInput}>
          <Text style={styles.label}>To</Text>
          <DatePickerComponent
            date={endDate || new Date()}
            onDateChange={onEndDateChange}
          />
        </View>
      </View>

      {(startDate || endDate) && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>Clear Dates</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  clearButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ef4444',
  },
});