import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { Cliente, Operacao, ApiResponse } from '../models/cliente.model';
import { environment } from '../../environments/environment';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  const mockCliente: Cliente = {
    id: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    saldo: 1000.00,
    created_at: '2025-08-24T10:00:00Z',
    updated_at: '2025-08-24T10:00:00Z'
  };

  const mockApiResponse: ApiResponse<Cliente[]> = {
    success: true,
    data: [mockCliente],
    message: 'Clientes listados com sucesso'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClienteService]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('should return list of clients', () => {
      service.listarTodos().subscribe(response => {
        expect(response).toEqual(mockApiResponse);
        expect(response.data).toContain(mockCliente);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should handle error when API fails', () => {
      const errorMessage = 'Erro ao listar clientes';
      
      service.listarTodos().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('buscarPorId', () => {
    it('should return a specific client', () => {
      const clienteId = 1;
      const mockResponse: ApiResponse<Cliente> = {
        success: true,
        data: mockCliente,
        message: 'Cliente encontrado'
      };

      service.buscarPorId(clienteId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.id).toBe(clienteId);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes/${clienteId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('criar', () => {
    it('should create a new client', () => {
      const novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'> = {
        nome: 'Maria Santos',
        email: 'maria@example.com',
        saldo: 500.00
      };

      const mockResponse: ApiResponse<Cliente> = {
        success: true,
        data: { ...novoCliente, id: 2, created_at: '2025-08-24T10:00:00Z', updated_at: '2025-08-24T10:00:00Z' },
        message: 'Cliente criado com sucesso'
      };

      service.criar(novoCliente).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.nome).toBe(novoCliente.nome);
        expect(response.data.email).toBe(novoCliente.email);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novoCliente);
      req.flush(mockResponse);
    });
  });

  describe('atualizar', () => {
    it('should update an existing client', () => {
      const clienteId = 1;
      const dadosAtualizados = {
        nome: 'João Silva Atualizado',
        email: 'joao.atualizado@example.com'
      };

      const mockResponse: ApiResponse<Cliente> = {
        success: true,
        data: { ...mockCliente, ...dadosAtualizados },
        message: 'Cliente atualizado com sucesso'
      };

      service.atualizar(clienteId, dadosAtualizados).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.nome).toBe(dadosAtualizados.nome);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes/${clienteId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dadosAtualizados);
      req.flush(mockResponse);
    });
  });

  describe('deletar', () => {
    it('should delete a client', () => {
      const clienteId = 1;
      const mockResponse: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Cliente deletado com sucesso'
      };

      service.deletar(clienteId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes/${clienteId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('depositar', () => {
    it('should deposit money to client account', () => {
      const clienteId = 1;
      const operacao: Operacao = { valor: 500.00 };
      const mockResponse: ApiResponse<Cliente> = {
        success: true,
        data: { ...mockCliente, saldo: 1500.00 },
        message: 'Depósito realizado com sucesso'
      };

      service.depositar(clienteId, operacao).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.saldo).toBe(1500.00);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes/${clienteId}/depositar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(operacao);
      req.flush(mockResponse);
    });
  });

  describe('sacar', () => {
    it('should withdraw money from client account', () => {
      const clienteId = 1;
      const operacao: Operacao = { valor: 200.00 };
      const mockResponse: ApiResponse<Cliente> = {
        success: true,
        data: { ...mockCliente, saldo: 800.00 },
        message: 'Saque realizado com sucesso'
      };

      service.sacar(clienteId, operacao).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.saldo).toBe(800.00);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/clientes/${clienteId}/sacar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(operacao);
      req.flush(mockResponse);
    });
  });

  describe('BehaviorSubject', () => {
    it('should update clientes$ when new data is set', () => {
      const clientes = [mockCliente];
      
      service.setClientes(clientes);
      
      service.clientes$.subscribe(data => {
        expect(data).toEqual(clientes);
      });
    });

    it('should add client to clientes$ when new client is created', () => {
      const novoCliente: Cliente = {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@example.com',
        saldo: 500.00,
        created_at: '2025-08-24T10:00:00Z',
        updated_at: '2025-08-24T10:00:00Z'
      };

      service.setClientes([mockCliente]);
      service.addCliente(novoCliente);

      service.clientes$.subscribe(clientes => {
        expect(clientes).toContain(novoCliente);
        expect(clientes.length).toBe(2);
      });
    });

    it('should update client in clientes$ when client is updated', () => {
      const clientes = [mockCliente];
      const clienteAtualizado = { ...mockCliente, nome: 'João Silva Atualizado' };

      service.setClientes(clientes);
      service.updateCliente(clienteAtualizado);

      service.clientes$.subscribe(clientes => {
        const cliente = clientes.find(c => c.id === clienteAtualizado.id);
        expect(cliente?.nome).toBe('João Silva Atualizado');
      });
    });

    it('should remove client from clientes$ when client is deleted', () => {
      const clientes = [mockCliente];
      const clienteId = 1;

      service.setClientes(clientes);
      service.removeCliente(clienteId);

      service.clientes$.subscribe(clientes => {
        expect(clientes.length).toBe(0);
        expect(clientes.find(c => c.id === clienteId)).toBeUndefined();
      });
    });
  });
});
