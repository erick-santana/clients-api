import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) {
    this.configureToastr();
  }

  private configureToastr(): void {
    this.toastr.toastrConfig.timeOut = 5000;
    this.toastr.toastrConfig.positionClass = 'toast-top-right';
    this.toastr.toastrConfig.preventDuplicates = true;
    this.toastr.toastrConfig.closeButton = true;
    this.toastr.toastrConfig.progressBar = true;
  }

  showSuccess(message: string, title?: string): void {
    this.toastr.success(message, title || 'Sucesso');
  }

  showError(message: string, title?: string): void {
    this.toastr.error(message, title || 'Erro');
  }

  showWarning(message: string, title?: string): void {
    this.toastr.warning(message, title || 'Atenção');
  }

  showInfo(message: string, title?: string): void {
    this.toastr.info(message, title || 'Informação');
  }

  show(type: NotificationType, message: string, title?: string): void {
    switch (type) {
      case 'success':
        this.showSuccess(message, title);
        break;
      case 'error':
        this.showError(message, title);
        break;
      case 'warning':
        this.showWarning(message, title);
        break;
      case 'info':
        this.showInfo(message, title);
        break;
    }
  }

  clear(): void {
    this.toastr.clear();
  }
}
