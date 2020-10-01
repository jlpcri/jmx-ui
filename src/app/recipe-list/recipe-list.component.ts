import {Component, OnDestroy, OnInit} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {User} from '../shared/user.model';
import {GlobalConstants} from '../shared/GlobalConstants';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  user: User = new User();

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
  firstNameListHistory: string;
  secondNameListHistory: string;

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
    this.saveRecipesToIdb();
  }

  ngOnDestroy(): void {
  }

  onChangeSelectOption(event) {
    // console.log(event.target.id)
    this.recipes = [];
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
    // console.log('Selected: ', item);
    if (option === 'Recipe') {
      const indexName = GlobalConstants.indexProduct;
      this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name);
      this.productNamePrint = item.name;
    } else {
      this.isLoadingNameListSecond = true;
      this.idbService.getProductNameListByComponent(item.name)
        .subscribe(
          nameList => {
            this.secondNameList.push({
              id: nameList.id,
              name: nameList.name
            });
            this.isLoadingNameListSecond = false;
          });

      // console.log(this.secondNameList)
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
                this.firstNameList.push({
                  id: nameList.id,
                  name: nameList.name,
                  size: nameList.size,
                  strength: nameList.strength
                });
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

    // console.log(this.firstNameList)

  }

  onSearchCleared() {
    this.firstNameList = [];
  }

  onFocused() {
    // Get productName or componentName List
  }

  selectEventSecond(item: { name: string; }) {
    // console.log('Selected: ', item);
    const indexName = GlobalConstants.indexProduct;
    this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name);
    this.productNamePrint = item.name;
  }

  onChangeSearchSecond() {
    // fetch remote data from here
    // And reassign the 'data' which is bind to 'data'
  }

  onFocusedSecond() {
    // Get productName List
  }

  saveRecipesToIdb(): void {
    this.recipeListService.retrieveAll();
  }

  getProductNameList() {
    if (this.searchOptionSelected === 'Recipe') {
      console.log(this.firstNameList);
    } else {
      console.log(this.secondNameList);
    }
  }

  emptyIdbData() {
    this.recipeListService.emptyIdbData();
  }


}
