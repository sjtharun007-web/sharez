import { create } from 'zustand';
import API from '../services/api.jsx';

const useAnswerStore = create((set) => ({
  answers:   [],
  isLoading: false,
  error:     null,

  fetchAnswers: async (questionId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.get(`/answers/${questionId}`);
      set({ answers: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch', isLoading: false });
    }
  },

  addAnswer: async (questionId, content) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post('/answers', { questionId, content });
      set((state) => ({ answers: [...state.answers, data.data], isLoading: false }));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add answer';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  // Vote — updates both counts and userVote independently
  castVote: async (answerId, voteType) => {
    try {
      const { data } = await API.post('/votes', { answerId, voteType });
      const { helpfulCount, notHelpfulCount, userVote } = data.data;
      set((state) => ({
        answers: state.answers.map((a) =>
          a._id === answerId
            ? { ...a, helpfulCount, notHelpfulCount, userVote }
            : a
        ),
      }));
    } catch (err) {
      console.error('Vote failed:', err.response?.data?.message);
    }
  },

  clearAnswers: () => set({ answers: [] }),
}));

export default useAnswerStore;
