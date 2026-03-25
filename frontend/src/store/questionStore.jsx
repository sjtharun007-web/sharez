import { create } from 'zustand';
import API from '../services/api.jsx';

const useQuestionStore = create((set, get) => ({
  questions:       [],
  currentQuestion: null,
  tags:            [],
  isLoading:       false,
  error:           null,

  fetchQuestions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.tag)    params.append('tag',    filters.tag);
      if (filters.solved !== undefined) params.append('solved', filters.solved);
      if (filters.search) params.append('search', filters.search);

      const { data } = await API.get(`/questions?${params.toString()}`);
      set({ questions: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch', isLoading: false });
    }
  },

  fetchQuestion: async (id) => {
    set({ isLoading: true, error: null, currentQuestion: null });
    try {
      const { data } = await API.get(`/questions/${id}`);
      set({ currentQuestion: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Not found', isLoading: false });
    }
  },

  fetchTags: async () => {
    try {
      const { data } = await API.get('/questions/tags/all');
      set({ tags: data.data });
    } catch (err) {
      console.error('Failed to fetch tags', err.message);
    }
  },

  createQuestion: async (title, description, tags) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post('/questions', { title, description, tags });
      set((state) => ({ questions: [data.data, ...state.questions], isLoading: false }));
      return { success: true, id: data.data._id };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  markSolved: async (questionId, answerId) => {
    try {
      const { data } = await API.patch(`/questions/${questionId}/solve`, { answerId });
      set((state) => ({
        currentQuestion: state.currentQuestion?._id === questionId
          ? { ...state.currentQuestion, ...data.data }
          : state.currentQuestion
      }));
      return data.data;
    } catch (err) {
      console.error('Mark solved failed:', err.message);
    }
  },

  clearCurrent: () => set({ currentQuestion: null }),
}));

export default useQuestionStore;
