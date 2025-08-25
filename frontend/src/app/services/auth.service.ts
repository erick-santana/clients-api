import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthToken {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  private authTokenSubject = new BehaviorSubject<AuthToken | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);

  public authToken$ = this.authTokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.authToken$.pipe(
    map(token => !!token && this.isTokenValid(token))
  );

  constructor() {
    this.loadStoredAuth();
  }

  /**
   * Login do usuário
   */
  login(email: string, password: string): Observable<{ success: boolean; message: string }> {
    // Simular login - em produção, isso seria uma chamada HTTP
    return new Observable(observer => {
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'admin123') {
          const token: AuthToken = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.example',
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
            refreshToken: 'refresh_token_example'
          };

          const user: User = {
            id: 1,
            email: 'admin@example.com',
            name: 'Administrador',
            role: 'admin'
          };

          this.setAuth(token, user);
          observer.next({ success: true, message: 'Login realizado com sucesso' });
        } else {
          observer.next({ success: false, message: 'Email ou senha inválidos' });
        }
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    this.clearAuth();
  }

  /**
   * Obter token atual
   */
  getToken(): string | null {
    const auth = this.authTokenSubject.value;
    if (auth && this.isTokenValid(auth)) {
      return auth.token;
    }
    return null;
  }

  /**
   * Obter refresh token
   */
  getRefreshToken(): string | null {
    const auth = this.authTokenSubject.value;
    return auth?.refreshToken || null;
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const auth = this.authTokenSubject.value;
    return !!auth && this.isTokenValid(auth);
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Renovar token
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    // Simular renovação de token - em produção, seria uma chamada HTTP
    return new Observable(observer => {
      setTimeout(() => {
        const newToken: AuthToken = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.new_example',
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          refreshToken: 'new_refresh_token_example'
        };

        const currentUser = this.getCurrentUser();
        if (currentUser) {
          this.setAuth(newToken, currentUser);
        }
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Definir autenticação
   */
  private setAuth(token: AuthToken, user: User): void {
    // Armazenar no localStorage
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Atualizar BehaviorSubjects
    this.authTokenSubject.next(token);
    this.userSubject.next(user);
  }

  /**
   * Limpar autenticação
   */
  private clearAuth(): void {
    // Remover do localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Limpar BehaviorSubjects
    this.authTokenSubject.next(null);
    this.userSubject.next(null);
  }

  /**
   * Carregar autenticação armazenada
   */
  private loadStoredAuth(): void {
    try {
      const tokenStr = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);

      if (tokenStr && userStr) {
        const token: AuthToken = JSON.parse(tokenStr);
        const user: User = JSON.parse(userStr);

        if (this.isTokenValid(token)) {
          this.authTokenSubject.next(token);
          this.userSubject.next(user);
        } else {
          this.clearAuth();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
      this.clearAuth();
    }
  }

  /**
   * Verificar se o token é válido
   */
  private isTokenValid(token: AuthToken): boolean {
    return token.expiresAt > Date.now();
  }

  /**
   * Verificar se o token expira em breve (próximos 5 minutos)
   */
  isTokenExpiringSoon(): boolean {
    const auth = this.authTokenSubject.value;
    if (!auth) return false;

    const fiveMinutes = 5 * 60 * 1000;
    return auth.expiresAt - Date.now() < fiveMinutes;
  }
}

// Import necessário para o map
import { map } from 'rxjs/operators';
