import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {GlobalConstants} from '../shared/GlobalConstants';
import {Product} from '../product';
import {ErrorService} from '../error/error.service';

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
  isPrintLocationEmpty = false;

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

  @ViewChild('autocompleteFirst') autocompleteFirst;

  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private errorService: ErrorService) { }

  ngOnInit(): void {
    this.firstNameList = [GlobalConstants.nameListInitial];
    this.firstNameListHistory = '';
    this.secondNameListHistory = '';
    this.idbService.init(dbExisted => {
      if (!dbExisted) {
        this.saveRecipesToIdb();
      }
    });
    setTimeout( () => {
      this.idbService.getAppPropertyFromIdb(GlobalConstants.appPropertyLocation).subscribe(
        location => {
          this.printData.storeName = location.name;
          this.printData.storeLocation = location.storeLocation;
        },
        error => {
          this.isPrintLocationEmpty = true;
        }
      );
    }, 1000);
  }

  ngOnDestroy(): void {
  }

  selectEvent(item: { name: string; labelKey: string}) {
    this.productSizeStrengths = {};
    this.idbService.getProductSizeNicStrength(item.labelKey).subscribe(
      (data) => {
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
        this.getRecipeContents(item.labelKey, this.bottleSizeSelected, this.nicStrengthSelected);
      },
      (error) => {
        this.errorService.add(error);
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
    this.firstNameList = [];
    this.secondNameList = [];
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
    this.firstNameList = [];
    this.secondNameList = [];
    this.searchItem = '';
    this.resetSizeStrengthRecipes();
  }

  saveRecipesToIdb(): void {
    this.recipeListService.saveRecipesToIdb();
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
    const searchName = labelKey + ':' + size + ':' + strength;

    this.recipes = this.idbService.getRecipesFromIdb(GlobalConstants.indexProductKey, searchName);

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
  }

  resetSizeStrengthRecipes() {
    this.bottleSizeSelected = '';
    this.nicStrengthSelected = '';
    this.sizeRadioButtons = [];
    this.strengthRadioButtons = [];

    this.recipes = [];
    this.printData.name = '';
  }

}
