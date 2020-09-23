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
  recipes: Recipe[] = [
    {ingredients: 'Flavor ipsum dolor1', quantity: 0.25, percentage: 0.25, color: "1"},
    {ingredients: 'Flavor ipsum dolor2', quantity: 0.25, percentage: 0.25, color: "2"},
    {ingredients: 'Flavor ipsum dolor3', quantity: 0.25, percentage: 0.25, color: "3"},
    {ingredients: 'Flavor ipsum dolor4', quantity: 0.25, percentage: 0.25, color: "4"},
    {ingredients: 'Flavor ipsum dolor5', quantity: 0.25, percentage: 0.25, color: "5"},
    {ingredients: 'Flavor ipsum dolor6', quantity: 0.25, percentage: 0.25, color: "6"},
    {ingredients: 'Nicotine', quantity: 0.25, percentage: 0.25, color: "7"},
  ]

  productNameList: any[];
  productNameListKey = 'name'
  productNameListLoaded = false;
  isLoadingProductNameList: boolean;

  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService) { }

  ngOnInit(): void {
    this.productNameList = [];
    this.saveRecipesToIdb();
  }

  ngOnDestroy(): void {
  }

  selectEvent(item){
    // console.log('Selected: ', item);
    this.recipes = this.idbService.getRecipesFromIdb('product', item.name);
    // console.log(data.IDBRequest)
  }

  onChangeSearch(search: string){
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data'
    // console.log('onChanged: ', search)
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

  getProductIngredients(searchOption, itemName){
    console.log(searchOption, itemName)
    this.recipes = [
      {ingredients: 'Flavor ipsum dolor1', quantity: 0.25, percentage: 0.25, color: "1"},
      {ingredients: 'Flavor ipsum dolor2', quantity: 0.25, percentage: 0.25, color: "2"},
      {ingredients: 'Flavor ipsum dolor3', quantity: 0.25, percentage: 0.25, color: "3"},
    ]
  }


  getProductNameList(){
    console.log(this.productNameList);
  }

  emptyIdbData(){
    this.recipeListService.emptyIdbData();
  }


}
