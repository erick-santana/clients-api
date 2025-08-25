import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Cliente } from '../../models/cliente.model';

interface OperacaoDialogData {
  cliente: Cliente;
  tipo: 'depositar' | 'sacar';
}

@Component({
  selector: 'app-operacao-dialog',
  templateUrl: './operacao-dialog.component.html',
  styleUrls: ['./operacao-dialog.component.scss']
})
export class OperacaoDialogComponent implements OnInit {
  operacaoForm: FormGroup;
  cliente: Cliente;
  tipo: 'depositar' | 'sacar';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OperacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OperacaoDialogData
  ) {
    this.cliente = data.cliente;
    this.tipo = data.tipo;
    
    this.operacaoForm = this.fb.group({
      valor: ['', [
        Validators.required, 
        Validators.min(0.01)
      ]]
    });
  }

  ngOnInit(): void {
    // Adicionar validação customizada em tempo real
    this.operacaoForm.get('valor')?.valueChanges.subscribe(value => {
      if (this.tipo === 'sacar' && value) {
        const valor = parseFloat(value);
        if (valor > this.cliente.saldo) {
          this.operacaoForm.get('valor')?.setErrors({ saldoInsuficiente: true });
        } else {
          // Remover erro de saldo insuficiente se existir
          const currentErrors = this.operacaoForm.get('valor')?.errors;
          if (currentErrors && currentErrors['saldoInsuficiente']) {
            delete currentErrors['saldoInsuficiente'];
            this.operacaoForm.get('valor')?.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
          }
        }
      }
    });
  }

  onSubmit(): void {
    if (this.operacaoForm.valid) {
      this.dialogRef.close(this.operacaoForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(): string {
    const control = this.operacaoForm.get('valor');
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('min')) {
      return 'Valor deve ser maior que 0';
    }
    if (control?.hasError('saldoInsuficiente')) {
      return `Saldo insuficiente. Saldo atual: ${this.formatCurrency(this.cliente.saldo)}`;
    }
    return '';
  }

  getTitle(): string {
    return this.tipo === 'depositar' ? 'Realizar Depósito' : 'Realizar Saque';
  }

  getIcon(): string {
    return this.tipo === 'depositar' ? 'add_circle' : 'remove_circle';
  }

  getButtonText(): string {
    return this.tipo === 'depositar' ? 'Depositar' : 'Sacar';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
