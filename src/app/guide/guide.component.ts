import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GuideComponent implements OnInit {
  closeResult: string;

  @Input() public scanData = {
    productName: 'Purple Worm',
    productSku: '790080',
    productBar: '7 746307 900805',
    productLot: '4158',
    employeeName: 'John Doe',
    currentDate: ''
  };
  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openBottleScan(content) {
    const modalRef = this.modalService.open(content, {ariaLabelledBy: 'modal-bottleScan-title', size: 'lg'});
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        console.log(this.closeResult);
        console.log(this.scanData);
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        console.log(this.closeResult);
      });
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
