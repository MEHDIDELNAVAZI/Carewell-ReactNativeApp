import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaViewBase,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { QuestionCard, QuestionData } from '../components/forms/QuestionCard';

interface FormScreenProps {
  route: any;
  navigation: any;
}

export const FormScreen: React.FC<FormScreenProps> = ({
  route,
  navigation,
}) => {
  const { formInfo } = route.params; // Expects target element structural meta passed down
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchFormDetails();
  }, []);

  const fetchFormDetails = async () => {
    try {
      // Simulate API query targeted on specific backend form ID
      // const response = await api.get(`/admin/forms/${formInfo.form_id}/`);
      // setQuestions(response.data.questions);

      setTimeout(() => {
        setQuestions([
          {
            id: 10,
            text: 'Please elaborate on any technical system warnings encountered today.',
            question_type: 'sentence',
          },
          {
            id: 11,
            text: 'Rate the current network access control performance stability status:',
            question_type: 'choice',
            choices: [
              { id: 1, text: 'Optimal (Zero latency anomalies)' },
              { id: 2, text: 'Acceptable (Minor standard jitter)' },
              {
                id: 3,
                text: 'Unstable (Requires administrative troubleshooting)',
              },
            ],
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      Alert.alert('Error', 'Failed to read form questions contents.');
      navigation.goBack();
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // Validate that all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert(
        'Incomplete Form',
        'Please answer all questions before submitting.',
      );
      return;
    }

    // Format output data mirroring Django payload parameters
    const payload = {
      form: formInfo.form_id,
      scheduled_day: formInfo.scheduled_day_id,
      answers: questions.map(q => ({
        question: q.id,
        text_answer: q.question_type === 'sentence' ? answers[q.id] : null,
        selected_choice: q.question_type === 'choice' ? answers[q.id] : null,
      })),
    };

    setSubmitting(false);
    try {
      setSubmitting(true);
      // await api.post('/forms/submit/', payload);

      Alert.alert(
        'Success 🎉',
        'Form submission uploaded and processed successfully!',
        [{ text: 'Awesome', onPress: () => navigation.popToTop() }],
      );
    } catch (error) {
      Alert.alert(
        'Submission Error',
        'Failed to push configuration arrays to backend.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaViewBase style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formMeta}>
            <Text style={styles.title}>{formInfo.name}</Text>
            <Text style={styles.metaLabel}>
              Ensure metrics precision prior to operational submittal execution.
            </Text>
          </View>

          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id]}
              onChange={val => handleAnswerChange(question.id, val)}
            />
          ))}

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Questionnaire</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaViewBase>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  formMeta: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  metaLabel: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  disabledButton: { backgroundColor: '#A7F3D0' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
