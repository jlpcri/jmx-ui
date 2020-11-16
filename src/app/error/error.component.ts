import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
})
export class ErrorComponent {
  constructor(public activeModal: NgbActiveModal) { }
  errors: string[];
  close() {
    this.activeModal.close();
  }
}
