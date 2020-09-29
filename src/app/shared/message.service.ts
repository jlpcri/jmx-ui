import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Message } from './message.model';

@Injectable({
  providedIn: 'root'
})

export class MessageService {

  public messageSubject: ReplaySubject<Message> = new ReplaySubject<Message>();

  constructor() {
    console.log('message service ready');
  }

  error(text: string, detail: string) {
    this.messageSubject.next(new Message(Message.ERROR, text, detail));
  }

  warning(text: string, detail: string) {
    this.messageSubject.next(new Message(Message.WARNING, text, detail));
  }

  info(text: string, detail: string) {
    this.messageSubject.next(new Message(Message.INFO, text, detail));
  }

}
