import { Component, isDevMode } from '@angular/core';
import { ErrorService } from './error.service';

@Component({
  selector: 'app-error-test',
  templateUrl: './error-test.component.html',
})
export class ErrorTestComponent {
  constructor(public errorService: ErrorService) { }

  showMessage() {
    // Add a unique error message in dev mode to allow testing errors
    this.errorService.add('test');
    // add a second after a moment to test arrival of new messages
    setTimeout(() => {this.errorService.add('delayed test'); }, 5000);
  }

  isDevMode() {
    return isDevMode();
  }
}
