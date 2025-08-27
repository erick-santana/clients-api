import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { environment } from '../../../environments/environment';
import { ClienteDialogComponent } from '../cliente-dialog/cliente-dialog.component';
import { OperacaoDialogComponent } from '../operacao-dialog/operacao-dialog.component';
import { FiltrosAvancados, FiltrosAvancadosComponent } from '../filtros-avancados/filtros-avancados.component';
import { HistoricoOperacoesComponent } from '../historico-operacoes/historico-operacoes.component';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush // Removido temporariamente
})
export class ClienteListComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  displayedColumns: string[] = ['nome', 'email', 'saldo', 'created_at', 'actions'];
  private destroy$ = new Subject<void>();

  // Paginação
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Busca
  searchControl = new FormControl('');
  searchTerm = '';

  // Filtros avançados
  filtrosAvancados: FiltrosAvancados = {};

  // Loading states
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Math para template
  Math = Math;

  constructor(
    private clienteService: ClienteService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClientes(page: number = 1): void {
    // Evitar múltiplas chamadas simultâneas
    if (this.isLoading) {
      return;
    }
    
    // Verificar se a página é válida
    if (page < 1) {
      page = 1;
    }
    
    // Atualizar estado de loading apenas para a lista
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    if (environment.enableDebug) {
      console.log(`[ClienteListComponent] Carregando clientes - página: ${page}, tamanho: ${this.pageSize}, busca: "${this.searchTerm}"`);
    }

    this.clienteService.getClientes(page, this.pageSize, this.searchTerm, this.filtrosAvancados)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (environment.enableDebug) {
            console.log('[ClienteListComponent] Resposta recebida:', response);
          }
          
          if (response.success && response.data) {
            // Atualizar apenas os dados da lista
            this.clientes = response.data;
            this.currentPage = response.pagination.page;
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.totalPages;
            this.hasError = false;
            
            // Mostrar notificação apenas quando não há resultados na busca
            if (page === 1 && this.clientes.length === 0 && this.searchTerm) {
              this.notificationService.showInfo('Nenhum cliente encontrado para a busca realizada');
            }
          } else {
            this.hasError = true;
            this.errorMessage = 'Resposta inválida do servidor';
            this.notificationService.showError(this.errorMessage);
          }
        },
        error: (error) => {
          if (environment.enableDebug) {
            console.error('[ClienteListComponent] Erro no subscribe:', error);
          }
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = error.message || 'Erro desconhecido';
          this.notificationService.showError(this.errorMessage);
        },
        complete: () => {
          this.isLoading = false;
          if (environment.enableDebug) {
            console.log('[ClienteListComponent] Carregamento de clientes concluído');
          }
        }
      });
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(600), // 600ms para reduzir chamadas
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        const newSearchTerm = searchTerm || '';
        
        // Só fazer a busca se o termo realmente mudou
        if (this.searchTerm !== newSearchTerm) {
          this.searchTerm = newSearchTerm;
          this.currentPage = 1; // Reset para primeira página
          
          // Carregar apenas os clientes, sem afetar outros elementos
          this.loadClientes(1);
        }
      });
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadClientes(page);
    }
  }

  onPageSizeChange(pageSize: number): void {
    if (environment.enableDebug) {
      console.log(`[ClienteListComponent] onPageSizeChange chamado - pageSize atual: ${this.pageSize}, novo: ${pageSize}`);
    }
    
    // Validar se o valor é válido
    if (!pageSize || pageSize <= 0 || !Number.isInteger(pageSize)) {
      return;
    }
    
    // Verificar se realmente mudou
    if (pageSize === this.pageSize) {
      return;
    }
    
    // Atualizar o pageSize
    this.pageSize = pageSize;
    this.currentPage = 1;
    
    if (environment.enableDebug) {
      console.log(`[ClienteListComponent] PageSize alterado para: ${pageSize}, recarregando clientes...`);
    }
    
    // Recarregar clientes com nova quantidade
    this.loadClientes(1);
  }

  clearSearch(): void {
    if (this.searchControl.value) {
      this.searchControl.setValue('', { emitEvent: false });
      this.searchTerm = '';
      this.currentPage = 1;
      
      // Carregar apenas os clientes
      this.loadClientes(1);
    }
  }

  onFiltrosChange(filtros: FiltrosAvancados): void {
    // Só recarregar se os filtros realmente mudaram
    const filtrosString = JSON.stringify(filtros);
    const currentFiltrosString = JSON.stringify(this.filtrosAvancados);
    
    if (filtrosString !== currentFiltrosString) {
      this.filtrosAvancados = { ...filtros }; // Criar uma cópia para evitar referência
      this.currentPage = 1;
      
      // Carregar apenas os clientes
      this.loadClientes(1);
    }
  }

  retryLoad(): void {
    if (!this.isLoading) {
      this.loadClientes(this.currentPage);
    }
  }

  onDelete(cliente: Cliente): void {
    this.confirmationService.confirmDelete(cliente.nome)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          // Não usar loadingService global para evitar carregamento da página inteira
          // this.loadingService.show();
          
          this.clienteService.deletarCliente(cliente.id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                if (response.success) {
                  this.notificationService.showSuccess('Cliente deletado com sucesso');
                  this.loadClientes(this.currentPage); // Recarregar lista na página atual
                }
              },
              error: (error) => {
                this.notificationService.showError(error.message);
                // this.loadingService.hide();
              },
              complete: () => {
                // this.loadingService.hide();
              }
            });
        }
      });
  }

  onEdit(cliente: Cliente): void {
    this.openClienteDialog(cliente);
  }

  onDeposit(cliente: Cliente): void {
    this.openOperacaoDialog(cliente, 'depositar');
  }

  onWithdraw(cliente: Cliente): void {
    this.openOperacaoDialog(cliente, 'sacar');
  }

  onHistorico(cliente: Cliente): void {
    this.abrirHistorico(cliente);
  }

  openCreateDialog(): void {
    this.openClienteDialog();
  }

  private openClienteDialog(cliente?: Cliente): void {
    const dialogRef = this.dialog.open(ClienteDialogComponent, {
      width: '500px',
      data: cliente || {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (cliente && cliente.id) {
          // Editar cliente existente
          // Não usar loadingService global para evitar carregamento da página inteira
          // this.loadingService.show();
          this.clienteService.atualizarCliente(cliente.id, result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                if (response.success) {
                  this.notificationService.showSuccess('Cliente atualizado com sucesso');
                  this.loadClientes(this.currentPage);
                }
              },
              error: (error) => {
                this.notificationService.showError(error.message);
                // this.loadingService.hide();
              },
              complete: () => {
                // this.loadingService.hide();
              }
            });
        } else {
          // Criar novo cliente
          // Não usar loadingService global para evitar carregamento da página inteira
          // this.loadingService.show();
          this.clienteService.criarCliente(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                if (response.success) {
                  this.notificationService.showSuccess('Cliente criado com sucesso');
                  this.loadClientes(1); // Voltar para primeira página
                }
              },
              error: (error) => {
                this.notificationService.showError(error.message);
                // this.loadingService.hide();
              },
              complete: () => {
                // this.loadingService.hide();
              }
            });
        }
      }
    });
  }

  // Método para abrir histórico de operações
  private abrirHistorico(cliente: Cliente): void {
    console.log('Abrir histórico para cliente:', cliente);
    
    const dialogRef = this.dialog.open(HistoricoOperacoesComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        clienteId: cliente.id,
        clienteNome: cliente.nome
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (environment.enableDebug) {
        console.log('Histórico fechado:', result);
      }
    });
  }

  private openOperacaoDialog(cliente: Cliente, tipo: 'depositar' | 'sacar'): void {
    const dialogRef = this.dialog.open(OperacaoDialogComponent, {
      width: '400px',
      data: { cliente, tipo },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.valor) {
        // Validação adicional para saque
        if (tipo === 'sacar' && result.valor > cliente.saldo) {
          this.notificationService.showError(`Saldo insuficiente. Saldo atual: ${this.formatCurrency(cliente.saldo)}`);
          return;
        }

        this.loadingService.show();
        
        const operacao = { valor: result.valor };
        const serviceCall = tipo === 'depositar' 
          ? this.clienteService.depositar(cliente.id!, operacao)
          : this.clienteService.sacar(cliente.id!, operacao);

        serviceCall.pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                const mensagem = tipo === 'depositar' 
                  ? `Depósito de ${this.formatCurrency(result.valor)} realizado com sucesso`
                  : `Saque de ${this.formatCurrency(result.valor)} realizado com sucesso`;
                this.notificationService.showSuccess(mensagem);
                this.loadClientes(this.currentPage);
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
    });
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
