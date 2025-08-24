import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cliente, Operacao, ApiResponse } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = environment.apiUrl;
  private readonly clientesSubject = new BehaviorSubject<Cliente[]>([]);
  public readonly clientes$ = this.clientesSubject.asObservable().pipe(
    shareReplay(1)
  );

  constructor(private http: HttpClient) {}

  // Listar todos os clientes
  getClientes(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(`${this.apiUrl}/clientes`)
      .pipe(
        retry(1),
        tap(response => {
          if (response.success && response.data) {
            this.clientesSubject.next(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Buscar cliente por ID
  getCliente(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Criar novo cliente
  criarCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes`, cliente)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.refreshClientes();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Atualizar cliente
  atualizarCliente(id: number, cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}`, cliente)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.refreshClientes();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Deletar cliente
  deletarCliente(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/clientes/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.refreshClientes();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Realizar depósito
  depositar(id: number, operacao: Operacao): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}/depositar`, operacao)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.refreshClientes();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Realizar saque
  sacar(id: number, operacao: Operacao): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}/sacar`, operacao)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.refreshClientes();
          }
        }),
        catchError(this.handleError)
      );
  }

  // Atualizar lista de clientes
  private refreshClientes(): void {
    this.getClientes().subscribe();
  }

  // Tratamento de erros centralizado
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado';
      } else if (error.status === 400) {
        errorMessage = error.error?.error || 'Dados inválidos';
      } else if (error.status === 409) {
        errorMessage = error.error?.error || 'Conflito de dados';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    if (environment.enableDebug) {
      console.error('Erro na requisição:', error);
    }

    return throwError(() => new Error(errorMessage));
  }
}
