import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AuthToken {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

export interface User {
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    expiresIn: string;
  };
  message: string;
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

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  /**
   * Login do usuário
   */
  login(username: string, password: string): Observable<{ success: boolean; message: string }> {
    const loginData: LoginRequest = { username, password };
    
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData)
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              // Calcular expiração baseada no expiresIn
              const expiresIn = response.data.expiresIn;
              const expiresAt = this.calculateExpirationTime(expiresIn);
              
              const token: AuthToken = {
                token: response.data.token,
                expiresAt: expiresAt,
                refreshToken: undefined // Backend não fornece refresh token ainda
              };

              const user: User = {
                username: response.data.user.username,
                role: response.data.user.role
              };

              this.setAuth(token, user);
              observer.next({ success: true, message: response.message });
            } else {
              observer.next({ success: false, message: response.message || 'Erro no login' });
            }
            observer.complete();
          },
          error: (error) => {
            console.error('Erro no login:', error);
            const message = error.error?.message || error.message || 'Erro no login';
            observer.next({ success: false, message });
            observer.complete();
          }
        });
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

  /**
   * Calcular tempo de expiração baseado no expiresIn
   */
  private calculateExpirationTime(expiresIn: string): number {
    const now = Date.now();
    
    if (expiresIn.includes('h')) {
      const hours = parseInt(expiresIn.replace('h', ''));
      return now + (hours * 60 * 60 * 1000);
    } else if (expiresIn.includes('m')) {
      const minutes = parseInt(expiresIn.replace('m', ''));
      return now + (minutes * 60 * 1000);
    } else if (expiresIn.includes('s')) {
      const seconds = parseInt(expiresIn.replace('s', ''));
      return now + (seconds * 1000);
    } else {
      // Padrão: 24 horas
      return now + (24 * 60 * 60 * 1000);
    }
  }
}

// Import necessário para o map
import { map } from 'rxjs/operators';
