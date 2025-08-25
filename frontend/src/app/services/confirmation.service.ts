import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private dialog: MatDialog) { }

  confirm(data: ConfirmationData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data,
      disableClose: true
    });

    return dialogRef.afterClosed();
  }

  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });
  }

  confirmWithdraw(clienteName: string, valor: number): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar Saque',
      message: `Tem certeza que deseja sacar R$ ${valor.toFixed(2)} da conta de "${clienteName}"?`,
      confirmText: 'Sacar',
      cancelText: 'Cancelar',
      type: 'warning'
    });
  }
}
