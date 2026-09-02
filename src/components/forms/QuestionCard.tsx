import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export type QuestionType = 'sentence' | 'choice';

export interface Choice {
  id: number;
  text: string;
}

export interface QuestionData {
  id: number;
  text: string;
  question_type: QuestionType;
  choices?: Choice[];
}

interface QuestionCardProps {
  question: QuestionData;
  index: number;
  value: any;
  onChange: (value: any) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  value,
  onChange,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>
        {index + 1}. {question.text}
      </Text>

      {question.question_type === 'sentence' ? (
        <TextInput
          style={styles.textInput}
          placeholder="Type your answer here..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          value={value || ''}
          onChangeText={onChange}
        />
      ) : (
        <View style={styles.choicesContainer}>
          {question.choices?.map((choice) => {
            const isSelected = value === choice.id;
            return (
              <TouchableOpacity
                key={choice.id}
                activeOpacity={0.7}
                style={[
                  styles.choiceButton,
                  isSelected && styles.choiceButtonSelected,
                ]}
                onPress={() => onChange(choice.id)}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                  {choice.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 14,
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    color: '#374151',
    backgroundColor: '#F9FAFB',
  },
  choicesContainer: {
    gap: 10,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  choiceButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  choiceText: {
    fontSize: 15,
    color: '#4B5563',
  },
  choiceTextSelected: {
    color: '#2563EB',
    fontWeight: '500',
  },
});