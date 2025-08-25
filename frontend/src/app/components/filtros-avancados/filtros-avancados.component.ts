import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    const filtros = this.filtrosForm.value;
    this.emitFiltros(filtros);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({
      filtrarPorSaldo: false,
      filtrarPorData: false,
      ordenarPor: 'created_at',
      ordenacao: 'desc'
    });
    // Emitir filtros vazios para limpar a lista
    this.filtrosChange.emit({});
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
      if (filtros.dataInicio && filtros.dataInicio.trim() !== '') {
        filtrosLimpos.dataInicio = filtros.dataInicio;
      }
      if (filtros.dataFim && filtros.dataFim.trim() !== '') {
        filtrosLimpos.dataFim = filtros.dataFim;
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
