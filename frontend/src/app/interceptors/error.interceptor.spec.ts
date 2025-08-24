import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let mockHandler: jasmine.SpyObj<HttpHandler>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showApiError']);
    
    TestBed.configureTestingModule({
      providers: [
        ErrorInterceptor,
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    });
    
    interceptor = TestBed.inject(ErrorInterceptor);
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass through successful requests', () => {
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
    expect(notificationService.showApiError).not.toHaveBeenCalled();
  });

  it('should handle 401 Unauthorized error', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Token inválido' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle 403 Forbidden error', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
      error: { message: 'Acesso negado' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle 404 Not Found error', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: { message: 'Recurso não encontrado' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle 422 Validation error', () => {
    const request = new HttpRequest('POST', '/api/test');
    const error = new HttpErrorResponse({
      status: 422,
      statusText: 'Unprocessable Entity',
      error: { message: 'Dados inválidos' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle 500 Internal Server Error', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: { message: 'Erro interno do servidor' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle network errors (status 0)', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 0,
      statusText: 'Network Error',
      error: { message: 'Network Error' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle unknown error status codes', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 999,
      statusText: 'Unknown Error',
      error: { message: 'Erro desconhecido' }
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle errors without error object', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle different HTTP methods with errors', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: { message: 'Erro interno do servidor' }
    });

    methods.forEach(method => {
      const request = new HttpRequest(method, '/api/test');
      mockHandler.handle.and.returnValue(throwError(() => error));

      interceptor.intercept(request, mockHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });

      expect(notificationService.showApiError).toHaveBeenCalledWith(error);
    });
  });

  it('should preserve error properties', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { message: 'Requisição inválida' },
      url: '/api/test'
    });
    mockHandler.handle.and.returnValue(throwError(() => error));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err.status).toBe(400);
        expect(err.statusText).toBe('Bad Request');
        expect(err.url).toBe('/api/test');
        expect(err.error.message).toBe('Requisição inválida');
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error);
  });

  it('should handle multiple consecutive errors', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error1 = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const error2 = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

    mockHandler.handle.and.returnValue(throwError(() => error1));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error1);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error1);

    mockHandler.handle.and.returnValue(throwError(() => error2));

    interceptor.intercept(request, mockHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error2);
      }
    });

    expect(notificationService.showApiError).toHaveBeenCalledWith(error2);
  });
});
