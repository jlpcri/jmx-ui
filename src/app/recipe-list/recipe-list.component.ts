import {Component, OnDestroy, OnInit} from '@angular/core';

import {Recipe} from '../recipe';
import {RecipeListService} from "./shared/recipe-list.service";
import {IndexedDatabaseService} from "../shared/indexed-database.service";
import {User} from "../shared/user.model";
import {AuthService} from "../auth.service";

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
  ]

  searchOptionSelected = this.searchOptions[0].value
  searchItem: any = ''
  searchItemSecond: any = ''

  //todo: fetch from amv_master
  recipes: Recipe[] = []

  firstNameList: any[];
  secondNameList: any[];
  nameListKey = 'name'

  isLoadingNameListFirst: boolean;
  isLoadingNameListSecond: boolean;

  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.authorized().subscribe(
      user => { this.user = user; }
    )
    this.firstNameList = [];
    // this.saveRecipesToIdb();
  }

  ngOnDestroy(): void {
  }

  onChangeSelectOption(event){
    // console.log(event.target.id)
    this.recipes = []
    this.firstNameList = []
    this.secondNameList = []
    if (event.target.id === 'search_Ingredients'){
      this.searchItem = ''
      this.searchItemSecond = ''
    } else {
      this.searchItem = ''
    }

  }

  selectEvent(item, option){
    // console.log('Selected: ', item);
    if (option === 'Recipe') {
      let indexName = 'product';
      this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name)
    } else {
      this.isLoadingNameListSecond = true
      this.idbService.getProductNameListByComponent(item.name)
        .subscribe(
          nameList => {
            this.secondNameList.push({
              id: nameList.id,
              name: nameList.name
            });
            this.isLoadingNameListSecond = false
          });

      console.log(this.secondNameList)
    }
  }

  onChangeSearch(event, option){
    // fetch data from idb

    let indexName: string;
    // console.log(option)

    this.isLoadingNameListFirst = true;
    this.firstNameList = [];

    if (option === 'Recipe') {
      indexName = 'product'
      this.idbService.getProdComponentNames(indexName, event)
        .subscribe(
          nameList => {
            this.firstNameList.push({
              id: nameList.id,
              name: nameList.name,
              size: nameList.size,
              strength: nameList.strength
            });
            this.isLoadingNameListFirst = false;
          });
    } else {
      indexName = 'component'
      this.idbService.getProdComponentNames(indexName, event)
        .subscribe(
          nameList => {
            this.firstNameList.push({
              id: nameList.id,
              name: nameList.name
            });
            this.isLoadingNameListFirst = false;
          });
    }

    console.log(this.firstNameList)

  }

  onFocused(event){
    // Get productName or componentName List
    // this.getProductOrIngredientList(option);
  }

  selectEventSecond(item){
    // console.log('Selected: ', item);
    let indexName = 'product';
    this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name)
  }

  onChangeSearchSecond(search: string){
    // fetch remote data from here
    // And reassign the 'data' which is bind to 'data'
  }

  onFocusedSecond(event){
    // Get productName List
    // this.getProductListByComponent(item)
  }

  saveRecipesToIdb(): void{
    this.recipeListService.retrieveAll();
  }

  getProductNameList(){
    console.log(this.firstNameList);
    console.log(this.secondNameList)
  }

  emptyIdbData(){
    this.recipeListService.emptyIdbData();
  }


}
