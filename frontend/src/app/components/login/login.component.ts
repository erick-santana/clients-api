import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Se já estiver autenticado, redirecionar para a lista de clientes
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/clientes']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loadingService.show();
      
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: (result) => {
          this.loadingService.hide();
          
          if (result.success) {
            this.notificationService.showSuccess(result.message);
            this.router.navigate(['/clientes']);
          } else {
            this.notificationService.showError(result.message);
          }
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('Erro no login:', error);
          this.notificationService.showError('Erro ao fazer login. Tente novamente.');
        }
      });
    } else {
      this.notificationService.showError('Por favor, preencha todos os campos corretamente.');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
