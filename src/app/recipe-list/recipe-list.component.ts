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

  selectEvent(item: { name: string; }, option: string) {
    if (option === 'Recipe') {
      const tmpProduct = this.existInArray(this.firstNameList, 'name', item.name);
      if (Object.keys(tmpProduct.attributes).length === 0 && tmpProduct.attributes.constructor === Object ) {
        this.recipes = this.idbService.getRecipesFromIdb(GlobalConstants.indexProduct, item.name);
        this.idbService.getProductPrintData(item.name).subscribe(
          nameList => {
            this.printData.name = nameList.name;
            this.printData.sku = nameList.sku;
          },
          error => {
            console.log(error);
          }
        );
      } else {
        this.getSizeStrengthRadioButtons(tmpProduct, option);
      }
    } else {
      this.isLoadingNameListSecond = true;
      this.idbService.getProductNameListByComponent(item.name)
        .subscribe(
          nameList => {
            this.getProductNameListWithSizeStrength(this.secondNameList, nameList);
            this.isLoadingNameListSecond = false;
          });

    }
  }

  onChangeSearch(search: string, option: string) {
    // fetch data from idb

    let indexName: string;

    this.isLoadingNameListFirst = true;
    this.firstNameList = [];

    if (search.length > 0) {
      if (option === 'Recipe') {
        indexName = GlobalConstants.indexProduct;
        this.idbService.getProdComponentNames(indexName, search)
          .subscribe(
            nameList => {
              if ('error' in nameList) {
                this.isLoadingNameListFirst = false;
              } else {
                this.getProductNameListWithSizeStrength(this.firstNameList, nameList);
                this.isLoadingNameListFirst = false;
              }
            },
            error => {
              console.log(error);
            });
      } else {
        indexName = GlobalConstants.indexComponent;
        this.idbService.getProdComponentNames(indexName, search)
          .subscribe(
            nameList => {
              if ('error' in nameList) {
                this.isLoadingNameListFirst = false;
              } else {
                this.firstNameList.push({
                  id: nameList.id,
                  name: nameList.name
                });
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

  selectEventSecond(item: { name: string; }) {
    // console.log('Selected: ', item);
    const tmpProduct = this.existInArray(this.secondNameList, 'name', item.name);
    if (Object.keys(tmpProduct.attributes).length === 0 && tmpProduct.attributes.constructor === Object ) {
      this.recipes = this.idbService.getRecipesFromIdb(GlobalConstants.indexProduct, item.name);
      this.idbService.getProductPrintData(item.name).subscribe(
        nameList => {
          this.printData.name = nameList.name;
          this.printData.sku = nameList.sku;
        },
        error => {
          console.log(error);
        }
      );
    } else {
      this.getSizeStrengthRadioButtons(tmpProduct, 'Ingredients');
    }
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
    this.recipeListService.retrieveAllRecipes();
  }

  getProductNameListWithSizeStrength(resultList, nameList) {
    const tmpProduct = this.existInArray(resultList, 'name', nameList.name);
    if (!tmpProduct ) {
      const objAttributes = {};
      if (nameList.size !== '') {
        objAttributes[nameList.size] = [nameList.strength];
      }
      resultList.push({
        name: nameList.name,
        commaCount: nameList.commaCount,
        attributes: objAttributes
      });
    } else {
      if (nameList.size in tmpProduct.attributes) {
        if (tmpProduct.attributes[nameList.size].indexOf(nameList.strength) < 0) {
          tmpProduct.attributes[nameList.size].push(nameList.strength);
        }
      } else {
        tmpProduct.attributes[nameList.size] = [nameList.strength];
      }
    }
  }

  existInArray(arr: any, key: string, value: string) {
    return arr.find(x => x[key] === value);
  }

  changeSize(size: string) {
    const tmpProduct = this.existInArray(this.firstNameList, 'name', this.searchItem.name);
    const strengthButtons = tmpProduct.attributes[size]
      .sort((a, b) => Number(a.slice(0, a.length - 2)) - Number(b.slice(0, b.length - 2)));

    this.strengthRadioButtons = strengthButtons;
    this.nicStrengthSelected = strengthButtons[0];

    this.getRecipeContents(this.searchItem.name, this.searchItem.commaCount, size, this.nicStrengthSelected);
  }

  changeStrength(strength: string) {
    this.getRecipeContents(this.searchItem.name, this.searchItem.commaCount, this.bottleSizeSelected, strength);
  }

  changeSizeSecond(size: string) {
    let tmpProduct: any;
    tmpProduct = this.existInArray(this.secondNameList, 'name', this.searchItemSecond.name);
    let strengthButtons: any;
    strengthButtons = tmpProduct.attributes[size]
      .sort((a, b) => Number(a.slice(0, a.length - 2)) - Number(b.slice(0, b.length - 2)));

    this.strengthRadioButtonsSecond = strengthButtons;
    this.nicStrengthSelectedSecond = strengthButtons[0];
    this.getRecipeContents(this.searchItemSecond.name, this.searchItemSecond.commaCount, size, this.nicStrengthSelectedSecond);
  }

  changeStrengthSecond(strength: string) {
    this.getRecipeContents(this.searchItemSecond.name, this.searchItemSecond.commaCount, this.bottleSizeSelectedSecond, strength);
  }

  getRecipeContents(name: string, commaCount: string, size: string, strength: string) {
    let searchName: string;
    if (commaCount === '2') {
      searchName = name + ', ' + size + ', ' + strength;
    } else {
      searchName = name + ' ' + size + ', ' + strength;
    }

    if (name.toUpperCase().indexOf('(salt)'.toUpperCase()) >= 0) {
      strength += ' --s/ml';
    } else {
      strength += '/ml';
    }

    this.recipes = this.idbService.getRecipesFromIdb(GlobalConstants.indexProduct, searchName);
    this.idbService.getProductPrintData(searchName).subscribe(
      nameList => {
        this.printData.name = name;
        this.printData.sku = nameList.sku;
        this.printData.size = size;
        this.printData.strength = strength;
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

  getSizeStrengthRadioButtons(tmpProduct, option: string) {
    const sizeButtons = Object.keys(tmpProduct.attributes)
      .sort((a, b) => Number(a.slice(0, a.length - 2)) - Number(b.slice(0, b.length - 2)));
    const strengthButtons = tmpProduct.attributes[sizeButtons[0]]
      .sort((a, b) => Number(a.slice(0, a.length - 2)) - Number(b.slice(0, b.length - 2)));

    if (option === 'Recipe') {
      this.sizeRadioButtons = sizeButtons;
      this.bottleSizeSelected = sizeButtons[0];

      this.strengthRadioButtons = strengthButtons;
      this.nicStrengthSelected = strengthButtons[0];

      this.getRecipeContents(tmpProduct.name, tmpProduct.commaCount, this.bottleSizeSelected, this.nicStrengthSelected);
    } else {
      this.sizeRadioButtonsSecond = sizeButtons;
      this.bottleSizeSelectedSecond = sizeButtons[0];

      this.strengthRadioButtonsSecond = strengthButtons;
      this.nicStrengthSelectedSecond = strengthButtons[0];

      this.getRecipeContents(tmpProduct.name, tmpProduct.commaCount, this.bottleSizeSelectedSecond, this.nicStrengthSelectedSecond);
    }

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
