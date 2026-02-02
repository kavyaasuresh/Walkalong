import axios from 'axios';
import { mockWorkDoneAPI, mockTodoAPI, mockStreamsAPI, mockViewPlanAPI, mockMoodAPI } from './mockApi';

const API_BASE_URL = 'http://localhost:8080/api';
const USE_MOCK_API = true; // Set to false when backend is running

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Real API functions
const realWorkDoneAPI = {
  getAllEntries: () => api.get('/workdone'),
  getEntry: (id) => api.get(`/workdone/${id}`),
  getEntryByDate: (date) => api.get(`/workdone/date/${date}`),
  getWeekEntries: (startDate) => api.get(`/workdone/week?startDate=${startDate}`),
  createEntry: (entry) => api.post('/workdone', entry),
  updateEntry: (id, entry) => api.put(`/workdone/${id}`, entry),
  deleteEntry: (id) => api.delete(`/workdone/${id}`),
  getPointsSummary: () => api.get('/workdone/points/summary'),
  getWeeklySatisfaction: (startDate) =>
    api.get(`/workdone/satisfaction/weekly${startDate ? `?startDate=${startDate}` : ''}`),
};

const realTodoAPI = {
  getAllTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  updateTaskStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

const realStreamsAPI = {
  getAllStreams: () => api.get('/streams'),
  createStream: (stream) => api.post('/streams', stream),
  deleteStream: (id) => api.delete(`/streams/${id}`),
};

const realViewPlanAPI = {
  getDailyPlan: (date) => api.get(`/view-plan/daily?date=${date}`),
  getWeeklyPlan: (date) => api.get(`/view-plan/weekly?date=${date}`),
  getMonthlyPlan: (date) => api.get(`/view-plan/monthly?date=${date}`),
};

const realMoodAPI = {
  getMoodByDate: (date) => api.get(`/mood/date/${date}`),
  getMoodHistory: () => api.get('/mood'),
  createMood: (mood) => api.post('/mood', mood),
  updateMood: (id, mood) => api.put(`/mood/${id}`, mood),
};

// Export either mock or real API based on USE_MOCK_API flag
export const workDoneAPI = USE_MOCK_API ? mockWorkDoneAPI : realWorkDoneAPI;
export const todoAPI = USE_MOCK_API ? mockTodoAPI : realTodoAPI;
export const streamsAPI = USE_MOCK_API ? mockStreamsAPI : realStreamsAPI;
export const viewPlanAPI = USE_MOCK_API ? mockViewPlanAPI : realViewPlanAPI;
export const moodAPI = USE_MOCK_API ? mockMoodAPI : realMoodAPI;

const realAnswerAPI = {
  getQuestions: () => api.get('/answers/questions'),
  createQuestion: (question) => api.post('/answers/questions', question),
  submitAnswer: (formData) => api.post('/answers/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMySubmissions: () => api.get('/answers/my-submissions'),
  getSubmission: (id) => api.get(`/answers/submission/${id}`),
  submitReview: (submissionId, review) => api.post(`/answers/review?submissionId=${submissionId}`, review),
  getReview: (submissionId) => api.get(`/answers/submission/${submissionId}/review`),
  getDownloadUrl: (fileName) => `${API_BASE_URL}/answers/download/${fileName}`,
};

const mockAnswerAPI = {
  getQuestions: () => Promise.resolve({ data: [] }),
  createQuestion: (question) => Promise.resolve({ data: { ...question, id: Date.now() } }),
  submitAnswer: (formData) => Promise.resolve({ data: { id: Date.now(), status: 'SUBMITTED' } }),
  getMySubmissions: () => Promise.resolve({ data: [] }),
  getSubmission: (id) => Promise.resolve({ data: {} }),
  submitReview: (id, review) => Promise.resolve({ data: review }),
  getReview: (id) => Promise.resolve({ data: null }),
  getDownloadUrl: (fileName) => '#',
};

export const answersAPI = USE_MOCK_API ? mockAnswerAPI : realAnswerAPI;

export default api;