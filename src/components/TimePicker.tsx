import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView} from 'react-native';

interface TimePickerProps {
  label: string;
  value: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const HOURS = Array.from({length: 24}, (_, i) => i);

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'Select time',
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (time: string | null) => {
    if (!time) {
      return placeholder;
    }
    const [hours] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:00 ${period}`;
  };

  const handleSelect = (hour: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    onSelect(timeString);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowPicker(true)}>
        <Text style={[styles.selectorText, !value && styles.placeholder]}>
          {formatTime(value)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView}>
              {HOURS.map(hour => {
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHours = hour % 12 || 12;
                const timeString = `${hour.toString().padStart(2, '0')}:00`;
                const isSelected = value === timeString;

                return (
                  <TouchableOpacity
                    key={hour}
                    style={[styles.timeItem, isSelected && styles.timeItemSelected]}
                    onPress={() => handleSelect(hour)}>
                    <Text
                      style={[
                        styles.timeItemText,
                        isSelected && styles.timeItemTextSelected,
                      ]}>
                      {displayHours}:00 {period}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  timeItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeItemSelected: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderBottomColor: '#BFDBFE',
  },
  timeItemText: {
    fontSize: 16,
    color: '#111827',
  },
  timeItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
