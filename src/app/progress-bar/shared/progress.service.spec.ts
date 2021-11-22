import { TestBed } from '@angular/core/testing';

import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set progressValue', () => {
    service.progressValue = 12;
    const percent = 33;
    service.progressPercent = percent;

    expect(service.progressValue).toEqual(percent);

  });
});
