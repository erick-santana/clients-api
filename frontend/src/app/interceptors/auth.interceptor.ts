import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Adicionar headers de segurança
    let secureReq = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-API-Version': '1.0',
        // CSRF Token (se implementado no backend)
        // 'X-CSRF-Token': this.getCsrfToken(),
      }
    });

    // Adicionar token de autenticação
    const token = this.authService.getToken();
    if (token) {
      secureReq = secureReq.clone({
        setHeaders: {
          ...secureReq.headers,
          'Authorization': `Bearer ${token}`
        }
      });
    }

    return next.handle(secureReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Tratar erros de autenticação
        if (error.status === 401) {
          return this.handleUnauthorized(request, next);
        } else if (error.status === 403) {
          this.handleForbidden();
        }
        
        return throwError(() => error);
      })
    );
  }

  private getCsrfToken(): string | null {
    // Implementar lógica de obtenção do CSRF token
    // Por enquanto, retorna null
    return null;
  }

  private handleUnauthorized(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Tentar renovar o token
    return this.authService.refreshToken().pipe(
      switchMap(success => {
        if (success) {
          // Token renovado, tentar a requisição novamente
          const newToken = this.authService.getToken();
          if (newToken) {
            const newRequest = request.clone({
              setHeaders: {
                ...request.headers,
                'Authorization': `Bearer ${newToken}`
              }
            });
            return next.handle(newRequest);
          }
        }
        
        // Falha na renovação, fazer logout
        this.authService.logout();
        return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
      })
    );
  }

  private handleForbidden(): void {
    // Mostrar mensagem de acesso negado
    console.warn('Acesso negado');
    this.authService.logout();
  }
}
