import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoOperacoesComponent } from './historico-operacoes.component';

describe('HistoricoOperacoesComponent', () => {
  let component: HistoricoOperacoesComponent;
  let fixture: ComponentFixture<HistoricoOperacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoOperacoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoOperacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
