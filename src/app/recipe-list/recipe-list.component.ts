import {Component, OnDestroy, OnInit} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListModel} from "./shared/recipe-list.model";
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

  bottleSizes = [
    {id: 1, value: '30mL'},
    {id: 2, value: '60mL'},
    {id: 3, value: '120mL'}
  ]

  nicStrengths = [
    {id: 1, value: '0mg'},
    {id: 2, value: '3mg'},
    {id: 3, value: '6mg'},
    {id: 4, value: '9mg'}
  ]

  searchOptionSelected = this.searchOptions[0].value
  searchItem: any = ''
  bottleSizeSelected = this.bottleSizes[0].value
  nicStrengthSelected = this.nicStrengths[0].value

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
    console.log('Selected: ', item);
  }

  onChangeSearch(search: string){
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data'
    // console.log('onChanged: ', search)
  }

  onFocused(event){
    //do sth
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

  getProductIngredients(searchOption, itemName, bottleSize, nicStrength){
    console.log(searchOption, itemName, bottleSize, nicStrength)
    this.recipes = [
      {ingredients: 'Flavor ipsum dolor1', quantity: 0.25, percentage: 0.25, color: "1"},
      {ingredients: 'Flavor ipsum dolor2', quantity: 0.25, percentage: 0.25, color: "2"},
      {ingredients: 'Flavor ipsum dolor3', quantity: 0.25, percentage: 0.25, color: "3"},
    ]
  }

}
