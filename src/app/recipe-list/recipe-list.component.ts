import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {GlobalConstants} from '../shared/GlobalConstants';
import {Product} from '../product';
import {ErrorService} from '../error/error.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {User} from '../shared/user.model';
import {BottleScanModel} from './shared/bottle-scan.model';
import * as moment from 'moment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApiService} from '../api/api.service';
import {HeaderComponent} from '../header/header.component';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  searchItem: any = '';
  searchItemSecond: any = '';

  recipes: Recipe[] = [];
  printData: Product = GlobalConstants.printDataInitial;

  recipeRectangles = [];
  recipeRectX = 26;
  recipeRectY = 230;
  recipeRectRx = 10;
  recipeRectRy = 10;
  recipeRectWidth = 156;
  recipeRectHeight = 470;

  firstNameList: any[];
  secondNameList: any[];
  nameListKey = 'name';
  productSizeStrengths = {};
  sizeRadioButtons = [];
  strengthRadioButtons = [];
  firstNameListHistory: string;
  secondNameListHistory: string;

  bottleSizeSelected = '';
  nicStrengthSelected = '';

  isLoadingNameListFirst: boolean;
  isLoadingNameListSecond: boolean;
  isLoadingLocation: boolean;

  spinnerName = GlobalConstants.spinnerName;

  user: User;
  closeResult: string;
  isShowAlert = false;

  @Input() public scanData = GlobalConstants.scanDataInitial;
  @ViewChild('bottleScanModal') bottleScanModal: ElementRef;
  @ViewChild('confirmModal') confirmModal: ElementRef;
  @ViewChild('autocompleteFirst') autocompleteFirst;

  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private errorService: ErrorService,
              private spinnerService: NgxSpinnerService,
              private modalService: NgbModal,
              private apiService: ApiService,
              private headerComponent: HeaderComponent) { }

  ngOnInit(): void {
    this.firstNameList = [GlobalConstants.nameListInitial];
    this.firstNameListHistory = '';
    this.secondNameListHistory = '';
    this.idbService.init(dbExisted => {
      if (!dbExisted) {
        this.saveRecipesToIdb();
        this.saveLocationsToIdb();
      } else {
        this.idbService.getLocationsObjectStoreCount().subscribe(
          count => {
            if (count === 0) {
              this.saveRecipesToIdb();
              this.saveLocationsToIdb();
            }
          }
        );
      }
    });
    setTimeout(() => {
      this.idbService.getAppPropertyFromIdb(GlobalConstants.appPropertyLocation).subscribe(
        location => {
          this.printData.storeName = location.name;
          this.printData.storeLocation = location.storeLocation;
        },
        () => {
        }
      );
    }, 500);
  }

  ngOnDestroy(): void {
  }

  selectEvent(item: { name: string; labelKey: string}) {
    this.headerComponent.isRefreshMoreThanOneDay().subscribe(
      flag => {
        if (flag) {
          this.headerComponent.refreshObjectStores();
        } else {
          this.selectEventFetchData(item);
        }
      },
      () => {
        this.selectEventFetchData(item);
      }
    );
  }


  selectEventFetchData(item: { name: string; labelKey: string}) {
    this.productSizeStrengths = {};
    this.spinnerService.show(this.spinnerName, {
      type: 'ball-spin-fade-rotating',
      size: 'default',
      bdColor: 'rgba(51, 51, 51, 0.2)',
      fullScreen: false
    });
    this.idbService.getProductSizeNicStrength(item.labelKey)
      .subscribe(
      (dataAll) => {
        for (const data of dataAll) {
          if (!this.productSizeStrengths.hasOwnProperty(data.bottleSize)) {
            this.productSizeStrengths[data.bottleSize] = [];
          }
          if (this.productSizeStrengths[data.bottleSize].indexOf(data.nicStrength.toString()) === -1) {
            this.productSizeStrengths[data.bottleSize].push(data.nicStrength.toString());
          }
          this.sizeRadioButtons = Object.keys(this.productSizeStrengths);
          this.bottleSizeSelected = this.sizeRadioButtons[0];
          this.strengthRadioButtons = this.productSizeStrengths[this.bottleSizeSelected].sort((a, b) => a - b);
          this.nicStrengthSelected = this.strengthRadioButtons[0];
        }
        this.getRecipeContents(item.labelKey, this.bottleSizeSelected, this.nicStrengthSelected);
        this.spinnerService.hide(this.spinnerName);
      },
      (error) => {
        this.errorService.add(error);
        this.spinnerService.hide(this.spinnerName);
      },
        () => {
        console.log('Job done');
        }
    );
  }

  onChangeSearch(search: string) {
    this.isLoadingNameListFirst = true;
    this.firstNameList = [];

    if (search.length > 0) {
      this.idbService.getProductNameList(search)
        .subscribe(
          nameList => {
            if ('error' in nameList) {
              this.isLoadingNameListFirst = false;
            } else {
              this.firstNameList.push({
                name: nameList.label,
                labelKey: nameList.labelKey
              });
              this.isLoadingNameListFirst = false;
            }
          },
          error => {
            this.errorService.add(error);
          });
    } else {
      this.isLoadingNameListFirst = false;
    }

  }

  onInputCleared() {
    this.searchItemSecond = '';
    this.resetSizeStrengthRecipes();
  }

  onFocused() {
    // Get productName or componentName List
  }

  selectEventSecond(item: any) {
    this.firstNameList = [];
    this.isLoadingNameListFirst = true;
    this.idbService.getProductNameListByComponent(item.name)
      .subscribe(
        nameList => {
          this.firstNameList.push({
            name: nameList.label,
            labelKey: nameList.labelKey
          });
          this.isLoadingNameListFirst = false;
          setTimeout(() => {
            this.autocompleteFirst.focus();
          }, 1000);
        });
  }

  onChangeSearchSecond(search: string) {
    this.isLoadingNameListSecond = true;
    this.searchItem = '';
    this.secondNameList = [];

    if (search.length > 0) {
      this.idbService.getComponentNameList(search)
        .subscribe(
          nameList => {
            if ('error' in nameList) {
              this.isLoadingNameListSecond = false;
            } else {
              if (this.notExistInArray(this.secondNameList, 'name', nameList.name)) {
                this.secondNameList.push({
                  id: nameList.id,
                  name: nameList.name
                });
              }
              this.isLoadingNameListSecond = false;
            }
          },
          error => {
            this.errorService.add(error);
          });
    } else {
      this.isLoadingNameListSecond = false;
    }
  }

  onFocusedSecond() {
    // Get productName List
  }

  onInputClearedSecond() {
    this.searchItem = '';
    this.resetSizeStrengthRecipes();
  }

  saveRecipesToIdb(): void {
    this.recipeListService.saveRecipesToIdb();
  }

  saveLocationsToIdb(): void {
    this.recipeListService.saveLocationsToIdb();
  }

  notExistInArray(arr: any, key: string, value: string) {
    const obj = arr.find(x => x[key] === value);
    for (const objKey in obj) {
      if (obj.hasOwnProperty(objKey)) {
        return false;
      }
    }
    return true;
  }

  changeSize(size: string) {
    this.strengthRadioButtons = this.productSizeStrengths[size].sort((a, b) => Number(a) - Number(b));
    this.nicStrengthSelected = this.strengthRadioButtons[0];

    this.getRecipeContents(this.searchItem.labelKey, size, this.nicStrengthSelected);
  }

  changeStrength(strength: string) {
    this.getRecipeContents(this.searchItem.labelKey, this.bottleSizeSelected, strength);
  }

  getRecipeContents(labelKey: string, size: string, strength: string) {
    this.recipeRectangles = [];
    let previousHeight = 0;
    const searchName = labelKey + ':' + size + ':' + strength;

    this.idbService.getRecipesFromIdb(GlobalConstants.indexProductKey, searchName).subscribe(
      data => {
        this.recipes = data;
        for (const item of data) {
          if (item.ingredients.toLowerCase().indexOf('bottle') >= 0 || item.percentage === 0) {
            continue;
          }
          this.recipeRectangles.push({
            x: this.recipeRectX,
            y: this.recipeRectY + previousHeight,
            rx: this.recipeRectRx,
            ry: this.recipeRectRy,
            height: Math.round(this.recipeRectHeight * item.percentage),
            width: this.recipeRectWidth,
            fill: item.ingredients.toLowerCase().indexOf('nicotine') >= 0
              ? GlobalConstants.recipeColorsNicotine : GlobalConstants.recipeColors[Number(item.color) - 1]
          });
          previousHeight = previousHeight + Math.round(this.recipeRectHeight * item.percentage);
        }
      },
      error => {
        this.errorService.add(error);
      }
    );

    this.idbService.getProductPrintData(searchName).subscribe(
      data => {
        this.printData.name = data.name;
        this.printData.sku = data.sku;
        this.printData.size = data.size;
        this.printData.strength = data.strength;
      },
      error => {
        this.errorService.add(error);
      }
    );

    this.idbService.getAppPropertyFromIdb(GlobalConstants.appPropertyLocation).subscribe(
      location => {
        this.printData.storeName = location.name;
        this.printData.storeLocation = location.storeLocation;
      },
      () => {
        window.location.reload();
      }
    );
  }

  resetSizeStrengthRecipes() {
    this.bottleSizeSelected = '';
    this.nicStrengthSelected = '';
    this.sizeRadioButtons = [];
    this.strengthRadioButtons = [];

    this.firstNameList = [GlobalConstants.nameListInitial];
    this.secondNameList = [];
    this.recipes = [];
    this.recipeRectangles = [];
    this.printData.name = '';
  }

  // Bottle Scan methods
  openBottleScan() {
    this.headerComponent.isRefreshMoreThanOneDay().subscribe(
      flag => {
        if (flag) {
          this.headerComponent.refreshObjectStores();
        } else {
          this.openBottleScanUser();
        }
      },
      () => {
        this.openBottleScanUser();
      }
    );
  }

  openBottleScanUser() {
    this.headerComponent.getAppProperty(GlobalConstants.appPropertyUser).subscribe(
      user => {
        this.user = user;
        this.openBottleScanLocation(this.bottleScanModal);
      },
      () => {
        this.errorService.add(GlobalConstants.appUserErrorMsg);
      }
    );
  }

  openBottleScanLocation(content) {
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
              this.openBottleScan();
              return false;
            }
            this.scanData.eventTimestamp = moment().format(GlobalConstants.timestampFormat);

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
        window.location.reload();
      }
    );
  }

  openBottleScanConfirmation(postData) {
    const modalRef = this.modalService.open(this.confirmModal, {ariaLabelledBy: 'modal-confirmation-title'});
    modalRef.result.then(
      () => {
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

  refreshIdbData() {
    this.headerComponent.refreshIdbData();
  }

}
