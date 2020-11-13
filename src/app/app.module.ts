import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { FormsModule } from '@angular/forms';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { HeaderComponent } from './header/header.component';
import { GuideComponent } from './guide/guide.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ErrorTestComponent } from './error/error-test.component';
import { ErrorComponent } from './error/error.component';

import { NgbDropdownModule, NgbProgressbarModule, NgbAlertModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    RecipeListComponent,
    HeaderComponent,
    GuideComponent,
    ProgressBarComponent,
    ErrorTestComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AutocompleteLibModule,
    NgbProgressbarModule,
    NgbDropdownModule,
    QRCodeModule,
    NgbAlertModule,
    NgbModalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
