import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

export interface FiltrosAvancados {
  saldoMin?: number;
  saldoMax?: number;
  dataInicio?: string;
  dataFim?: string;
  ordenarPor?: 'nome' | 'email' | 'saldo' | 'created_at';
  ordenacao?: 'asc' | 'desc';
}

@Component({
  selector: 'app-filtros-avancados',
  templateUrl: './filtros-avancados.component.html',
  styleUrls: ['./filtros-avancados.component.scss']
})
export class FiltrosAvancadosComponent implements OnInit {
  @Output() filtrosChange = new EventEmitter<FiltrosAvancados>();
  
  filtrosForm: FormGroup;
  isExpanded = false;

  // Propriedades para controlar a exibição dos filtros
  mostrarFiltroSaldo = false;
  mostrarFiltroData = false;
  
  // Propriedades para validação de data
  dataError = '';
  mostrarDataError = false;
  
  // Propriedades para validação de saldo
  saldoError = '';
  mostrarSaldoError = false;

  ordenacaoOptions = [
    { value: 'nome', label: 'Nome' },
    { value: 'email', label: 'Email' },
    { value: 'saldo', label: 'Saldo' },
    { value: 'created_at', label: 'Data de Criação' }
  ];

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      // Checkboxes para controlar a exibição dos filtros
      filtrarPorSaldo: [false],
      filtrarPorData: [false],
      
      // Campos de filtro
      saldoMin: [''],
      saldoMax: [''],
      dataInicio: [''],
      dataFim: [''],
      ordenarPor: ['created_at'],
      ordenacao: ['desc']
    });

    // Observar mudanças nos checkboxes para mostrar/ocultar filtros
    this.filtrosForm.get('filtrarPorSaldo')?.valueChanges.subscribe(mostrar => {
      this.mostrarFiltroSaldo = mostrar;
      if (!mostrar) {
        this.filtrosForm.patchValue({
          saldoMin: '',
          saldoMax: ''
        });
      }
      // Remover aplicação automática - só aplicar quando o botão for clicado
    });

    this.filtrosForm.get('filtrarPorData')?.valueChanges.subscribe(mostrar => {
      this.mostrarFiltroData = mostrar;
      if (!mostrar) {
        this.filtrosForm.patchValue({
          dataInicio: '',
          dataFim: ''
        });
      }
      // Remover aplicação automática - só aplicar quando o botão for clicado
    });

    // Remover observadores automáticos dos campos de filtro
    // Os filtros só serão aplicados quando o botão "Filtrar" for clicado
  }

  ngOnInit(): void {
    // Não aplicar filtros automaticamente
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  aplicarFiltros(): void {
    // Limpar erros anteriores
    this.dataError = '';
    this.mostrarDataError = false;
    this.saldoError = '';
    this.mostrarSaldoError = false;
    
    const filtros = this.filtrosForm.value;
    
    // Validar saldos se o filtro de saldo estiver ativo
    if (filtros.filtrarPorSaldo) {
      const saldoMin = parseFloat(filtros.saldoMin);
      const saldoMax = parseFloat(filtros.saldoMax);
      
      // Verificar se há valores negativos
      if ((filtros.saldoMin && saldoMin < 0) || (filtros.saldoMax && saldoMax < 0)) {
        this.saldoError = 'Os valores de saldo não podem ser negativos';
        this.mostrarSaldoError = true;
        return; // Não aplicar filtros se houver erro
      }
      
      // Verificar se saldo máximo é menor que o mínimo (quando ambos estão preenchidos)
      if (filtros.saldoMin && filtros.saldoMax && saldoMax < saldoMin) {
        this.saldoError = 'O saldo máximo não pode ser menor que o saldo mínimo';
        this.mostrarSaldoError = true;
        return; // Não aplicar filtros se houver erro
      }
    }
    
    // Validar datas se o filtro de data estiver ativo
    if (filtros.filtrarPorData && filtros.dataInicio && filtros.dataFim) {
      const dataInicio = new Date(filtros.dataInicio);
      const dataFim = new Date(filtros.dataFim);
      
      if (dataFim < dataInicio) {
        this.dataError = 'A data fim não pode ser menor que a data início';
        this.mostrarDataError = true;
        return; // Não aplicar filtros se houver erro
      }
    }
    
    this.emitFiltros(filtros);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({
      filtrarPorSaldo: false,
      filtrarPorData: false,
      ordenarPor: 'created_at',
      ordenacao: 'desc'
    });
    
    // Limpar erros
    this.dataError = '';
    this.mostrarDataError = false;
    this.saldoError = '';
    this.mostrarSaldoError = false;
    
    // Emitir filtros vazios para limpar a lista
    this.filtrosChange.emit({});
  }

  onDateChange(event: any): void {
    // Prevenir propagação do evento se necessário
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    
    // Limpar erro de data quando o usuário alterar as datas
    this.dataError = '';
    this.mostrarDataError = false;
  }

  onSaldoChange(): void {
    // Limpar erro de saldo quando o usuário alterar os valores
    this.saldoError = '';
    this.mostrarSaldoError = false;
  }



  private emitFiltros(filtros: any): void {
    // Remover valores vazios e checkboxes de controle
    const filtrosLimpos: FiltrosAvancados = {};
    
    // Incluir filtros de saldo se o checkbox estiver marcado E os valores não estiverem vazios
    if (filtros.filtrarPorSaldo) {
      if (filtros.saldoMin !== null && filtros.saldoMin !== undefined && filtros.saldoMin !== '') {
        filtrosLimpos.saldoMin = parseFloat(filtros.saldoMin);
      }
      if (filtros.saldoMax !== null && filtros.saldoMax !== undefined && filtros.saldoMax !== '') {
        filtrosLimpos.saldoMax = parseFloat(filtros.saldoMax);
      }
    }

    // Incluir filtros de data se o checkbox estiver marcado E os valores não estiverem vazios
    if (filtros.filtrarPorData) {
      if (filtros.dataInicio) {
        // Converter a data para formato ISO string (YYYY-MM-DD)
        const dataInicio = new Date(filtros.dataInicio);
        if (!isNaN(dataInicio.getTime())) {
          filtrosLimpos.dataInicio = dataInicio.toISOString().split('T')[0];
        }
      }
      if (filtros.dataFim) {
        // Converter a data para formato ISO string (YYYY-MM-DD)
        const dataFim = new Date(filtros.dataFim);
        if (!isNaN(dataFim.getTime())) {
          filtrosLimpos.dataFim = dataFim.toISOString().split('T')[0];
        }
      }
    }

    // Sempre incluir ordenação
    if (filtros.ordenarPor) {
      filtrosLimpos.ordenarPor = filtros.ordenarPor;
    }
    if (filtros.ordenacao) {
      filtrosLimpos.ordenacao = filtros.ordenacao;
    }

    if (environment.enableDebug) {
      console.log('[FiltrosAvancadosComponent] Filtros emitidos:', filtrosLimpos);
    }

    this.filtrosChange.emit(filtrosLimpos);
  }
}
