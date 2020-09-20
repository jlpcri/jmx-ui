import { Component, OnInit } from '@angular/core';
import {RecipeListService} from "../recipe-list/shared/recipe-list.service";
import {IndexedDatabaseService} from "../shared/indexed-database.service";

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit {

  constructor(private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService) { }

  ngOnInit(): void {
  }

  loadRecipes(){
    this.recipeListService.retrieveAll();
  }

  getProductNameList(){
    console.log(this.idbService.getProductNameList());
  }

  emptyIdbData(){
    this.recipeListService.emptyIdbData();
  }
}
