// Helper to persist data in localeStorage
const getInitialData = (key, defaultData) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage`, e);
    }
  }
  return defaultData;
};

const persistData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock data for development
const initialMockEntries = [
  {
    id: 1,
    date: '2026-02-01',
    dayOfWeek: 'Saturday',
    items: [
      { id: 1, description: 'Completed React frontend', points: 20, category: 'Project', completed: true },
      { id: 2, description: 'Fixed API integration', points: 15, category: 'Study', completed: true }
    ],
    satisfactionLevel: 4,
    totalPoints: 35,
    notes: 'Great progress on the frontend today!'
  },
  {
    id: 2,
    date: '2026-01-31',
    dayOfWeek: 'Friday',
    items: [
      { id: 3, description: 'Read documentation', points: 10, category: 'Reading', completed: true }
    ],
    satisfactionLevel: 3,
    totalPoints: 10,
    notes: 'Good learning session'
  }
];

const initialMockStreams = [
  {
    id: 1,
    name: 'UPSC Preparation',
    tasks: [
      { id: 1, title: 'History Reading', status: 'COMPLETED', points: 15, duration: 60 },
      { id: 2, title: 'Current Affairs', status: 'PENDING', points: 10, duration: 30 }
    ]
  },
  {
    id: 2,
    name: 'Data Structures',
    tasks: [
      { id: 3, title: 'Binary Trees', status: 'COMPLETED', points: 20, duration: 90 }
    ]
  }
];

const initialMockMoodEntries = [
  {
    id: 1,
    date: '2026-02-01',
    mood: 4,
    energy: 3,
    motivation: 4,
    notes: 'Great day! Completed all my tasks and felt productive.'
  },
  {
    id: 2,
    date: '2026-01-31',
    mood: 3,
    energy: 2,
    motivation: 3,
    notes: 'Average day, felt a bit tired but managed to get things done.'
  }
];

const initialMockTasks = [
  {
    id: 1,
    title: 'Complete React components',
    type: 'DAILY',
    status: 'COMPLETED',
    assignedDate: '2026-02-01',
    completedDate: '2026-02-01',
    duration: 120,
    points: 25,
    stream: { id: 2, name: 'Data Structures' },
    revisionDate: '2026-02-08'
  },
  {
    id: 2,
    title: 'Review backend API',
    type: 'WEEKLY',
    status: 'PENDING',
    assignedDate: '2026-02-01',
    completedDate: null,
    duration: 60,
    points: 15,
    stream: { id: 1, name: 'UPSC Preparation' },
    revisionDate: '2026-02-02'
  },
  {
    id: 3,
    title: 'Write documentation',
    type: 'MONTHLY',
    status: 'SKIPPED',
    assignedDate: '2026-01-31',
    completedDate: null,
    duration: 90,
    points: 20,
    stream: null,
    revisionDate: '2026-02-05'
  }
];

let mockEntries = getInitialData('mockEntries', initialMockEntries);
let mockStreams = getInitialData('mockStreams', initialMockStreams);
let mockMoodEntries = getInitialData('mockMoodEntries', initialMockMoodEntries);
let mockTasks = getInitialData('mockTasks', initialMockTasks);

const mockPointsSummary = {
  totalPoints: 45,
  weeklyPoints: 35,
  breakdown: [
    { date: '2026-02-01', dayOfWeek: 'Saturday', points: 35, itemCount: 2 },
    { date: '2026-01-31', dayOfWeek: 'Friday', points: 10, itemCount: 1 }
  ]
};

const mockSatisfactionData = [
  { date: '2026-01-27', day: 'Mon', satisfaction: 0, points: 0, hasEntry: false },
  { date: '2026-01-28', day: 'Tue', satisfaction: 0, points: 0, hasEntry: false },
  { date: '2026-01-29', day: 'Wed', satisfaction: 0, points: 0, hasEntry: false },
  { date: '2026-01-30', day: 'Thu', satisfaction: 0, points: 0, hasEntry: false },
  { date: '2026-01-31', day: 'Fri', satisfaction: 3, points: 10, hasEntry: true },
  { date: '2026-02-01', day: 'Sat', satisfaction: 4, points: 35, hasEntry: true },
  { date: '2026-02-02', day: 'Sun', satisfaction: 0, points: 0, hasEntry: false }
];

// Mock API functions
export const mockWorkDoneAPI = {
  getAllEntries: () => Promise.resolve({ data: mockEntries }),

  getEntry: (id) => {
    const entry = mockEntries.find(e => e.id === parseInt(id));
    return Promise.resolve({ data: entry || null });
  },

  getEntryByDate: (date) => {
    const entry = mockEntries.find(e => e.date === date);
    if (entry) {
      return Promise.resolve({ data: entry });
    }
    // Return empty entry for new dates
    return Promise.resolve({
      data: {
        date,
        dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        items: [],
        satisfactionLevel: 3,
        totalPoints: 0,
        notes: ''
      }
    });
  },

  getWeekEntries: (startDate) => {
    return Promise.resolve({ data: mockEntries });
  },

  createEntry: (entry) => {
    const newEntry = {
      ...entry,
      id: mockEntries.length + 1,
      totalPoints: entry.items?.reduce((sum, item) => sum + (item.points || 0), 0) || 0
    };
    mockEntries.unshift(newEntry);
    persistData('mockEntries', mockEntries);
    return Promise.resolve({ data: newEntry });
  },

  updateEntry: (id, entry) => {
    const index = mockEntries.findIndex(e => e.id === parseInt(id));
    if (index !== -1) {
      const updatedEntry = {
        ...entry,
        id: parseInt(id),
        totalPoints: entry.items?.reduce((sum, item) => sum + (item.points || 0), 0) || 0
      };
      mockEntries[index] = updatedEntry;
      persistData('mockEntries', mockEntries);
      return Promise.resolve({ data: updatedEntry });
    }
    return Promise.reject(new Error('Entry not found'));
  },

  deleteEntry: (id) => {
    const index = mockEntries.findIndex(e => e.id === parseInt(id));
    if (index !== -1) {
      mockEntries.splice(index, 1);
      persistData('mockEntries', mockEntries);
      return Promise.resolve({});
    }
    return Promise.reject(new Error('Entry not found'));
  },

  getPointsSummary: () => {
    const totalPoints = mockEntries.reduce((sum, entry) => sum + entry.totalPoints, 0);
    const weeklyPoints = mockEntries
      .filter(entry => new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, entry) => sum + entry.totalPoints, 0);

    return Promise.resolve({
      data: {
        ...mockPointsSummary,
        totalPoints,
        weeklyPoints
      }
    });
  },

  getWeeklySatisfaction: (startDate) => {
    return Promise.resolve({ data: mockSatisfactionData });
  }
};

export const mockTodoAPI = {
  getAllTasks: () => Promise.resolve({ data: [...mockTasks] }),

  createTask: (task) => {
    let streamObj = null;
    if (task.streamId) {
      const sId = parseInt(task.streamId);
      streamObj = mockStreams.find(s => s.id === sId);
    }

    const newTask = {
      ...task,
      id: mockTasks.length + 1,
      status: 'PENDING',
      assignedDate: new Date().toISOString().split('T')[0],
      completedDate: null,
      stream: streamObj
    };
    mockTasks.unshift(newTask);
    persistData('mockTasks', mockTasks);
    return Promise.resolve({ data: newTask });
  },

  updateTask: (id, task) => {
    const index = mockTasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...task };
      persistData('mockTasks', mockTasks);
      return Promise.resolve({ data: mockTasks[index] });
    }
    return Promise.reject(new Error('Task not found'));
  },

  updateTaskStatus: (id, status) => {
    const task = mockTasks.find(t => t.id === parseInt(id));
    if (task) {
      task.status = status;
      task.completedDate = status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null;
      persistData('mockTasks', mockTasks);
      return Promise.resolve({ data: task });
    }
    return Promise.reject(new Error('Task not found'));
  },

  deleteTask: (id) => {
    const index = mockTasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      mockTasks.splice(index, 1);
      persistData('mockTasks', mockTasks);
      return Promise.resolve({});
    }
    return Promise.reject(new Error('Task not found'));
  }
};

export const mockStreamsAPI = {
  getAllStreams: () => Promise.resolve({ data: [...mockStreams] }),

  createStream: (stream) => {
    const newStream = {
      ...stream,
      id: mockStreams.length + 1,
      tasks: []
    };
    mockStreams.push(newStream);
    persistData('mockStreams', mockStreams);
    return Promise.resolve({ data: newStream });
  },

  deleteStream: (id) => {
    const index = mockStreams.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      mockStreams.splice(index, 1);
      persistData('mockStreams', mockStreams);
      return Promise.resolve({});
    }
    return Promise.reject(new Error('Stream not found'));
  }
};

export const mockViewPlanAPI = {
  getDailyPlan: (date) => {
    const dailyTasks = mockTasks.filter(task =>
      task.type === 'DAILY' && task.assignedDate === date
    );
    return Promise.resolve({ data: dailyTasks });
  },

  getWeeklyPlan: (date) => {
    const weeklyTasks = mockTasks.filter(task => task.type === 'WEEKLY');
    return Promise.resolve({ data: weeklyTasks });
  },

  getMonthlyPlan: (date) => {
    const monthlyTasks = mockTasks.filter(task => task.type === 'MONTHLY');
    return Promise.resolve({ data: monthlyTasks });
  }
};

export const mockMoodAPI = {
  getMoodByDate: (date) => {
    const mood = mockMoodEntries.find(entry => entry.date === date);
    return Promise.resolve({ data: mood || null });
  },

  getMoodHistory: () => {
    return Promise.resolve({ data: [...mockMoodEntries] });
  },

  createMood: (mood) => {
    const newMood = {
      ...mood,
      id: mockMoodEntries.length + 1
    };
    mockMoodEntries.unshift(newMood);
    persistData('mockMoodEntries', mockMoodEntries);
    return Promise.resolve({ data: newMood });
  },

  updateMood: (id, mood) => {
    const index = mockMoodEntries.findIndex(entry => entry.id === parseInt(id));
    if (index !== -1) {
      mockMoodEntries[index] = { ...mockMoodEntries[index], ...mood };
      persistData('mockMoodEntries', mockMoodEntries);
      return Promise.resolve({ data: mockMoodEntries[index] });
    }
    return Promise.reject(new Error('Mood entry not found'));
  }
};

// Answer Flow Mock Data
const initialMockQuestions = [
  { id: 1, text: "Discuss the impact of the Green Revolution on Indian agriculture.", subject: "Geography", topic: "Agriculture", createdAt: '2026-02-01' },
  { id: 2, text: "Explain the features of the Indian Constitution's Preamble.", subject: "Polity", topic: "Constitution", createdAt: '2026-02-01' }
];

const initialMockSubmissions = [
  { id: 1, questionId: 1, pdfPath: 'answer-gr.pdf', timeTaken: 15, status: 'REVIEWED', submittedAt: '2026-02-01' }
];

const initialMockReviews = [
  { id: 1, submissionId: 1, score: 7.5, feedback: "Good structure, but needs more focus on regional disparities.", verdict: "GOOD", reviewedAt: '2026-02-02' }
];

let mockQuestions = getInitialData('mockQuestions', initialMockQuestions);
let mockSubmissions = getInitialData('mockSubmissions', initialMockSubmissions);
let mockReviews = getInitialData('mockReviews', initialMockReviews);

export const mockAnswerAPI = {
  // Questions
  getQuestions: () => Promise.resolve({ data: [...mockQuestions] }),
  createQuestion: (q) => {
    const newQ = { ...q, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    mockQuestions.push(newQ);
    persistData('mockQuestions', mockQuestions);
    return Promise.resolve({ data: newQ });
  },

  // Submissions
  submitAnswer: (formData) => {
    const qId = parseInt(formData.get('questionId'));
    const newSub = {
      id: Date.now(),
      questionId: qId,
      pdfPath: 'mock-upload.pdf',
      timeTaken: formData.get('timeTaken') || 0,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    mockSubmissions.push(newSub);
    persistData('mockSubmissions', mockSubmissions);
    return Promise.resolve({ data: newSub });
  },
  getMySubmissions: () => {
    const list = mockSubmissions.map(sub => {
      const q = mockQuestions.find(qq => qq.id === sub.questionId);
      const r = mockReviews.find(rr => rr.submissionId === sub.id);
      return { ...sub, questionText: q?.text, review: r };
    });
    return Promise.resolve({ data: list });
  },
  getSubmission: (id) => {
    const sub = mockSubmissions.find(s => s.id === parseInt(id));
    const q = mockQuestions.find(qq => qq.id === sub?.questionId);
    return Promise.resolve({ data: { ...sub, questionText: q?.text } });
  },

  // Reviews
  getReview: (submissionId) => {
    const r = mockReviews.find(rr => rr.submissionId === parseInt(submissionId));
    return Promise.resolve({ data: r || null });
  },
  submitReview: (submissionId, review) => {
    const subId = parseInt(submissionId);
    const newReview = { ...review, id: Date.now(), submissionId: subId, reviewedAt: new Date().toISOString().split('T')[0] };
    mockReviews.push(newReview);

    // Update submission status
    const sub = mockSubmissions.find(s => s.id === subId);
    if (sub) sub.status = 'REVIEWED';

    persistData('mockReviews', mockReviews);
    persistData('mockSubmissions', mockSubmissions);
    return Promise.resolve({ data: newReview });
  },
  getDownloadUrl: (fileName) => '#'
};