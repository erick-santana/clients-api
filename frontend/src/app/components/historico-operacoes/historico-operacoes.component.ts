import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { OperacaoHistorico, PaginatedResponse } from '../../models/cliente.model';
import { LoadingService } from '../../services/loading.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-historico-operacoes',
  templateUrl: './historico-operacoes.component.html',
  styleUrls: ['./historico-operacoes.component.scss']
})
export class HistoricoOperacoesComponent implements OnInit, OnDestroy {
  clienteId!: string;
  clienteNome!: string;

  operacoes: OperacaoHistorico[] = [];
  pagination: any = null;
  currentPage = 1;
  pageSize = 20;
  loading$ = this.loadingService.loading$;
  
  private destroy$ = new Subject<void>();

  constructor(
    private clienteService: ClienteService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<HistoricoOperacoesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clienteId: string; clienteNome: string }
  ) {
    this.clienteId = data.clienteId;
    this.clienteNome = data.clienteNome;
  }

  ngOnInit(): void {
    this.carregarHistorico();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarHistorico(page: number = 1): void {
    this.currentPage = page;
    this.loadingService.show();

    this.clienteService.getHistoricoOperacoes(this.clienteId, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<OperacaoHistorico>) => {
          this.operacoes = response.data;
          this.pagination = response.pagination;
          this.loadingService.hide();
        },
        error: (error) => {
          this.loadingService.hide();
          this.notificationService.showError('Erro ao carregar histórico de operações');
          console.error('Erro ao carregar histórico:', error);
        }
      });
  }

  onPageChange(page: number): void {
    this.carregarHistorico(page);
  }

  getTipoOperacao(tipo: string): string {
    return tipo === 'deposito' ? 'Depósito' : 'Saque';
  }

  getStatusOperacao(status: string): string {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'pendente': return 'Pendente';
      case 'falhou': return 'Falhou';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'concluida': return 'status-success';
      case 'pendente': return 'status-warning';
      case 'falhou': return 'status-error';
      default: return '';
    }
  }

  getTipoClass(tipo: string): string {
    return tipo === 'deposito' ? 'tipo-deposito' : 'tipo-saque';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
