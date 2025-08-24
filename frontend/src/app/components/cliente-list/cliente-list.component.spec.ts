import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ClienteListComponent } from './cliente-list.component';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { Cliente } from '../../models/cliente.model';

describe('ClienteListComponent', () => {
  let component: ClienteListComponent;
  let fixture: ComponentFixture<ClienteListComponent>;
  let clienteService: jasmine.SpyObj<ClienteService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockCliente: Cliente = {
    id: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    saldo: 1000.00,
    created_at: '2025-08-24T10:00:00Z',
    updated_at: '2025-08-24T10:00:00Z'
  };

  const mockClientes = [mockCliente];

  beforeEach(async () => {
    const clienteServiceSpy = jasmine.createSpyObj('ClienteService', [
      'getClientes',
      'deletarCliente'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError'
    ]);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', [
      'show',
      'hide'
    ]);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ClienteListComponent],
      imports: [NoopAnimationsModule],
      providers: [
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteListComponent);
    component = fixture.componentInstance;
    clienteService = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty clientes array', () => {
    expect(component.clientes).toEqual([]);
  });

  it('should have correct displayed columns', () => {
    const expectedColumns = ['id', 'nome', 'email', 'saldo', 'created_at', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  describe('ngOnInit', () => {
    it('should call loadClientes on init', () => {
      spyOn(component, 'loadClientes');
      
      component.ngOnInit();
      
      expect(component.loadClientes).toHaveBeenCalled();
    });
  });

  describe('loadClientes', () => {
    it('should load clientes successfully', () => {
      const mockResponse = {
        success: true,
        data: mockClientes,
        message: 'Clientes carregados com sucesso'
      };

      clienteService.getClientes.and.returnValue(of(mockResponse));

      component.loadClientes();

      expect(loadingService.show).toHaveBeenCalled();
      expect(clienteService.getClientes).toHaveBeenCalled();
      expect(component.clientes).toEqual(mockClientes);
      expect(notificationService.showSuccess).toHaveBeenCalledWith('Clientes carregados com sucesso');
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should handle error when loading clientes fails', () => {
      const error = { message: 'Erro ao carregar clientes' };
      clienteService.getClientes.and.returnValue(throwError(() => error));

      component.loadClientes();

      expect(loadingService.show).toHaveBeenCalled();
      expect(clienteService.getClientes).toHaveBeenCalled();
      expect(notificationService.showError).toHaveBeenCalledWith(error.message);
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should not update clientes when API response is not successful', () => {
      const mockResponse = {
        success: false,
        data: mockClientes,
        message: 'Erro na operação'
      };

      clienteService.getClientes.and.returnValue(of(mockResponse));

      component.loadClientes();

      expect(component.clientes).toEqual([]);
      expect(notificationService.showSuccess).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should delete cliente successfully', () => {
      const mockResponse = {
        success: true,
        data: null,
        message: 'Cliente deletado com sucesso'
      };

      clienteService.deletarCliente.and.returnValue(of(mockResponse));
      spyOn(component, 'loadClientes');

      component.onDelete(mockCliente);

      expect(clienteService.deletarCliente).toHaveBeenCalledWith(mockCliente.id);
      expect(loadingService.show).toHaveBeenCalled();
      expect(notificationService.showSuccess).toHaveBeenCalledWith('Cliente deletado com sucesso');
      expect(component.loadClientes).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should handle error when deleting cliente fails', () => {
      const error = { message: 'Erro ao deletar cliente' };
      clienteService.deletarCliente.and.returnValue(throwError(() => error));

      component.onDelete(mockCliente);

      expect(clienteService.deletarCliente).toHaveBeenCalledWith(mockCliente.id);
      expect(loadingService.show).toHaveBeenCalled();
      expect(notificationService.showError).toHaveBeenCalledWith(error.message);
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should not delete when user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.onDelete(mockCliente);

      expect(clienteService.deletarCliente).not.toHaveBeenCalled();
      expect(loadingService.show).not.toHaveBeenCalled();
    });
  });

  describe('onEdit', () => {
    it('should log edit action', () => {
      spyOn(console, 'log');

      component.onEdit(mockCliente);

      expect(console.log).toHaveBeenCalledWith('Editar cliente:', mockCliente);
    });
  });

  describe('onDeposit', () => {
    it('should log deposit action', () => {
      spyOn(console, 'log');

      component.onDeposit(mockCliente);

      expect(console.log).toHaveBeenCalledWith('Depositar para cliente:', mockCliente);
    });
  });

  describe('onWithdraw', () => {
    it('should log withdraw action', () => {
      spyOn(console, 'log');

      component.onWithdraw(mockCliente);

      expect(console.log).toHaveBeenCalledWith('Sacar do cliente:', mockCliente);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = component.formatCurrency(1234.56);
      expect(result).toContain('R$');
      expect(result).toContain('1.234,56');
    });

    it('should handle zero value', () => {
      const result = component.formatCurrency(0);
      expect(result).toContain('R$');
      expect(result).toContain('0,00');
    });

    it('should handle negative value', () => {
      const result = component.formatCurrency(-500.75);
      expect(result).toContain('R$');
      expect(result).toContain('-500,75');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = component.formatDate('2025-08-24T10:00:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle different date formats', () => {
      const result1 = component.formatDate('2025-12-25');
      const result2 = component.formatDate('2025-01-01T00:00:00.000Z');
      
      expect(result1).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result2).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
