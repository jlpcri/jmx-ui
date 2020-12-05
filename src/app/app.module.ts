import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { FormsModule } from '@angular/forms';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { HeaderComponent } from './header/header.component';
import { BottleScanComponent } from './bottle-scan/bottle-scan.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ErrorTestComponent } from './error/error-test.component';
import { ErrorComponent } from './error/error.component';

import {
  NgbDropdownModule, NgbProgressbarModule,
  NgbAlertModule, NgbModalModule,
  NgbDatepickerModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import {NgxPrintModule} from 'ngx-print';
import {NgxSpinnerModule} from 'ngx-spinner';

@NgModule({
  declarations: [
    AppComponent,
    RecipeListComponent,
    HeaderComponent,
    BottleScanComponent,
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
        NgbModalModule,
        NgbDatepickerModule,
        NgbPopoverModule,
        NgxPrintModule,
        NgxSpinnerModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
