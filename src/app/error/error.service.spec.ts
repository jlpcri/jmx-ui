import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


describe('ErrorService', () => {
  let service: ErrorService;
  let modalServiceSpy: NgbModal;
  let mockModalRef = {
    componentInstance: {
      errors: []
    },
    result: {
      then: jasmine.createSpy()
    }
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

  it('can add and remove errors', () => {
    service.add('test');
    // Expect modal to be opened and error to be added
    expect(modalServiceSpy.open).toHaveBeenCalledTimes(1);
    expect(service.errors).toEqual(['test']);
    const closeCallback = mockModalRef.result.then.calls.mostRecent().args[0];

    service.add('test 2');
    // Add another error but don't open another modal
    expect(modalServiceSpy.open).not.toHaveBeenCalledTimes(2);
    expect(service.errors).toEqual(['test', 'test 2']);

    if (closeCallback instanceof Function) {
      closeCallback();
    }

    expect(service.errors).toEqual([]);
  });
});
