import {Component, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';

import {Recipe} from '../recipe';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {GlobalConstants} from '../shared/GlobalConstants';
import {Product} from '../product';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  searchOptions = [
    {id: 1, value: 'Recipe'},
    {id: 2, value: 'Ingredients'}
  ];

  searchOptionSelected: string;
  searchItem: any = '';
  searchItemSecond: any = '';

  recipes: Recipe[] = [];
  printData: Product = {
    name: '', size: '', sku: '', strength: '',
    storeName: 'Alohma Bellevue',
    storeLocation: '11527 S 36th St, Bellevue NE, 68123',
    currentDate: moment().format('L'),
    batchNumber: '159763'};
  printLocations: any[] = [];
  searchStoreName = '';

  firstNameList: any[];
  secondNameList: any[];
  nameListKey = 'name';
  productSizeStrengths = {};
  sizeRadioButtons = [];
  strengthRadioButtons = [];
  sizeRadioButtonsSecond = [];
  strengthRadioButtonsSecond = [];
  firstNameListHistory: string;
  secondNameListHistory: string;

  bottleSizeSelected = '';
  nicStrengthSelected = '';
  bottleSizeSelectedSecond = '';
  nicStrengthSelectedSecond = '';

  isLoadingNameListFirst: boolean;
  isLoadingNameListSecond: boolean;
  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService
              ) { }

  ngOnInit(): void {
    this.searchOptionSelected = this.searchOptions[0].value;
    this.firstNameList = [GlobalConstants.nameListInitial];
    this.firstNameListHistory = '';
    this.secondNameListHistory = '';
    this.idbService.init(dbExisted => {
      if (!dbExisted) {
        this.saveRecipesToIdb();
      }
    });
    this.getPrintLocations();
  }

  ngOnDestroy(): void {
  }

  onChangeSelectOption(event) {
    this.resetSizeStrengthRecipes();
    this.firstNameList = [GlobalConstants.nameListInitial];
    this.secondNameList = [];
    if (event.target.id === 'search_Ingredients') {
      this.searchItem = '';
      this.searchItemSecond = '';
    } else {
      this.searchItem = '';
    }
  }

  selectEvent(item: { name: string; labelKey: string}, option: string) {
    if (option === 'Recipe') {
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
          console.log(error);
        },
        () => {
          console.log('Job done');
        }
      );
    } else {
      this.isLoadingNameListSecond = true;
      this.idbService.getProductNameListByComponent(item.name)
        .subscribe(
          nameList => {
            this.secondNameList.push({
              name: nameList.label,
              labelKey: nameList.labelKey
            });
            this.isLoadingNameListSecond = false;
          });

    }
  }

  onChangeSearch(search: string, option: string) {
    // fetch data from idb

    this.isLoadingNameListFirst = true;
    this.firstNameList = [];

    if (search.length > 0) {
      if (option === 'Recipe') {
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
              console.log(error);
            });
      } else {
        this.idbService.getComponentNameList(search)
          .subscribe(
            nameList => {
              if ('error' in nameList) {
                this.isLoadingNameListFirst = false;
              } else {
                if (this.notExistInArray(this.firstNameList, 'name', nameList.name)) {
                  this.firstNameList.push({
                    id: nameList.id,
                    name: nameList.name
                  });
                }
                this.isLoadingNameListFirst = false;
              }
            },
            error => {
              console.log(error);
            });
      }
    } else {
      this.isLoadingNameListFirst = false;
    }

  }

  onInputCleared() {
    this.firstNameList = [];
    this.resetSizeStrengthRecipes();
  }

  onFocused() {
    // Get productName or componentName List
  }

  selectEventSecond(item: any) {
    this.productSizeStrengths = {};
    this.idbService.getProductSizeNicStrength(item.labelKey).subscribe(
      (data) => {
        if (!this.productSizeStrengths.hasOwnProperty(data.bottleSize)) {
          this.productSizeStrengths[data.bottleSize] = [];
        }
        if (this.productSizeStrengths[data.bottleSize].indexOf(data.nicStrength.toString()) === -1) {
          this.productSizeStrengths[data.bottleSize].push(data.nicStrength.toString());
        }
        this.sizeRadioButtonsSecond = Object.keys(this.productSizeStrengths);
        this.bottleSizeSelectedSecond = this.sizeRadioButtonsSecond[0];
        this.strengthRadioButtonsSecond = this.productSizeStrengths[this.bottleSizeSelectedSecond].sort((a, b) => a - b);
        this.nicStrengthSelectedSecond = this.strengthRadioButtonsSecond[0];
        this.getRecipeContents(item.labelKey, this.bottleSizeSelectedSecond, this.nicStrengthSelectedSecond);
      },
      (error) => {
        console.log(error);
      },
      () => {
        console.log('Job done');
      }
    );
  }

  onChangeSearchSecond() {
    // fetch remote data from here
    // And reassign the 'data' which is bind to 'data'
  }

  onFocusedSecond() {
    // Get productName List
  }

  onInputClearedSecond() {
    // this.secondNameList = [];
    this.resetSizeStrengthRecipesSecond();
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

  changeSizeSecond(size: string) {
    this.strengthRadioButtonsSecond = this.productSizeStrengths[size].sort((a, b) => Number(a) - Number(b));
    this.nicStrengthSelectedSecond = this.strengthRadioButtonsSecond[0];

    this.getRecipeContents(this.searchItemSecond.labelKey, size, this.nicStrengthSelectedSecond);
  }

  changeStrengthSecond(strength: string) {
    this.getRecipeContents(this.searchItemSecond.labelKey, this.bottleSizeSelectedSecond, strength);
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
        console.log(error);
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

  resetSizeStrengthRecipesSecond() {
    this.bottleSizeSelectedSecond = '';
    this.nicStrengthSelectedSecond = '';
    this.sizeRadioButtonsSecond = [];
    this.strengthRadioButtonsSecond = [];
    this.printData.name = '';
  }

  exportToPdf(): void {
    const element = document.getElementById('printSection');
    const params = {
      margin: 0,
      filename: this.printData.name + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {scale: 2},
      jsPDF: { unit: 'in', format: 'a4', orientation: 'l'}
    };

    html2pdf().from(element).set(params).save();
  }

  getPrintLocations(): void {
    this.printLocations = this.recipeListService.retrieveLocations();
  }

  selectEventLocation(event) {
    this.printData.storeName = event.name;
    this.printData.storeLocation = event.storeLocation;
  }

}
