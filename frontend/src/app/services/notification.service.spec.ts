import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
      'info',
      'clear'
    ]);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });
    service = TestBed.inject(NotificationService);
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should call toastr success with message', () => {
      const message = 'Operação realizada com sucesso';
      const title = 'Sucesso';

      service.success(message, title);

      expect(toastrService.success).toHaveBeenCalledWith(message, title);
    });

    it('should call toastr success with default title', () => {
      const message = 'Operação realizada com sucesso';

      service.success(message);

      expect(toastrService.success).toHaveBeenCalledWith(message, 'Sucesso');
    });
  });

  describe('error', () => {
    it('should call toastr error with message', () => {
      const message = 'Erro ao realizar operação';
      const title = 'Erro';

      service.error(message, title);

      expect(toastrService.error).toHaveBeenCalledWith(message, title);
    });

    it('should call toastr error with default title', () => {
      const message = 'Erro ao realizar operação';

      service.error(message);

      expect(toastrService.error).toHaveBeenCalledWith(message, 'Erro');
    });
  });

  describe('warning', () => {
    it('should call toastr warning with message', () => {
      const message = 'Atenção: dados incompletos';
      const title = 'Atenção';

      service.warning(message, title);

      expect(toastrService.warning).toHaveBeenCalledWith(message, title);
    });

    it('should call toastr warning with default title', () => {
      const message = 'Atenção: dados incompletos';

      service.warning(message);

      expect(toastrService.warning).toHaveBeenCalledWith(message, 'Atenção');
    });
  });

  describe('info', () => {
    it('should call toastr info with message', () => {
      const message = 'Informação importante';
      const title = 'Informação';

      service.info(message, title);

      expect(toastrService.info).toHaveBeenCalledWith(message, title);
    });

    it('should call toastr info with default title', () => {
      const message = 'Informação importante';

      service.info(message);

      expect(toastrService.info).toHaveBeenCalledWith(message, 'Informação');
    });
  });

  describe('clear', () => {
    it('should call toastr clear', () => {
      service.clear();

      expect(toastrService.clear).toHaveBeenCalled();
    });
  });

  describe('showApiError', () => {
    it('should show error message from API response', () => {
      const apiError = {
        message: 'Erro do servidor',
        status: 500
      };

      service.showApiError(apiError);

      expect(toastrService.error).toHaveBeenCalledWith(
        'Erro do servidor',
        'Erro'
      );
    });

    it('should show default error message when no message provided', () => {
      const apiError = {
        status: 500
      };

      service.showApiError(apiError);

      expect(toastrService.error).toHaveBeenCalledWith(
        'Erro interno do servidor',
        'Erro'
      );
    });

    it('should show network error message for network errors', () => {
      const apiError = {
        status: 0,
        message: 'Network Error'
      };

      service.showApiError(apiError);

      expect(toastrService.error).toHaveBeenCalledWith(
        'Erro de conexão. Verifique sua internet.',
        'Erro'
      );
    });

    it('should show specific error messages for different status codes', () => {
      const error401 = { status: 401, message: 'Unauthorized' };
      const error403 = { status: 403, message: 'Forbidden' };
      const error404 = { status: 404, message: 'Not Found' };
      const error422 = { status: 422, message: 'Validation Error' };

      service.showApiError(error401);
      expect(toastrService.error).toHaveBeenCalledWith(
        'Não autorizado. Faça login novamente.',
        'Erro'
      );

      service.showApiError(error403);
      expect(toastrService.error).toHaveBeenCalledWith(
        'Acesso negado. Você não tem permissão.',
        'Erro'
      );

      service.showApiError(error404);
      expect(toastrService.error).toHaveBeenCalledWith(
        'Recurso não encontrado.',
        'Erro'
      );

      service.showApiError(error422);
      expect(toastrService.error).toHaveBeenCalledWith(
        'Dados inválidos. Verifique as informações.',
        'Erro'
      );
    });
  });

  describe('showSuccess', () => {
    it('should show success message for different operations', () => {
      service.showSuccess('create');
      expect(toastrService.success).toHaveBeenCalledWith(
        'Cliente criado com sucesso!',
        'Sucesso'
      );

      service.showSuccess('update');
      expect(toastrService.success).toHaveBeenCalledWith(
        'Cliente atualizado com sucesso!',
        'Sucesso'
      );

      service.showSuccess('delete');
      expect(toastrService.success).toHaveBeenCalledWith(
        'Cliente removido com sucesso!',
        'Sucesso'
      );

      service.showSuccess('deposit');
      expect(toastrService.success).toHaveBeenCalledWith(
        'Depósito realizado com sucesso!',
        'Sucesso'
      );

      service.showSuccess('withdraw');
      expect(toastrService.success).toHaveBeenCalledWith(
        'Saque realizado com sucesso!',
        'Sucesso'
      );
    });

    it('should show generic success message for unknown operation', () => {
      service.showSuccess('unknown');

      expect(toastrService.success).toHaveBeenCalledWith(
        'Operação realizada com sucesso!',
        'Sucesso'
      );
    });
  });
});
