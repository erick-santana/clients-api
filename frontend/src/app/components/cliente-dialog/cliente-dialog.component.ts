import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-cliente-dialog',
  templateUrl: './cliente-dialog.component.html',
  styleUrls: ['./cliente-dialog.component.scss']
})
export class ClienteDialogComponent implements OnInit {
  clienteForm: FormGroup;
  isEditMode = false;

  // Validação customizada para email
  private emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Deixar o Validators.required lidar com campos vazios
    }
    
    // Regex mais específica e robusta para email
    // Aceita: usuario@dominio.com, usuario.nome@dominio.com.br, etc.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Validações adicionais
    const email = control.value.trim();
    
    // Verificar se não começa ou termina com ponto
    if (email.startsWith('.') || email.endsWith('.')) {
      return { invalidEmail: true };
    }
    
    // Verificar se não tem pontos consecutivos
    if (email.includes('..')) {
      return { invalidEmail: true };
    }
    
    // Verificar se o domínio tem pelo menos 2 caracteres
    const domainPart = email.split('@')[1];
    if (!domainPart || domainPart.length < 2) {
      return { invalidEmail: true };
    }
    
    // Verificar se a extensão tem pelo menos 2 caracteres
    const extension = domainPart.split('.')[1];
    if (!extension || extension.length < 2) {
      return { invalidEmail: true };
    }
    
    // Aplicar a regex principal
    if (!emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    
    return null;
  }

  // Getter para verificar se o formulário está válido
  get isFormValid(): boolean {
    return this.clienteForm.valid && 
           (this.clienteForm.get('nome')?.valid ?? false) && 
           (this.clienteForm.get('email')?.valid ?? false);
  }

  // Método para verificar se um campo está inválido e foi tocado
  isFieldInvalid(fieldName: string): boolean {
    const control = this.clienteForm.get(fieldName);
    return (control?.invalid ?? false) && (control?.touched ?? false);
  }

  // Método para obter mensagem de erro específica
  getErrorMessage(fieldName: string): string {
    const control = this.clienteForm.get(fieldName);
    
    if (!control || !control.errors) {
      return '';
    }
    
    if (fieldName === 'email') {
      if (control.hasError('required')) {
        return 'Email é obrigatório';
      }
      if (control.hasError('invalidEmail')) {
        return 'Digite um email válido (ex: usuario@dominio.com)';
      }
    }
    
    if (fieldName === 'nome') {
      if (control.hasError('required')) {
        return 'Nome é obrigatório';
      }
      if (control.hasError('minlength')) {
        return 'Nome deve ter pelo menos 2 caracteres';
      }
      if (control.hasError('maxlength')) {
        return 'Nome deve ter no máximo 100 caracteres';
      }
      if (control.hasError('pattern')) {
        return 'Nome deve conter apenas letras e espaços';
      }
    }
    
    return '';
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.fb.group({
      id: [null],
      nome: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]],
      email: ['', [
        Validators.required, 
        this.emailValidator.bind(this)
      ]]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.isEditMode = true;
      // Preencher apenas os campos que existem no formulário
      this.clienteForm.patchValue({
        id: this.data.id,
        nome: this.data.nome,
        email: this.data.email
      });
    }

    // Marcar campos como touched e dirty quando o usuário interage
    this.clienteForm.get('nome')?.valueChanges.subscribe(() => {
      const nomeControl = this.clienteForm.get('nome');
      nomeControl?.markAsTouched();
      nomeControl?.markAsDirty();
    });

    this.clienteForm.get('email')?.valueChanges.subscribe(() => {
      const emailControl = this.clienteForm.get('email');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();
    });
  }

  onSubmit(): void {
    // Verificar se o formulário é válido antes de prosseguir
    if (!this.isFormValid) {
      // Marcar todos os campos como touched para mostrar erros visuais
      Object.keys(this.clienteForm.controls).forEach(key => {
        const control = this.clienteForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.clienteForm.value;
    
    if (this.isEditMode) {
      // Em modo de edição, manter apenas os campos necessários
      const dadosParaEdicao = {
        nome: formValue.nome,
        email: formValue.email
      };
      this.dialogRef.close(dadosParaEdicao);
    } else {
      // Em modo de criação, remover o campo id
      delete formValue.id;
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
