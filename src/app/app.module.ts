import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from "@angular/common/http";
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { FormsModule } from "@angular/forms";
import { AutocompleteLibModule } from "angular-ng-autocomplete";
import { NgxPrintModule } from "ngx-print";

import { HeaderComponent } from './header/header.component';
import { GuideComponent } from './guide/guide.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    RecipeListComponent,
    HeaderComponent,
    GuideComponent,
    ProgressBarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AutocompleteLibModule,
    NgxPrintModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
