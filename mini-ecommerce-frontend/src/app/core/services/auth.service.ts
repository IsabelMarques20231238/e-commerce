import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // O API_URL tem de estar exatamente aqui: dentro da classe, mas antes do constructor
  private readonly API_URL = 'http://localhost:8000/api'; 

  constructor(private http: HttpClient) {}

  // Função de Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  // Função de Registo
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {});
  }

  saveSession(token: string, user: any) {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role || 'user');
    }
  }

  getRole() {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const directRole = localStorage.getItem('role');

    if (directRole) {
      return directRole;
    }

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser)?.role ?? null;
    } catch {
      return null;
    }
  }

  hasToken() {
    return typeof localStorage !== 'undefined'
      && Boolean(localStorage.getItem('token') || localStorage.getItem('auth_token'));
  }

  isAdmin() {
    return this.getRole() === 'admin';
  }

  clearSession() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
}
