import {Component, ElementRef, Injectable, OnInit, ViewChild} from '@angular/core';
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
import {User} from '../shared/user.model';

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
  currentUser: User;

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
            this.currentUser = user;
          }
        );
      } else {
        console.log('Use local db user data');
        this.getAppProperty(GlobalConstants.appPropertyUser).subscribe(
          user => {
            this.appAssociate = user;
            this.currentUser = user;
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

  logout(): void {
    this.currentUser.signed = false;
    setTimeout(() => {
      this.recipeListService.saveUsersToIdb(this.currentUser);
    }, 500);
    setTimeout(() => {
      this.auth.logout();
    }, 1000);
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
    const redirectUrl = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?' +
      'client_id=c44b4083-3bb0-49c1-b47d-974e53cbdf3c' +
      '&response_type=code%20id_token' +
      '&scope=https%3A%2F%2Fmanagement.core.windows.net%2F%2Fuser_impersonation%20openid%20email%20profile' +
      '&state=OpenIdConnect.AuthenticationProperties%3D2YYcbzhxjqJFt8OiC273JyNyLYaq6vmiCV5P' +
      '-PAaMuJnlep9sJbqu1HqYbQdfbhaVwoi1b1RcnNblX6JE8gUcPBU-omzovrXtd55naGPLyAgj7tYYhVxs5LoNh2evyxH' +
      '&response_mode=form_post' +
      '&nonce=637554159583720610.ZDY4ZmU5MWItZjE4Yy00NjczLTgyYWItMDhiMzcwMTFiN2UxNWFlYTNmNDktYjQ5Yi00N2Y4LTk0MWItYjFjZmVhNjA4NGNm' +
      '&redirect_uri=https%3A%2F%2Fportal.azure.com%2Fsignin%2Findex%2F' +
      '&site_id=501430' +
      '&login_hint=' + user.username +
      '&client-request-id=0c5a8a73-35e7-405a-b4fe-13bcf7fd9f11&x-client-SKU=ID_NET45' +
      '&x-client-ver=5.3.0.0';
    window.open(redirectUrl, '_blank');
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
