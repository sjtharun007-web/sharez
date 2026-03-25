import { create } from 'zustand';
import API from '../services/api.jsx';

const useCommentStore = create((set) => ({
  // comments keyed by answerId: { [answerId]: [...] }
  comments:  {},
  loading:   {},

  fetchComments: async (answerId) => {
    set((s) => ({ loading: { ...s.loading, [answerId]: true } }));
    try {
      const { data } = await API.get(`/comments/${answerId}`);
      set((s) => ({
        comments: { ...s.comments, [answerId]: data.data },
        loading:  { ...s.loading,  [answerId]: false },
      }));
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, [answerId]: false } }));
    }
  },

  addComment: async (answerId, content) => {
    try {
      const { data } = await API.post('/comments', { answerId, content });
      set((s) => ({
        comments: {
          ...s.comments,
          [answerId]: [...(s.comments[answerId] || []), data.data],
        },
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed' };
    }
  },

  deleteComment: async (commentId, answerId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      set((s) => ({
        comments: {
          ...s.comments,
          [answerId]: (s.comments[answerId] || []).filter((c) => c._id !== commentId),
        },
      }));
    } catch (err) {
      console.error('Delete comment failed:', err.message);
    }
  },

  clearComments: () => set({ comments: {}, loading: {} }),
}));

export default useCommentStore;
