import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let mockHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor
      ]
    });
    
    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when token exists', () => {
    const token = 'test-token';
    spyOn(localStorage, 'getItem').and.returnValue(token);
    
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    expect(mockHandler.handle).toHaveBeenCalledWith(
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          lazyUpdate: jasmine.any(Array)
        })
      })
    );
  });

  it('should not add Authorization header when token does not exist', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should add Authorization header with Bearer prefix', () => {
    const token = 'test-token';
    spyOn(localStorage, 'getItem').and.returnValue(token);
    
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(modifiedRequest.headers.has('Authorization')).toBeTruthy();
    expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should handle different HTTP methods', () => {
    const token = 'test-token';
    spyOn(localStorage, 'getItem').and.returnValue(token);
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    methods.forEach(method => {
      const request = new HttpRequest(method, '/api/test');
      interceptor.intercept(request, mockHandler).subscribe();
      
      expect(mockHandler.handle).toHaveBeenCalledWith(
        jasmine.objectContaining({
          method: method
        })
      );
    });
  });

  it('should preserve existing headers', () => {
    const token = 'test-token';
    spyOn(localStorage, 'getItem').and.returnValue(token);
    
    const request = new HttpRequest('GET', '/api/test', null, {
      headers: {
        'Content-Type': 'application/json',
        'Custom-Header': 'custom-value'
      }
    });
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
    expect(modifiedRequest.headers.get('Custom-Header')).toBe('custom-value');
    expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should handle empty token string', () => {
    spyOn(localStorage, 'getItem').and.returnValue('');
    
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should handle whitespace-only token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('   ');
    
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should handle different localStorage keys', () => {
    const token = 'test-token';
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return token;
      return null;
    });
    
    const request = new HttpRequest('GET', '/api/test');
    const mockEvent = of({} as HttpEvent<any>);
    mockHandler.handle.and.returnValue(mockEvent);

    interceptor.intercept(request, mockHandler).subscribe();

    expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
  });
});
