import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react-native';

interface DatePickerComponentProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePickerComponent({ date, onDateChange }: DatePickerComponentProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedDate = format(date, 'MMM dd, yyyy');

  // On web, we use a native date input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Calendar size={20} color="#6b7280" />
        </TouchableOpacity>
        {showDatePicker && (
          <input
            type="date"
            value={format(date, 'yyyy-MM-dd')}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onDateChange(newDate);
              }
              setShowDatePicker(false);
            }}
            style={{
              position: 'absolute',
              opacity: 0,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </View>
    );
  }

  // On mobile, we show a date-formatted text with a calendar icon
  // In a real app, you'd open a DatePickerIOS/DatePickerAndroid here
  return (
    <TouchableOpacity
      style={styles.inputContainer}
      onPress={() => {
        // In a real app, would open the native date picker here
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate);
      }}
    >
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Calendar size={20} color="#6b7280" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1f2937',
  },
}); 