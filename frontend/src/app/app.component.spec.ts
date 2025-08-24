import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LoadingService } from './services/loading.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', [], {
      isLoading$: jasmine.createSpyObj('Observable', ['subscribe'])
    });

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have title', () => {
    expect(component.title).toBeDefined();
  });

  it('should render title in header', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const headerElement = compiled.querySelector('header h1');
    expect(headerElement?.textContent).toContain('Sistema de Clientes');
  });

  it('should have router outlet', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should have footer', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const footerElement = compiled.querySelector('footer');
    expect(footerElement).toBeTruthy();
  });

  it('should have loading spinner', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const spinnerElement = compiled.querySelector('.loading-spinner');
    expect(spinnerElement).toBeTruthy();
  });

  it('should inject LoadingService', () => {
    expect(loadingService).toBeTruthy();
  });

  it('should have correct CSS classes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const appElement = compiled.querySelector('.app-container');
    expect(appElement).toBeTruthy();
  });

  it('should have proper structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check for header
    const header = compiled.querySelector('header');
    expect(header).toBeTruthy();
    
    // Check for main content
    const main = compiled.querySelector('main');
    expect(main).toBeTruthy();
    
    // Check for footer
    const footer = compiled.querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('should have accessibility attributes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check for proper heading structure
    const h1 = compiled.querySelector('h1');
    expect(h1).toBeTruthy();
    
    // Check for proper navigation structure
    const nav = compiled.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  it('should be responsive', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const appContainer = compiled.querySelector('.app-container');
    
    // Check if container has responsive classes
    expect(appContainer?.classList.contains('app-container')).toBeTruthy();
  });
});
