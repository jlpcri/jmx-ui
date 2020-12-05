import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {GlobalConstants} from '../shared/GlobalConstants';
import {ApiService} from '../api/api.service';
import {BottleScanModel} from './bottle-scan.model';
import {HeaderComponent} from '../header/header.component';
import {ErrorService} from '../error/error.service';
import {User} from '../shared/user.model';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-guide',
  templateUrl: './bottle-scan.component.html',
  styleUrls: ['./bottle-scan.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BottleScanComponent implements OnInit {
  user: User;
  closeResult: string;
  isShowAlert = false;

  @ViewChild('confirmModal') confirmModal: ElementRef;

  @Input() public scanData = GlobalConstants.scanDataInitial;
  constructor(private authService: AuthService,
              private modalService: NgbModal,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private apiService: ApiService,
              private headerComponent: HeaderComponent,
              private errorService: ErrorService) { }

  ngOnInit(): void {
    this.authService.authorized().subscribe(
      user => { this.user = user; }
    );
  }

  openBottleScan(content) {
    this.idbService.getAppPropertyFromIdb(GlobalConstants.appPropertyLocation).subscribe(
      location => {
        this.scanData.locationName = location.name;
        this.scanData.associateName = this.user.name;

        let postData: BottleScanModel;
        const modalRef = this.modalService.open(content, {ariaLabelledBy: 'modal-bottleScan-title', size: 'lg'});
        modalRef.result.then(
          (inputData) => {
            if (!this.isScanDataValid(inputData)) {
              this.isShowAlert = true;
              this.openBottleScan(content);
              return false;
            }
            this.scanData.eventTimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');

            postData = {
              eventTimestamp: this.scanData.eventTimestamp,
              associateName: this.scanData.associateName,
              batchId: this.scanData.batchId,
              locationName: this.scanData.locationName,
              productName: this.scanData.productName,
              productSku: this.scanData.productSku
            };
            this.openBottleScanConfirmation(postData);
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.headerComponent.getDismissReason(reason)}`;
            console.log(this.closeResult);
            this.isShowAlert = false;
          });
      },
      error => {
        console.log(error);
        this.errorService.add(GlobalConstants.appLocationErrorMsg);
      }
    );
  }

  openBottleScanConfirmation(postData) {
    const modalRef = this.modalService.open(this.confirmModal, {ariaLabelledBy: 'modal-confirmation-title'});
    modalRef.result.then(
      (confirm) => {
        this.postBottleScanData(postData);
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.headerComponent.getDismissReason(reason)}`;
        console.log(this.closeResult);
      }
    );
  }

  postBottleScanData(postData: BottleScanModel) {
    this.apiService.post<BottleScanModel>('/bottleScanEvents', postData).subscribe(
      data => {
        console.log('Added bottle scan product: ', data.productName);
        this.scanData.status = GlobalConstants.bottleScanSend;
        this.idbService.addBottleScan(this.scanData);
      },
      error => {
        this.errorService.add(error);
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
            this.errorService.add(error);
          }
        );
      }
    );
  }

  isScanDataValid(data) {
    let flag = true;
    for (const field of GlobalConstants.scanDataCheckFields) {
      if (data[field] === '') {
        flag = false;
        break;
      }
    }

    return flag;
  }

}
