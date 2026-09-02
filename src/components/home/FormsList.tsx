import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface FormChoice {
  id: number;
  text: string;
  order: number;
}

interface FormQuestion {
  id: number;
  text: string;
  question_type: 'choice' | 'sentence';
  order: number;
  choices: FormChoice[];
}

export interface TodayForm {
  id: number;
  name: string;
  questions: FormQuestion[];
  is_completed_today: boolean;
  submission_id: number | null;
  today_scheduled_day_id: number;
}

interface Props {
  forms: TodayForm[];
  navigation: any;
}

export default function FormsList({
  forms,
  navigation,
}: Props) {
  if (!forms?.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Forms</Text>

      {forms.map(form => (
        <TouchableOpacity
          key={form.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate('FormSubmissionScreen', {
              form,
            })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.formName}>
              {form.name}
            </Text>

            <Text style={styles.questions}>
              {form.questions.length} Question
              {form.questions.length > 1 ? 's' : ''}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              form.is_completed_today
                ? styles.completed
                : styles.pending,
            ]}
          >
            <Text>
              {form.is_completed_today
                ? 'Completed'
                : 'Pending'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formName: {
    fontSize: 15,
    fontWeight: '600',
  },
  questions: {
    marginTop: 4,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completed: {
    backgroundColor: '#DCFCE7',
  },
  pending: {
    backgroundColor: '#DBEAFE',
  },
});