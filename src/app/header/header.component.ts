import {Component, ElementRef, Injectable, OnInit, ViewChild} from '@angular/core';
import {User} from '../shared/user.model';
import {AuthService} from '../auth.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocationModel} from '../shared/location.model';
import {GlobalConstants} from '../shared/GlobalConstants';
import {ErrorService} from '../error/error.service';
import {ProgressService} from '../progress-bar/shared/progress.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

@Injectable({
  providedIn: 'root'
})
export class HeaderComponent implements OnInit {
  user: User;
  closeResult: string;
  storeLocations: LocationModel[] = [];
  locationSelect = '';
  appLocation = GlobalConstants.appLocation;
  isLoading: boolean;
  isShowAlert = false;

  appAssociate = GlobalConstants.appAssociate;
  associateList = [];
  associateSelect = '';

  @ViewChild('appConfigModal') appConfigModal: ElementRef;

  constructor(private auth: AuthService,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService,
              private modalService: NgbModal,
              private errorService: ErrorService,
              private progressService: ProgressService) { }

  ngOnInit(): void {
    this.auth.authorized().subscribe(
      user => {
        this.user = user;
      },
      error => {
        console.log('Use local db user data', error);
        setTimeout(() => {
          this.getAppProperty(GlobalConstants.appPropertyUser).subscribe(
            user => {
              this.user = user;
            }
          );
        }, 500);
      }
    );

    setTimeout( () => {
      this.getAppProperty(GlobalConstants.appPropertyLocation).subscribe(
        data => {
          this.appLocation = data;
        }
      );
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
      return this.user.roles.indexOf(GlobalConstants.rolesNameAdmin) >= 0;
    }
  }

  openHelp(content) {
    this.modalService.open(content, {scrollable: true, size: 'lg'});
  }

  selectEvent(event) {}

  openAppConfig() {
    if (this.storeLocations.length === 0) {
      this.storeLocations = this.getStoreLocationsFromIdb(this.idbService.objectStoreLocation);
    }
    if (this.associateList.length === 0) {
      this.associateList = this.getStoreLocationsFromIdb(this.idbService.objectStoreUser);
    }

    this.locationSelect = this.appLocation.name;
    this.associateSelect = this.user.name;
    const modalRef = this.modalService.open(this.appConfigModal, {ariaLabelledBy: 'modal-appConfig-title', size: 'lg'});
    modalRef.result.then(
      (data) => {
        const location = data.location;
        const associate = data.associate;
        if (location === undefined || location === ''
          || (typeof location === 'string' && location !== '' && location !== this.appLocation.name)) {
          this.isShowAlert = true;
          this.openAppConfig();
          return false;
        }

        if (typeof location === 'object') {
          this.saveAppProperty(GlobalConstants.appPropertyLocation, location);
        }
        if (typeof associate === 'object') {
          this.saveAppProperty(GlobalConstants.appPropertyUser, associate);
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

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getStoreLocationsFromIdb(objectStore: string) {
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
      error => {
        if (!this.progressService.loading) {
          if (property === GlobalConstants.appPropertyLocation) {
            this.errorService.add(GlobalConstants.appLocationErrorMsg);
          } else {
            this.errorService.add(GlobalConstants.appUserErrorMsg);
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
}
