import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from "@angular/common/http";
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { FormsModule } from "@angular/forms";
import { HeaderComponent } from './header/header.component';
import { GuideComponent } from './guide/guide.component';
import { AutocompleteLibModule } from "angular-ng-autocomplete";

@NgModule({
  declarations: [
    AppComponent,
    RecipeListComponent,
    HeaderComponent,
    GuideComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AutocompleteLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
