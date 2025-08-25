import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  private getSnackBarConfig(type: NotificationType): MatSnackBarConfig {
    const config: MatSnackBarConfig = {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    };
    return config;
  }

  showSuccess(message: string, title?: string): void {
    const fullMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(fullMessage, 'Fechar', this.getSnackBarConfig('success'));
  }

  showError(message: string, title?: string): void {
    const fullMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(fullMessage, 'Fechar', this.getSnackBarConfig('error'));
  }

  showWarning(message: string, title?: string): void {
    const fullMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(fullMessage, 'Fechar', this.getSnackBarConfig('warning'));
  }

  showInfo(message: string, title?: string): void {
    const fullMessage = title ? `${title}: ${message}` : message;
    this.snackBar.open(fullMessage, 'Fechar', this.getSnackBarConfig('info'));
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
    this.snackBar.dismiss();
  }
}
