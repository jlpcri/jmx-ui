import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {User} from '../shared/user.model';
import {AuthService} from '../auth.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocationModel} from '../shared/location.model';
import {GlobalConstants} from '../shared/GlobalConstants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: User;
  closeResult: string;
  storeLocations: LocationModel[] = [];
  locationLoadedFlag = false;
  appLocation = '';
  isLoading: boolean;
  isShowAlert = false;

  @ViewChild('appConfigModal') appConfigModal: ElementRef;

  constructor(private auth: AuthService,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
    this.auth.authorized().subscribe(
      user => { this.user = user; }
    );

    setTimeout( () => {
      this.getAppProperty(GlobalConstants.appPropertyLocation);
    }, 500);
  }

  logout(): void {
    this.auth.logout();
  }

  saveRecipesToIdb() {
    this.idbService.init(dbExisted => {
      if (!dbExisted) {
        this.recipeListService.saveRecipesToIdb();
      } else {
        console.log('ObjectStore recipes exists. No need loading');
      }
    });
  }

  saveLocationsToIdb() {
    this.recipeListService.saveLocationsToIdb();
  }

  eraseIdbData() {
    this.idbService.eraseIdbData();
  }

  isAdmin(): boolean {
    if (this.user === undefined) {
      return false;
    } else if (this.user.roles === undefined || this.user.roles.length === 0) {
      return false;
    } else {
      return this.user.roles.indexOf('GROUP - Alohma Admin') >= 0;
    }
  }

  openHelp(content) {
    this.modalService.open(content, {scrollable: true, size: 'lg'});
  }

  selectEvent(event) {}

  openAppConfig() {
    if (!this.locationLoadedFlag) {
      this.recipeListService.saveLocationsToIdb();
      this.locationLoadedFlag = true;
    }

    if (this.storeLocations.length === 0) {
      this.getStoreLocationsFromIdb();
    }

    let newValue = '';
    const modalRef = this.modalService.open(this.appConfigModal, {ariaLabelledBy: 'modal-appConfig-title', size: 'lg'});
    modalRef.result.then(
      (location) => {
        if (location === '') {
          this.isShowAlert = true;
          this.openAppConfig();
          return false;
        }

        if (typeof location === 'string') {
          newValue = location;
        } else {
          newValue = location.name;
        }
        this.saveAppProperty(GlobalConstants.appPropertyLocation, newValue);
      },
      (reason) => {
        console.log(reason);
        this.getAppProperty(GlobalConstants.appPropertyLocation);
        this.isShowAlert = false;
      }
    );
  }

  getStoreLocationsFromIdb(): void {
    if (this.storeLocations.length === 0) {
      this.isLoading = true;
      this.idbService.getLocationsFromIdb().subscribe(
        data => {
          this.storeLocations.push({
            name: data.name,
            storeLocation: data.storeLocation
          });
          this.isLoading = false;
        }
      );
    }
  }

  getAppProperty(property) {
    this.idbService.getAppPropertyFromIdb(property).subscribe(
      value => {
        this.appLocation = value;
      },
      error => {
        console.log(error);
      }
    );
  }

  saveAppProperty(property, value) {
    this.idbService.saveAppPropertyToIdb(property, value).subscribe(
      location => {
        this.appLocation = location;
      },
      error => {
        console.log(error);
      }
    );
  }
}
