import {MessageService} from './message.service';
import {async, TestBed} from '@angular/core/testing';
import {ReplaySubject} from 'rxjs';
import {Message} from './message.model';


describe('MessageService', () => {
  let actions$: ReplaySubject<Message>;
  let service: MessageService;
  const text = 'new message';
  const detail = 'details of message';

  beforeEach(async (() => {
    actions$ = new ReplaySubject();
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('add error message', () => {
    const msg = new Message(Message.ERROR, text, detail);
    service.error(text, detail);

    actions$.subscribe((message) => {
      expect(message).toBe(msg);
    });
  });

  it('add warning message', () => {
    const msg = new Message(Message.WARNING, text, detail);
    service.warning(text, detail);

    actions$.subscribe((message) => {
      expect(message).toBe(msg);
    });
  });

  it('add info message', () => {
    const msg = new Message(Message.INFO, text, detail);
    service.info(text, detail);

    actions$.subscribe((message) => {
      expect(message).toBe(msg);
    });
  });
});
