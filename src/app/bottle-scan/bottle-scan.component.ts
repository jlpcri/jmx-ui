import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {GlobalConstants} from '../shared/GlobalConstants';
import {ApiService} from '../api/api.service';
import {BottleScanModel} from './bottle-scan.model';

@Component({
  selector: 'app-guide',
  templateUrl: './bottle-scan.component.html',
  styleUrls: ['./bottle-scan.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BottleScanComponent implements OnInit {
  closeResult: string;
  storeLocations: any[] = [];
  scanDataLocationName: any;
  isLoading: boolean;
  isShowAlert = false;

  @Input() public scanData = GlobalConstants.scanDataInitial;
  constructor(private modalService: NgbModal,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private apiService: ApiService) { }

  ngOnInit(): void {
  }

  openBottleScan(content) {
    this.recipeListService.saveLocationsToIdb();
    this.scanDataLocationName = '';
    let postData: BottleScanModel;
    const modalRef = this.modalService.open(content, {ariaLabelledBy: 'modal-bottleScan-title', size: 'lg'});
    modalRef.result.then(
      (locName) => {
        if (locName === '') {
          this.isShowAlert = true;
          this.openBottleScan(content);
          return false;
        }
        this.scanData.eventTimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');

        postData = {
          eventTimestamp: this.scanData.eventTimestamp,
          associateName: this.scanData.associateName,
          batchId: this.scanData.batchId,
          locationName: this.scanDataLocationName.name,
          productName: this.scanData.productName,
          productSku: this.scanData.productSku
        };
        this.apiService.post<BottleScanModel>('/bottleScanEvents', postData).subscribe(
          data => {
            console.log('Added bottle scan product: ', data);
            this.scanData.status = GlobalConstants.bottleScanSend;
            this.idbService.addBottleScan(this.scanData);
          },
          error => {
            console.log(error);
            this.scanData.status = GlobalConstants.bottleScanCommit;
            this.idbService.addBottleScan(this.scanData);
          }
        );

        this.idbService.getBottleScan(GlobalConstants.bottleScanCommit).subscribe(
          data => {
            postData = {
              eventTimestamp: data.eventTimestamp,
              associateName: data.associateName,
              batchId: data.batchId,
              locationName: data.locationName.name,
              productName: data.productName,
              productSku: data.productSku
            };
            this.apiService.post<BottleScanModel>('/bottleScanEvents', postData).subscribe(
              resp => {
                console.log('Added bottle scan product: ', resp.productName);
                this.idbService.updateBottleScan(data.id);
              },
              error => {
                console.log(error);
              }
            );
          }
        );
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        console.log(this.closeResult);
        this.isShowAlert = false;
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

  getStoreLocationsFromIdb(): void {
    if (this.storeLocations.length === 0) {
      this.isLoading = true;
      this.idbService.getLocationsFromIdb().subscribe(
        data => {
          this.storeLocations.push({
            name: data.name,
            storeLocation: data.storeLocation
          });
          this.isLoading = false;
        }
      );
    }
  }

  onChangeSearch() {
    this.getStoreLocationsFromIdb();
  }

}
