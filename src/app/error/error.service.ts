import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ErrorComponent } from './error.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private modalService: NgbModal) {}
  errors: string[] = [];
  modalRef: NgbModalRef;

  add(text: string) {
    this.errors.push(text);

    // Use existing modal when available
    if (!this.modalRef) {
      this.modalRef = this.modalService.open(ErrorComponent);
      this.modalRef.componentInstance.errors = this.errors;
      this.modalRef.result.then(() => {
        // Clear errors and modal ref on close
        this.clear();
        this.modalRef = null;
      });
    }
  }

  clear() {
    this.errors = [];
  }
}
