import {Component, OnDestroy, OnInit} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListService} from "./shared/recipe-list.service";
import {IndexedDatabaseService} from "../shared/indexed-database.service";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  searchOptions = [
    {id: 1, value: 'Recipe'},
    {id: 2, value: 'Ingredients'}
  ]

  searchOptionSelected = this.searchOptions[0].value
  searchItem: any = ''

  //todo: fetch from amv_master
  recipes: Recipe[] = []

  productNameList: any[];
  productNameListKey = 'name'
  productNameListLoaded = false;
  isLoadingProductNameList: boolean;

  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService) { }

  ngOnInit(): void {
    this.productNameList = [];
    // this.saveRecipesToIdb();
  }

  ngOnDestroy(): void {
  }

  selectEvent(item, option){
    // console.log('Selected: ', item);
    let indexName = 'product';
    if (option === 'Ingredients') {
      indexName = 'component';
    }
    this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name)
  }

  onChangeSearch(search: string){
    // fetch remote data from here
    // And reassign the 'data' which is bind to 'data'
  }

  onFocused(event){
    // Get productNameList
    if (!this.productNameListLoaded) {
      this.isLoadingProductNameList = true
      this.productNameList = this.idbService.getProductNameList();
      this.productNameListLoaded = true;
    }

    this.isLoadingProductNameList = false
  }


  saveRecipesToIdb(): void{
    this.recipeListService.retrieveAll();
  }

  getProductNameList(){
    console.log(this.productNameList);
  }

  emptyIdbData(){
    this.recipeListService.emptyIdbData();
  }


}
