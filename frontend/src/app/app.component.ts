import { Component, OnInit } from '@angular/core';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Meu Banco';
  loading$ = this.loadingService.loading$;

  constructor(
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Inicialização do componente
  }
}
