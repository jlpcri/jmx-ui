import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ErrorService } from './error.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


describe('ErrorService', () => {
  let service: ErrorService;
  let modalServiceSpy: NgbModal;
  const mockModalRef = {
    componentInstance: {
      errors: []
    },
    result: Promise.resolve()
  };

  beforeEach(() => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', {open: mockModalRef});

    TestBed.configureTestingModule({
      providers: [
        { provide: NgbModal, useValue: modalServiceSpy },
      ]
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can add errors and clear on close', fakeAsync(() => {
    service.add('test');
    // Expect modal to be opened and error to be added
    expect(modalServiceSpy.open).toHaveBeenCalledTimes(1);
    expect(service.errors).toEqual(['test']);

    service.add('test 2');
    // Add another error but don't open another modal
    expect(modalServiceSpy.open).not.toHaveBeenCalledTimes(2);
    expect(service.errors).toEqual(['test', 'test 2']);

    tick();
    // Result promise resolves as it will when close button is clicked
    expect(service.errors).toEqual([]);
    expect(service.modalRef).toBeNull();
  }));

  it('can clear errors on dismissal', fakeAsync(() => {
    mockModalRef.result = Promise.reject();
    service.add('test');
    expect(service.errors).toEqual(['test']);

    tick();
    // Result promise rejects as it will when modal is dismissed through other means
    expect(service.errors).toEqual([]);
    expect(service.modalRef).toBeNull();
  }));
});
