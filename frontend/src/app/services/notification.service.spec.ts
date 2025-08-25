import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', [
      'open',
      'dismiss'
    ]);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showSuccess', () => {
    it('should show success notification with title', () => {
      const message = 'Test message';
      const title = 'Test title';

      service.showSuccess(message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show success notification without title', () => {
      const message = 'Test message';

      service.showSuccess(message);

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Fechar',
        jasmine.any(Object)
      );
    });
  });

  describe('showError', () => {
    it('should show error notification with title', () => {
      const message = 'Test error';
      const title = 'Error title';

      service.showError(message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show error notification without title', () => {
      const message = 'Test error';

      service.showError(message);

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Fechar',
        jasmine.any(Object)
      );
    });
  });

  describe('showWarning', () => {
    it('should show warning notification with title', () => {
      const message = 'Test warning';
      const title = 'Warning title';

      service.showWarning(message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show warning notification without title', () => {
      const message = 'Test warning';

      service.showWarning(message);

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Fechar',
        jasmine.any(Object)
      );
    });
  });

  describe('showInfo', () => {
    it('should show info notification with title', () => {
      const message = 'Test info';
      const title = 'Info title';

      service.showInfo(message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show info notification without title', () => {
      const message = 'Test info';

      service.showInfo(message);

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Fechar',
        jasmine.any(Object)
      );
    });
  });

  describe('clear', () => {
    it('should dismiss snackbar', () => {
      service.clear();

      expect(snackBar.dismiss).toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('should show error notification', () => {
      const message = 'Test error';
      const title = 'Error title';

      service.show('error', message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show success notification', () => {
      const message = 'Test success';
      const title = 'Success title';

      service.show('success', message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show warning notification', () => {
      const message = 'Test warning';
      const title = 'Warning title';

      service.show('warning', message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });

    it('should show info notification', () => {
      const message = 'Test info';
      const title = 'Info title';

      service.show('info', message, title);

      expect(snackBar.open).toHaveBeenCalledWith(
        `${title}: ${message}`,
        'Fechar',
        jasmine.any(Object)
      );
    });
  });
});


