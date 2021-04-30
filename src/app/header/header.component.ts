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
import {NgConnection} from 'ng-connection';
import * as moment from 'moment';

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

  networkStatus: boolean;

  @ViewChild('appLocationModal') appLocationModal: ElementRef;

  constructor(private auth: AuthService,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private modalService: NgbModal,
              private errorService: ErrorService,
              private progressService: ProgressService,
              private ngConnection: NgConnection) { }

  ngOnInit(): void {
    this.ngConnection.connectivity().subscribe(
    status => {
      this.networkStatus = status;
    });

    setTimeout(() => {
      if (this.networkStatus) {
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
      this.idbService.getLocationsOrUsersFromIdb(this.idbService.objectStoreLocation).subscribe(
        data => {
          this.storeLocations.push(data);
        }
      );
    }, 500);
  }

  addUser(): void {
    console.log('addUser');
  }

  logout(): void {
    this.auth.logout();
  }

  openHelp(content) {
    this.modalService.open(content, {scrollable: true, size: 'lg'});
  }

  selectEvent() {}

  openAppLocation() {
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
          // this.appLocation = data;
          window.location.reload();
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
    this.saveAppProperty(GlobalConstants.appPropertyUser, user);
    this.appAssociate = user;
  }

  refreshIdbData() {
    this.isRefreshMoreThanOneDay().subscribe(
      flag => {
        if (flag) {
          this.refreshObjectStores();
        }
      }
    );
  }

  isRefreshMoreThanOneDay() {
    const subject = new Subject();

    this.idbService.getAppPropertyFromIdb(GlobalConstants.appPropertyIdbLastUpdate).subscribe(
      lastUpdate => {
        const hours = moment().diff(lastUpdate, 'hours');
        subject.next(hours >= GlobalConstants.refreshFrequencyHours);
      },
      (error) => {
        subject.error(error);
      }
    );

    return subject;

  }

  refreshObjectStores() {
    this.idbService.clearObjectStoreData(this.idbService.objectStoreName).subscribe(
      (msg) => {
        console.log(msg);
        this.recipeListService.saveRecipesToIdb();
      },
      (error) => {
        console.log(error);
      }
    );

    this.idbService.clearObjectStoreData(this.idbService.objectStoreLocation).subscribe(
      (msg) => {
        console.log(msg);
        this.recipeListService.saveLocationsToIdb();
      },
      (error) => {
        console.log(error);
      }
    );
  }

}
