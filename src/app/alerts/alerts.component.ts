import { Component, isDevMode } from '@angular/core';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent {
  constructor(public alertService: AlertService) { }

  showMessage() {
    // Add a unique error message in dev mode to allow testing error alerts
    this.alertService.add('test' + this.alertService.alerts.length);
  }

  isDevMode() {
    return isDevMode();
  }
}
