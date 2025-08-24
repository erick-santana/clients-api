import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Adicionar headers de segurança
    const secureReq = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-API-Version': '1.0',
        // CSRF Token (se implementado no backend)
        // 'X-CSRF-Token': this.getCsrfToken(),
      }
    });

    // Adicionar token de autenticação (se implementado)
    const token = this.getAuthToken();
    if (token) {
      secureReq.headers.set('Authorization', `Bearer ${token}`);
    }

    return next.handle(secureReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Tratar erros de autenticação
        if (error.status === 401) {
          this.handleUnauthorized();
        } else if (error.status === 403) {
          this.handleForbidden();
        }
        
        return throwError(() => error);
      })
    );
  }

  private getAuthToken(): string | null {
    // Implementar lógica de obtenção do token
    // Por enquanto, retorna null (sem autenticação)
    return null;
  }

  private getCsrfToken(): string | null {
    // Implementar lógica de obtenção do CSRF token
    // Por enquanto, retorna null
    return null;
  }

  private handleUnauthorized(): void {
    // Redirecionar para login ou mostrar mensagem
    console.warn('Usuário não autorizado');
  }

  private handleForbidden(): void {
    // Mostrar mensagem de acesso negado
    console.warn('Acesso negado');
  }
}
