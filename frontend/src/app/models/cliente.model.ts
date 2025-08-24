export interface Cliente {
  id?: number;
  nome: string;
  email: string;
  saldo: number;
  created_at?: string;
  updated_at?: string;
}

export interface Operacao {
  valor: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
