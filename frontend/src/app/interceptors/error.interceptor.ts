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
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro inesperado';

        if (error.error instanceof ErrorEvent) {
          // Erro do cliente
          errorMessage = `Erro de rede: ${error.error.message}`;
        } else {
          // Erro do servidor
          switch (error.status) {
            case 0:
              errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
              break;
            case 400:
              errorMessage = error.error?.error || 'Dados inválidos';
              break;
            case 401:
              errorMessage = 'Sessão expirada. Faça login novamente.';
              break;
            case 403:
              errorMessage = 'Acesso negado';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado';
              break;
            case 409:
              errorMessage = error.error?.error || 'Conflito de dados';
              break;
            case 422:
              errorMessage = error.error?.error || 'Dados inválidos';
              break;
            case 429:
              errorMessage = 'Muitas requisições. Tente novamente em alguns instantes.';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            case 502:
              errorMessage = 'Servidor temporariamente indisponível';
              break;
            case 503:
              errorMessage = 'Serviço temporariamente indisponível';
              break;
            case 504:
              errorMessage = 'Timeout da requisição';
              break;
            default:
              errorMessage = `Erro ${error.status}: ${error.message}`;
          }
        }

        // Log do erro em desenvolvimento
        if (environment.enableDebug) {
          console.error('Erro HTTP:', {
            url: request.url,
            method: request.method,
            status: error.status,
            message: errorMessage,
            error: error
          });
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
