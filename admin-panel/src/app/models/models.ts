export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  isSolved: boolean;
  userId: { _id: string; name: string; email: string } | string;
  createdAt: string;
}

export interface Answer {
  _id: string;
  content: string;
  questionId: string | { _id: string; title: string };
  userId: { _id: string; name: string; email: string } | string;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  solvedQuestions: number;
  unsolvedQuestions: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}
