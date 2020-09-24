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
  productNameList: any[];
  componentNameList: any[];
  nameListKey = 'name'

  productNameListLoaded = false;
  componentNameListLoaded = false;
  secondNameListLoaded = false;
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
    this.productNameList = [];
    this.componentNameList = [];
    // this.saveRecipesToIdb();
  }

  ngOnDestroy(): void {
  }

  onChangeSelectOption(event){
    // console.log(event.target.id)
    this.recipes = []
    this.secondNameList = []
    if (event.target.id === 'search_Ingredients'){
      this.firstNameList = this.componentNameList
      this.searchItemSecond = ''
    } else {
      this.firstNameList = this.productNameList
      this.searchItem = ''
    }

  }

  selectEvent(item, option){
    // console.log('Selected: ', item);
    if (option === 'Recipe') {
      let indexName = 'product';
      this.recipes = this.idbService.getRecipesFromIdb(indexName, item.name)
    } else {
      this.secondNameListLoaded = false;
    }
  }

  onChangeSearch(search: string){
    // fetch remote data from here
    // And reassign the 'data' which is bind to 'data'
  }

  onFocused(event, option){
    // Get productName or componentName List
    this.getProductOrIngredientList(option);
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

  onFocusedSecond(event, item){
    // Get productName List
    this.getProductListByComponent(item)
  }

  getProductOrIngredientList(option){
    if (option === 'Recipe'){
      if (!this.productNameListLoaded){
        this.isLoadingNameListFirst = true;
        this.productNameList = this.idbService.getProductNameList();
        this.productNameListLoaded = true;
      }
      this.isLoadingNameListFirst = false
      this.firstNameList = this.productNameList

    }else if (option === 'Ingredients'){
      if (!this.componentNameListLoaded){
        this.isLoadingNameListFirst = true;
        this.componentNameList = this.idbService.getComponentNameList(null);
        this.componentNameListLoaded = true;
      }
      this.isLoadingNameListFirst = false;
      this.firstNameList = this.componentNameList;
    }
  }

  getProductListByComponent(item){
    if (!this.secondNameListLoaded) {
      this.isLoadingNameListSecond = true
      this.productNameList = this.idbService.getComponentNameList(item.name);
      this.secondNameListLoaded = true;
    }

    this.isLoadingNameListSecond = false;
    this.secondNameList = this.productNameList;
  }

  saveRecipesToIdb(): void{
    this.recipeListService.retrieveAll();
  }

  getProductNameList(){
    console.log(this.productNameList);
    console.log(this.componentNameList)
  }

  emptyIdbData(){
    this.recipeListService.emptyIdbData();
  }


}
