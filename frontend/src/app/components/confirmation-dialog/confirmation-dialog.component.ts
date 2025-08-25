import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationData } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  data: ConfirmationData;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ConfirmationData
  ) {
    this.data = {
      title: data.title || 'Confirmar',
      message: data.message || 'Tem certeza que deseja continuar?',
      confirmText: data.confirmText || 'Confirmar',
      cancelText: data.cancelText || 'Cancelar',
      type: data.type || 'info'
    };
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'danger':
        return 'delete_forever';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  getColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      case 'info':
      default:
        return 'primary';
    }
  }
}
