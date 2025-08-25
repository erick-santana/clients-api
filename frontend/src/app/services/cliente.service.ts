import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timeout } from 'rxjs';
import { catchError, retry, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cliente, Operacao, ApiResponse, PaginatedResponse } from '../models/cliente.model';
import { FiltrosAvancados } from '../components/filtros-avancados/filtros-avancados.component';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = environment.apiUrl;
  private readonly clientesSubject = new BehaviorSubject<Cliente[]>([]);
  private readonly paginationSubject = new BehaviorSubject<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Cache para evitar requisições desnecessárias
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 segundos

  public readonly clientes$ = this.clientesSubject.asObservable().pipe(
    shareReplay(1)
  );

  public readonly pagination$ = this.paginationSubject.asObservable().pipe(
    shareReplay(1)
  );

  constructor(private http: HttpClient) {}

  // Listar todos os clientes com paginação
  getClientes(page: number = 1, limit: number = 10, search?: string, filtros?: FiltrosAvancados): Observable<PaginatedResponse<Cliente>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    // Adicionar filtros avançados
    if (filtros) {
      if (filtros.saldoMin !== undefined) {
        params = params.set('saldoMin', filtros.saldoMin.toString());
      }
      if (filtros.saldoMax !== undefined) {
        params = params.set('saldoMax', filtros.saldoMax.toString());
      }
      if (filtros.dataInicio) {
        params = params.set('dataInicio', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        params = params.set('dataFim', filtros.dataFim);
      }
      if (filtros.ordenarPor) {
        params = params.set('ordenarPor', filtros.ordenarPor);
      }
      if (filtros.ordenacao) {
        params = params.set('ordenacao', filtros.ordenacao);
      }
    }

    if (environment.enableDebug) {
      console.log(`[ClienteService] Fazendo requisição para: ${this.apiUrl}/clientes`);
      console.log(`[ClienteService] Parâmetros:`, { page, limit, search, filtros });
    }

    return this.http.get<PaginatedResponse<Cliente>>(`${this.apiUrl}/clientes`, { params })
      .pipe(
        timeout(environment.apiTimeout),
        tap(response => {
          if (environment.enableDebug) {
            console.log(`[ClienteService] Resposta recebida:`, response);
          }
          if (response.success && response.data) {
            this.clientesSubject.next(response.data);
            this.paginationSubject.next(response.pagination);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Buscar cliente por ID
  getCliente(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}`)
      .pipe(
        timeout(environment.apiTimeout),
        catchError(this.handleError)
      );
  }

  // Criar novo cliente
  criarCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes`, cliente)
      .pipe(
        timeout(environment.apiTimeout),
        tap(response => {
          if (response.success && response.data) {
            this.clearCache(); // Limpar cache após criar cliente
          }
        }),
        catchError(this.handleError)
      );
  }

  // Atualizar cliente
  atualizarCliente(id: number, cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}`, cliente)
      .pipe(
        timeout(environment.apiTimeout),
        tap(response => {
          if (response.success && response.data) {
            this.clearCache(); // Limpar cache após atualizar cliente
          }
        }),
        catchError(this.handleError)
      );
  }

  // Deletar cliente
  deletarCliente(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/clientes/${id}`)
      .pipe(
        timeout(environment.apiTimeout),
        tap(response => {
          if (response.success) {
            this.clearCache(); // Limpar cache após deletar cliente
          }
        }),
        catchError(this.handleError)
      );
  }

  // Depositar valor
  depositar(id: number, operacao: { valor: number }): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}/depositar`, operacao)
      .pipe(
        timeout(environment.apiTimeout),
        tap(response => {
          if (response.success && response.data) {
            this.clearCache(); // Limpar cache após depósito
          }
        }),
        catchError(this.handleError)
      );
  }

  // Sacar valor
  sacar(id: number, operacao: { valor: number }): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}/sacar`, operacao)
      .pipe(
        timeout(environment.apiTimeout),
        tap(response => {
          if (response.success && response.data) {
            this.clearCache(); // Limpar cache após saque
          }
        }),
        catchError(this.handleError)
      );
  }

  // Obter informações de paginação
  getPagination() {
    return this.paginationSubject.value;
  }

  // Buscar clientes
  searchClientes(search: string): Observable<PaginatedResponse<Cliente>> {
    return this.getClientes(1, 10, search);
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
    if (environment.enableDebug) {
      console.log('[ClienteService] Cache limpo');
    }
  }

  // Limpar cache específico
  clearCacheForSearch(search: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((value, key) => {
      if (key.includes(search)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
    if (environment.enableDebug) {
      console.log(`[ClienteService] Cache limpo para busca: ${search}`);
    }
  }

  // Tratamento de erros centralizado
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';

    if (environment.enableDebug) {
      console.error('[ClienteService] Erro na requisição:', error);
    }

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado';
      } else if (error.status === 400) {
        // Tratamento específico para erro de alteração de saldo
        if (error.error?.message?.includes('saldo não pode ser alterado')) {
          errorMessage = 'O saldo não pode ser alterado através da edição. Use as operações de depósito ou saque.';
        } else {
          errorMessage = error.error?.message || error.error?.error || 'Dados inválidos';
        }
      } else if (error.status === 409) {
        // Tratamento específico para conflito de email
        if (error.error?.message?.includes('Email já cadastrado')) {
          errorMessage = 'Este email já está sendo usado por outro cliente. Por favor, escolha um email diferente.';
        } else {
          errorMessage = error.error?.message || error.error?.error || 'Conflito de dados';
        }
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor';
      } else if (error.status === 408 || error.status === 504) {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
