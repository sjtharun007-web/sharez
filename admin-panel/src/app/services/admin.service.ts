import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, User, Question, Answer } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;
  private qApi = `${environment.apiUrl}/questions`;
  private aApi = `${environment.apiUrl}/answers`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.api}/users`);
  }

  getQuestions(): Observable<ApiResponse<Question[]>> {
    return this.http.get<ApiResponse<Question[]>>(`${this.api}/questions`);
  }

  getAnswersForQuestion(questionId: string): Observable<ApiResponse<Answer[]>> {
    return this.http.get<ApiResponse<Answer[]>>(`${this.aApi}/${questionId}`);
  }

  deleteQuestion(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.api}/questions/${id}`);
  }

  deleteAnswer(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.api}/answers/${id}`);
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.api}/users/${id}`);
  }
}
