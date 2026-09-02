import api from './client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuestionChoice {
  id: number;
  text: string;
  order: number;
}

export interface FormQuestion {
  id: number;
  text: string;
  question_type: 'choice' | 'sentence';
  choices: QuestionChoice[];
}

export interface TodayForm {
  id: number;
  name: string;
  questions: FormQuestion[];
  today_scheduled_day_id: number;
  is_completed: boolean;
}

// ── Submission payload ─────────────────────────────────────────────────────

export interface AnswerPayload {
  question: number;
  text_answer?: string;
  selected_choice?: number;
}

export interface FormSubmitPayload {
  form: number;
  scheduled_day: number;
  answers: AnswerPayload[];
}

// ── Submission response ────────────────────────────────────────────────────

export interface AnswerResponse {
  question: number;
  text_answer: string | null;
  selected_choice: number | null;
}

export interface FormSubmissionResponse {
  id: number;
  form: number;
  scheduled_day: number;
  submitted_at: string;
  is_completed: boolean;
  answers: AnswerResponse[];
}

// ── API calls ──────────────────────────────────────────────────────────────

export const fetchTodayForms = async (): Promise<TodayForm[]> => {
  const response = await api.get<TodayForm[]>('/forms/forms');
  return response.data;
};

export const submitForm = async (
  payload: FormSubmitPayload,
): Promise<FormSubmissionResponse> => {
  const response = await api.post<FormSubmissionResponse>(
    '/forms/forms/submit/',
    payload,
  );
  console.log(response);
  return response.data;
};

export const fetchMySubmissions = async (): Promise<
  FormSubmissionResponse[]
> => {
  const response = await api.get<FormSubmissionResponse[]>(
    '/forms/my-submissions/',
  );
  return response.data;
};
