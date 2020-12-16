import {Component, ElementRef, Injectable, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocationModel} from '../shared/location.model';
import {GlobalConstants} from '../shared/GlobalConstants';
import {ErrorService} from '../error/error.service';
import {ProgressService} from '../progress-bar/shared/progress.service';
import {Subject} from 'rxjs';
import {ConnectionService} from 'ngx-connection-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

@Injectable({
  providedIn: 'root'
})
export class HeaderComponent implements OnInit {
  closeResult: string;
  storeLocations: LocationModel[] = [];
  locationSelect = '';
  appLocation = GlobalConstants.appLocation;
  isLoading: boolean;
  isShowAlert = false;

  appAssociate = GlobalConstants.appAssociate;
  associateList = [];

  internetConnection: boolean;
  internetAccess: boolean;
  internetStatus: boolean;

  @ViewChild('appLocationModal') appLocationModal: ElementRef;

  constructor(private auth: AuthService,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private modalService: NgbModal,
              private errorService: ErrorService,
              private progressService: ProgressService,
              private connectionService: ConnectionService) {
    this.connectionService.monitor().subscribe(
      currentState => {
        this.internetConnection = currentState.hasNetworkConnection;
        this.internetAccess = currentState.hasInternetAccess;
        this.internetStatus = this.internetConnection && this.internetAccess;
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.internetStatus) {
        this.auth.authorized().subscribe(
          user => {
            this.appAssociate.name = user.name;
            this.appAssociate.roles = user.roles;
          }
        );
      } else {
        console.log('Use local db user data');
        this.getAppProperty(GlobalConstants.appPropertyUser).subscribe(
          user => {
            this.appAssociate = user;
          }
        );
      }
    }, 500);

    setTimeout( () => {
      this.getAppProperty(GlobalConstants.appPropertyLocation).subscribe(
        data => {
          this.appLocation = data;
        }
      );
    }, 500);

    setTimeout(() => {
      this.idbService.getLocationsOrUsersFromIdb(this.idbService.objectStoreUser).subscribe(
        data => {
          this.associateList.push(data);
        }
      );
    }, 500);
  }

  logout(): void {
    this.auth.logout();
  }

  eraseIdbData() {
    this.idbService.eraseIdbData();
  }

  isAdmin(): boolean {
    if (this.appAssociate === undefined) {
      return false;
    } else if (this.appAssociate.roles === undefined || this.appAssociate.roles.length === 0) {
      return false;
    } else {
      return (this.appAssociate.roles.indexOf(GlobalConstants.rolesNameAdmin) >= 0) && isDevMode();
    }
  }

  openHelp(content) {
    this.modalService.open(content, {scrollable: true, size: 'lg'});
  }

  selectEvent() {}

  openAppLocation() {
    if (this.storeLocations.length === 0) {
      this.storeLocations = this.getStoreLocationsOrUsersFromIdb(this.idbService.objectStoreLocation);
    }

    this.locationSelect = this.appLocation.name;
    const modalRef = this.modalService.open(this.appLocationModal, {ariaLabelledBy: 'modal-appLocation-title', size: 'lg'});
    modalRef.result.then(
      (location) => {
        if ( this.isAppConfigInputError(location) ) {
          this.isShowAlert = true;
          this.openAppLocation();
          return false;
        }

        if (typeof location === 'object') {
          this.saveAppProperty(GlobalConstants.appPropertyLocation, location);
        }
        this.isShowAlert = false;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        console.log(this.closeResult);
        this.getAppProperty(GlobalConstants.appPropertyLocation).subscribe(
          data => {
            this.appLocation = data;
          }
        );
        this.isShowAlert = false;
      }
    );
  }

  isAppConfigInputError(location) {
    return location === undefined || location === ''
      || (typeof location === 'string' && location !== '' && location !== this.appLocation.name);
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getStoreLocationsOrUsersFromIdb(objectStore: string) {
    const result = [];
    this.isLoading = true;
    this.idbService.getLocationsOrUsersFromIdb(objectStore).subscribe(
      data => {
        result.push(data);
        this.isLoading = false;
      }
    );

    return result;
  }

  getAppProperty(property) {
    const subject = new Subject<any>();
    this.idbService.getAppPropertyFromIdb(property).subscribe(
      value => {
        subject.next(value);
      },
      () => {
        if (!this.progressService.loading) {
          if (property === GlobalConstants.appPropertyLocation) {
            this.openAppLocation();
          }
        }
      }
    );

    return subject;
  }

  saveAppProperty(property, value) {
    this.idbService.saveAppPropertyToIdb(property, value).subscribe(
      data => {
        if (property === GlobalConstants.appPropertyLocation) {
          this.appLocation = data;
        } else {
          this.appAssociate = data;
        }
      },
      error => {
        this.errorService.add(error);
      }
    );
  }

  switchAppUser(user) {
    if (this.internetStatus) {
      this.logout();
    } else {
      this.saveAppProperty(GlobalConstants.appPropertyUser, user);
      this.appAssociate = user;
    }
  }
}
