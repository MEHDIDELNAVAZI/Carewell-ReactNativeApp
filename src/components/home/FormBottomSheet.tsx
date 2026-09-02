import React, { forwardRef, useMemo, useState, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

export interface FormQuestion {
  id: number;
  text: string;
  question_type: 'choice' | 'sentence';
  is_multiple_choice: boolean;
  choices: {
    id: number;
    text: string;
    order: number;
  }[];
}

export interface TodayForm {
  id: number;
  name: string;
  questions: FormQuestion[];
  today_scheduled_day_id: number;
}

interface Props {
  form: TodayForm | null;
  loading?: boolean;
  onSubmit: (payload: any) => void;
}

type AnswerValue = string | number | number[];

const FormBottomSheet = forwardRef<any, Props>(
  ({ form, onSubmit, loading = false }, ref) => {
    const snapPoints = useMemo(() => ['92%'], []);

    const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});

    useEffect(() => {
      setAnswers({});
    }, [form?.id]);

    const updateTextAnswer = (questionId: number, value: string) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value,
      }));
    };

    const updateSingleChoice = (questionId: number, choiceId: number) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: choiceId,
      }));
    };

    const toggleMultiChoice = (questionId: number, choiceId: number) => {
      setAnswers(prev => {
        const current = prev[questionId];
        const currentArr = Array.isArray(current) ? current : [];

        const next = currentArr.includes(choiceId)
          ? currentArr.filter(id => id !== choiceId)
          : [...currentArr, choiceId];

        return {
          ...prev,
          [questionId]: next,
        };
      });
    };

    // NOTE: we no longer early-return null here.
    // The BottomSheet must always stay mounted so the ref is valid
    // from the very first render — otherwise .expand() silently no-ops
    // on the first tap (you have to tap twice).

    const totalQuestions = form?.questions.length ?? 0;

    const answeredQuestions = form
      ? form.questions.filter(q => {
          const answer = answers[q.id];

          if (answer === undefined || answer === null) {
            return false;
          }

          if (typeof answer === 'string') {
            return answer.trim().length > 0;
          }

          if (Array.isArray(answer)) {
            return answer.length > 0;
          }

          return true;
        }).length
      : 0;

    const isValid = totalQuestions > 0 && answeredQuestions === totalQuestions;

    const submit = () => {
      if (!form || !isValid) {
        return;
      }

      const payload = {
        form: form.id,
        scheduled_day: form.today_scheduled_day_id,
        answers: Object.entries(answers).map(([questionId, value]) => {
          if (Array.isArray(value)) {
            return {
              question: Number(questionId),
              selected_choices: value,
            };
          }

          if (typeof value === 'number') {
            return {
              question: Number(questionId),
              selected_choice: value,
            };
          }

          return {
            question: Number(questionId),
            text_answer: value,
          };
        }),
      };

      onSubmit(payload);
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
      >
        {form ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{form.name}</Text>

              <Text style={styles.progress}>
                {answeredQuestions}/{totalQuestions} completed
              </Text>
            </View>

            <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
              {form.questions.map((question, index) => (
                <View key={question.id} style={styles.questionCard}>
                  <Text style={styles.questionNumber}>
                    Question {index + 1}
                    {question.is_multiple_choice &&
                    question.question_type === 'choice'
                      ? ' · Select all that apply'
                      : ''}
                  </Text>

                  <Text style={styles.questionTitle}>{question.text}</Text>

                  {question.question_type === 'sentence' ? (
                    <TextInput
                      multiline
                      textAlignVertical="top"
                      placeholder="Type your answer..."
                      placeholderTextColor="#9CA3AF"
                      value={String(answers[question.id] || '')}
                      onChangeText={text => updateTextAnswer(question.id, text)}
                      style={styles.input}
                    />
                  ) : (
                    <View>
                      {question.choices
                        .sort((a, b) => a.order - b.order)
                        .map(choice => {
                          const current = answers[question.id];

                          const selected = question.is_multiple_choice
                            ? Array.isArray(current) &&
                              current.includes(choice.id)
                            : current === choice.id;

                          return (
                            <TouchableOpacity
                              key={choice.id}
                              activeOpacity={0.8}
                              style={[
                                styles.choice,
                                selected && styles.choiceSelected,
                              ]}
                              onPress={() =>
                                question.is_multiple_choice
                                  ? toggleMultiChoice(question.id, choice.id)
                                  : updateSingleChoice(question.id, choice.id)
                              }
                            >
                              <View
                                style={[
                                  question.is_multiple_choice
                                    ? styles.checkbox
                                    : styles.radio,
                                  selected &&
                                    (question.is_multiple_choice
                                      ? styles.checkboxSelected
                                      : styles.radioSelected),
                                ]}
                              >
                                {selected && question.is_multiple_choice && (
                                  <Text style={styles.checkboxMark}>✓</Text>
                                )}
                                {selected && !question.is_multiple_choice && (
                                  <View style={styles.radioDot} />
                                )}
                              </View>

                              <Text
                                style={[
                                  styles.choiceText,
                                  selected && styles.choiceTextSelected,
                                ]}
                              >
                                {choice.text}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  )}
                </View>
              ))}

              <View style={{ height: 120 }} />
            </BottomSheetScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!isValid || loading}
                onPress={submit}
                style={[
                  styles.submitButton,
                  (!isValid || loading) && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Submitting...' : 'Submit Form'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </BottomSheet>
    );
  },
);

export default FormBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  indicator: {
    backgroundColor: '#D1D5DB',
  },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  progress: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },

  scrollContent: {
    padding: 24,
  },

  questionCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },

  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  questionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 24,
  },

  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111827',
  },

  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },

  choiceSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },

  choiceText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },

  choiceTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },

  checkboxMark: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#2563EB',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },

  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  submitButtonDisabled: {
    opacity: 0.5,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
