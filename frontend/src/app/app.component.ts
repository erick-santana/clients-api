import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Meu Banco';
  loading$ = this.loadingService.loading$;
  isAuthenticated$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.user$;

  constructor(
    private loadingService: LoadingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicialização do componente
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
