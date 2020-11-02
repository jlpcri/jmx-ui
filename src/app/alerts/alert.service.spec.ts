import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can add and remove errors', () => {
    service.add('test');
    expect(service.alerts).toEqual(['test']);
    service.remove('test');
    expect(service.alerts).toEqual([]);
  });
});
