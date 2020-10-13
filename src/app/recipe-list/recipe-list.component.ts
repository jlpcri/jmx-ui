import {Component, OnDestroy, OnInit} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {GlobalConstants} from '../shared/GlobalConstants';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
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
  productNamePrint = '';

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
      if (tmpProduct.size.length > 1) {
        this.getSizeStrengthRadioButtons(tmpProduct, option);
      } else {
        const indexName = GlobalConstants.indexProduct;
        this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name);
        this.productNamePrint = item.name;
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
    if (tmpProduct.size.length > 0) {
      this.getSizeStrengthRadioButtons(tmpProduct, 'Ingredients');
    } else {
      const indexName = GlobalConstants.indexProduct;
      this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name);
      this.productNamePrint = item.name;
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
    this.recipeListService.retrieveAll();
  }

  getProductNameListWithSizeStrength(resultList, nameList) {
    const tmpProduct = this.existInArray(resultList, 'name', nameList.name);
    if (!tmpProduct ) {
      resultList.push({
        name: nameList.name,
        commaCount: nameList.commaCount,
        size: [nameList.size],
        strength: [nameList.strength]
      });
    } else {
      if (tmpProduct.size.indexOf(nameList.size) < 0) {
        tmpProduct.size.push(nameList.size);
      }
      if (tmpProduct.strength.indexOf(nameList.strength) < 0) {
        tmpProduct.strength.push(nameList.strength);
      }
    }
  }

  existInArray(arr: any, key: string, value: string) {
    return arr.find(x => x[key] === value);
  }

  changeSize(size: string) {
    this.getRecipeContents(this.searchItem.name, this.searchItem.commaCount, size, this.nicStrengthSelected);
  }

  changeStrength(strength: string) {
    this.getRecipeContents(this.searchItem.name, this.searchItem.commaCount, this.bottleSizeSelected, strength);
  }

  changeSizeSecond(size: string) {
    this.getRecipeContents(this.searchItemSecond.name, this.searchItemSecond.commaCount, size, this.nicStrengthSelectedSecond);
  }

  changeStrengthSecond(strength: string) {
    this.getRecipeContents(this.searchItemSecond.name, this.searchItemSecond.commaCount, this.bottleSizeSelectedSecond, strength);
  }

  getRecipeContents(name: string, commaCount: string, size: string, strength: string) {
    let searchName = '';
    if (commaCount === '2') {
      searchName = name + ', ' + size + ', ' + strength;
    } else {
      searchName = name + ' ' + size + ', ' + strength;
    }

    this.recipes = this.idbService.getRecipesFromIdb(GlobalConstants.indexProduct, searchName);
  }

  resetSizeStrengthRecipes() {
    this.bottleSizeSelected = '';
    this.nicStrengthSelected = '';
    this.sizeRadioButtons = [];
    this.strengthRadioButtons = [];

    this.recipes = [];
  }

  resetSizeStrengthRecipesSecond() {
    this.bottleSizeSelectedSecond = '';
    this.nicStrengthSelectedSecond = '';
    this.sizeRadioButtonsSecond = [];
    this.strengthRadioButtonsSecond = [];

    // this.recipes = [];
  }

  getSizeStrengthRadioButtons(tmpProduct, option: string) {
    const sizeButtons = tmpProduct.size.sort((a, b) => Number(a.slice(0, a.length - 2)) - Number(b.slice(0, b.length - 2)));
    const strengthButtons = tmpProduct.strength.sort((a, b) => Number(a.slice(0, a.length - 2)) - Number(b.slice(0, b.length - 2)));

    if (option === 'Recipe') {
      this.sizeRadioButtons = sizeButtons;
      this.bottleSizeSelected = sizeButtons[0];

      this.strengthRadioButtons = strengthButtons;
      this.nicStrengthSelected = strengthButtons[0];
    } else {
      this.sizeRadioButtonsSecond = sizeButtons;
      this.bottleSizeSelectedSecond = sizeButtons[0];

      this.strengthRadioButtonsSecond = strengthButtons;
      this.nicStrengthSelectedSecond = strengthButtons[0];
    }

    this.getRecipeContents(tmpProduct.name, tmpProduct.commaCount, this.bottleSizeSelected, this.nicStrengthSelected);
  }

}
