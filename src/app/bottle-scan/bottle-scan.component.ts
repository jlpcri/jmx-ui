import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';

@Component({
  selector: 'app-guide',
  templateUrl: './bottle-scan.component.html',
  styleUrls: ['./bottle-scan.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BottleScanComponent implements OnInit {
  closeResult: string;
  storeLocations: any[] = [];

  @Input() public scanData = {
    eventTimestamp: '',
    associateName: 'John Doe',
    batchId: '4158',
    productSku: '790080',
    productName: 'Purple Worm',
    locationName: '',
    productBarcode: '7 746307 900805',
  };
  constructor(private modalService: NgbModal,
              private recipeListService: RecipeListService) { }

  ngOnInit(): void {
    this.getStoreLocations();
  }

  openBottleScan(content) {
    const modalRef = this.modalService.open(content, {ariaLabelledBy: 'modal-bottleScan-title', size: 'lg'});
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.scanData.eventTimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
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

  getStoreLocations(): void {
    this.recipeListService.retrieveLocations().subscribe(
      data => {
        for (const item of data) {
          this.storeLocations.push({
            name: item.name,
            storeLocation: item.storeLocation
          });
        }
      }
    );
  }

}
