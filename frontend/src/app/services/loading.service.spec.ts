import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial loading state as false', () => {
    service.isLoading$.subscribe(isLoading => {
      expect(isLoading).toBe(false);
    });
  });

  describe('show', () => {
    it('should set loading to true', () => {
      service.show();

      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(true);
      });
    });

    it('should emit true when show is called', (done) => {
      service.isLoading$.subscribe(isLoading => {
        if (isLoading) {
          expect(isLoading).toBe(true);
          done();
        }
      });

      service.show();
    });
  });

  describe('hide', () => {
    it('should set loading to false', () => {
      service.show();
      service.hide();

      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(false);
      });
    });

    it('should emit false when hide is called', (done) => {
      service.show();
      
      service.isLoading$.subscribe(isLoading => {
        if (!isLoading) {
          expect(isLoading).toBe(false);
          done();
        }
      });

      service.hide();
    });
  });

  describe('toggle', () => {
    it('should toggle loading state from false to true', () => {
      service.toggle();

      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(true);
      });
    });

    it('should toggle loading state from true to false', () => {
      service.show();
      service.toggle();

      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(false);
      });
    });

    it('should emit correct values when toggle is called multiple times', (done) => {
      let callCount = 0;
      const expectedValues = [true, false, true];

      service.isLoading$.subscribe(isLoading => {
        if (callCount < expectedValues.length) {
          expect(isLoading).toBe(expectedValues[callCount]);
          callCount++;
          
          if (callCount === expectedValues.length) {
            done();
          }
        }
      });

      service.toggle(); // true
      service.toggle(); // false
      service.toggle(); // true
    });
  });

  describe('withLoading', () => {
    it('should show loading before operation and hide after', (done) => {
      let loadingStates: boolean[] = [];
      
      service.isLoading$.subscribe(isLoading => {
        loadingStates.push(isLoading);
      });

      const mockOperation = () => new Promise(resolve => setTimeout(resolve, 100));

      service.withLoading(mockOperation()).then(() => {
        expect(loadingStates).toContain(true);
        expect(loadingStates).toContain(false);
        expect(loadingStates[loadingStates.length - 1]).toBe(false);
        done();
      });
    });

    it('should hide loading even if operation throws error', (done) => {
      let loadingStates: boolean[] = [];
      
      service.isLoading$.subscribe(isLoading => {
        loadingStates.push(isLoading);
      });

      const mockOperation = () => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test error')), 100)
      );

      service.withLoading(mockOperation()).catch(() => {
        expect(loadingStates).toContain(true);
        expect(loadingStates).toContain(false);
        expect(loadingStates[loadingStates.length - 1]).toBe(false);
        done();
      });
    });

    it('should return the result of the operation', (done) => {
      const expectedResult = { data: 'test' };
      const mockOperation = () => Promise.resolve(expectedResult);

      service.withLoading(mockOperation()).then(result => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });

    it('should handle synchronous operations', (done) => {
      let loadingStates: boolean[] = [];
      
      service.isLoading$.subscribe(isLoading => {
        loadingStates.push(isLoading);
      });

      const mockOperation = () => Promise.resolve('sync result');

      service.withLoading(mockOperation()).then(() => {
        expect(loadingStates).toContain(true);
        expect(loadingStates).toContain(false);
        done();
      });
    });
  });

  describe('BehaviorSubject functionality', () => {
    it('should maintain state across multiple subscribers', () => {
      let subscriber1Value: boolean | undefined;
      let subscriber2Value: boolean | undefined;

      service.isLoading$.subscribe(value => {
        subscriber1Value = value;
      });

      service.isLoading$.subscribe(value => {
        subscriber2Value = value;
      });

      service.show();

      expect(subscriber1Value).toBe(true);
      expect(subscriber2Value).toBe(true);
    });

    it('should emit current value to new subscribers', () => {
      service.show();

      let newSubscriberValue: boolean | undefined;
      service.isLoading$.subscribe(value => {
        newSubscriberValue = value;
      });

      expect(newSubscriberValue).toBe(true);
    });
  });
});
