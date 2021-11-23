import {IndexedDatabaseService} from './indexed-database.service';
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MessageService} from './message.service';
import {any} from 'codelyzer/util/function';

describe('IndexedDatabaseService', () => {
  let service: IndexedDatabaseService;
  let msgServiceSpy: MessageService;

  beforeEach(() => {
    const msgSpy = jasmine.createSpyObj('MessageService', ['error', 'warn', 'info']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: MessageService, userValue: msgSpy }
      ]
    });
    service = TestBed.inject(IndexedDatabaseService);
    msgServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('idbService init', () => {
    spyOn(service, 'init').and.callFake((callback) => {
      expect(typeof callback).toBe('function');
      callback(true);
    });

    service.init(any);
  });

});
