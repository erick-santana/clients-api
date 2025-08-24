import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.scss']
})
export class ClienteListComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  displayedColumns: string[] = ['id', 'nome', 'email', 'saldo', 'created_at', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private clienteService: ClienteService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClientes(): void {
    this.loadingService.show();
    
    this.clienteService.getClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.clientes = response.data;
            this.notificationService.showSuccess('Clientes carregados com sucesso');
          }
        },
        error: (error) => {
          this.notificationService.showError(error.message);
        },
        complete: () => {
          this.loadingService.hide();
        }
      });
  }

  onDelete(cliente: Cliente): void {
    if (confirm(`Tem certeza que deseja deletar o cliente ${cliente.nome}?`)) {
      this.loadingService.show();
      
      this.clienteService.deletarCliente(cliente.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess('Cliente deletado com sucesso');
              this.loadClientes(); // Recarregar lista
            }
          },
          error: (error) => {
            this.notificationService.showError(error.message);
          },
          complete: () => {
            this.loadingService.hide();
          }
        });
    }
  }

  onEdit(cliente: Cliente): void {
    // Implementar edição
    console.log('Editar cliente:', cliente);
  }

  onDeposit(cliente: Cliente): void {
    // Implementar depósito
    console.log('Depositar para cliente:', cliente);
  }

  onWithdraw(cliente: Cliente): void {
    // Implementar saque
    console.log('Sacar do cliente:', cliente);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
