import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alerts: string[] = [];

  add(text: string) {
    this.alerts.push(text);
  }

  remove(error) {
    this.alerts = this.alerts.filter(e => e !== error);
  }
}
