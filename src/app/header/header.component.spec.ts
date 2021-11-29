import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {AuthService} from '../auth.service';
import {Subject} from 'rxjs';
import {User} from '../shared/user.model';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {ErrorService} from '../error/error.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {ProgressService} from '../progress-bar/shared/progress.service';
import {LocationModel} from '../shared/location.model';
import * as moment from 'moment';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let recipeListService: RecipeListService;
  let idbService: IndexedDatabaseService;
  // let modalService: NgbModal;
  let errService: ErrorService;
  let progressService: ProgressService;

  const appLocation: LocationModel = {
    name: 'madvapes',
    storeLocation: '133th street'
  };

  const user: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };
  const location: LocationModel = {
    name: 'kurevapes',
    storeLocation: '144th street omaha ne'
  };

  beforeEach(async(() => {
    errService = jasmine.createSpyObj('ErrorService', ['add']);

    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ErrorService, useValue: errService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = fixture.debugElement.injector.get(AuthService);
    recipeListService = fixture.debugElement.injector.get(RecipeListService);
    idbService = fixture.debugElement.injector.get(IndexedDatabaseService);
    // modalService = fixture.debugElement.injector.get(NgbModal);
    progressService = fixture.debugElement.injector.get(ProgressService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onInit network status true', () => {
    component.networkStatus = true;
    const subjectUser = new Subject<User>();
    subjectUser.next(user);
    spyOn(authService, 'authorized').and.returnValue(subjectUser);
    const user$ = authService.authorized();

    setTimeout(() => {
      expect(authService.authorized).toHaveBeenCalled();
      user$.subscribe((userR) => {
        expect(component.appAssociate.name).toBe(userR.name);
        expect(component.currentUser).toBe(userR);
      });
    }, 1500);

    const subjectLocation = new Subject();
    subjectLocation.next(location);
    spyOn(component, 'getAppProperty').and.returnValue(subjectLocation);
    const location$ = component.getAppProperty('location');
    setTimeout(() => {
      expect(component.getAppProperty).toHaveBeenCalled();
      location$.subscribe( (data) => {
        expect(component.appLocation).toBe(data as LocationModel);
      });
    }, 2000);

    const subjectAssocList = new Subject();
    subjectAssocList.next(user);
    spyOn(idbService, 'getLocationsOrUsersFromIdb').and.returnValue(subjectAssocList);
    const assocList$ = idbService.getLocationsOrUsersFromIdb('users');
    setTimeout(() => {
      expect(idbService.getLocationsOrUsersFromIdb).toHaveBeenCalled();
      assocList$.subscribe((data) => {
        expect(component.associateList).toContain(data as User);
      });
    }, 2500);
  });

  it('onInit network status false', () => {
    component.networkStatus = false;
    const subject = new Subject();
    subject.next(user);
    spyOn(component, 'getAppProperty').and.returnValue(subject);
    const user$ = component.getAppProperty('user');
    spyOn(console, 'log');

    setTimeout(() => {
      // expect(console.log).toHaveBeenCalled();
      expect(component.getAppProperty).toHaveBeenCalled();
      user$.subscribe((userR) => {
        expect(component.appAssociate).toBe(userR as User);
        expect(component.currentUser).toBe(userR as User);
      });
    }, 3000);
  });

  it('should log out', () => {
    spyOn(recipeListService, 'saveUsersToIdb').withArgs(user);
    spyOn(authService, 'logout');

    component.logout();

    setTimeout(() => {
      expect(recipeListService.saveUsersToIdb).toHaveBeenCalled();
    }, 1000);
    setTimeout(() => {
      expect(authService.logout).toHaveBeenCalled();
    }, 1500);

  });

  it('open help modal', () => {
    const modalService = fixture.debugElement.injector.get(NgbModal);
    spyOn(modalService, 'open');

    component.openHelp('content');

    expect(modalService.open).toHaveBeenCalled();
  });

  it('should open app location - return location empty', () => {
    const modalServiceRef = {
      componentInstance: {},
      result: Promise.resolve('')
    };
    const modalService = jasmine.createSpyObj('NgbModal', {open: modalServiceRef});
    const result$ = modalService.open();
    spyOn(component, 'openAppLocation');
    spyOn(console, 'log');
    const subject = new Subject();
    subject.next(location);
    spyOn(component, 'getAppProperty').and.returnValue(subject);
    const appPropertyData$ = component.getAppProperty('location');

    component.openAppLocation();

    expect(modalService.open).toHaveBeenCalled();
    result$.result.then((locationR) => {
      expect(locationR).toBe('');
      expect(component.openAppLocation).toHaveBeenCalled();
    },
      (reason) => {
      expect(component.closeResult).toContain(reason);
      expect(console.log).toHaveBeenCalled();
      expect(component.getAppProperty).toHaveBeenCalled();
      appPropertyData$.subscribe((data) => {
        expect(component.appLocation).toBe(data);
      });
      expect(component.isShowAlert).toBe(false);
      });
  });

  it('should open app location - return location is object', () => {
    const modalServiceRef = {
      componentInstance: {},
      result: Promise.resolve(location)
    };
    const modalService = jasmine.createSpyObj('NgbModal', {open: modalServiceRef});
    const result$ = modalService.open();
    spyOn(component, 'saveAppProperty');
    const subject = new Subject();
    subject.next(user);
    spyOn(idbService, 'saveAppPropertyToIdb').withArgs('user', user).and.returnValue(subject);

    component.openAppLocation();

    expect(modalService.open).toHaveBeenCalled();
    result$.result.then((locationR) => {
      expect(typeof locationR).toBe('object');
      expect(component.saveAppProperty).toHaveBeenCalled();
      expect(idbService.saveAppPropertyToIdb).toHaveBeenCalled();
      expect(component.isShowAlert).toBe(false);
    });
  });

  it('is app config input error - undefined', () => {
    const config = undefined;
    spyOn(component, 'isAppConfigInputError').and.returnValue(true);
    const result = component.isAppConfigInputError(config);

    component.isAppConfigInputError(config);

    expect(component.isAppConfigInputError).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('get dismiss reason', () => {
    let reason;

    expect(component.getDismissReason(reason)).toContain('with:');

    reason = ModalDismissReasons.ESC;
    expect(component.getDismissReason(reason)).toEqual('by pressing ESC');

    reason = ModalDismissReasons.BACKDROP_CLICK;
    expect(component.getDismissReason(reason)).toEqual('by clicking on a backdrop');
  });

  it('get app property', () => {
    const subjectReturn = new Subject<any>();
    const subject = new Subject();
    subject.next(location);
    spyOn(idbService, 'getAppPropertyFromIdb').withArgs('location').and.returnValue(subject);
    const appProperty$ = idbService.getAppPropertyFromIdb('location');
    progressService.loading = false;
    spyOn(component, 'openAppLocation');

    component.getAppProperty('location');

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    appProperty$.subscribe((value) => {
      subjectReturn.next(value);
    },
      () => {},
      () => {
      expect(component.openAppLocation).toHaveBeenCalled();
      });
  });

  it('save app property - location', () => {
    const property = 'location';
    const subject = new Subject();
    subject.next(location);
    spyOn(idbService, 'saveAppPropertyToIdb').withArgs(property, location).and.returnValue(subject);
    const appProperty$ = idbService.saveAppPropertyToIdb(property, location);

    component.saveAppProperty(property, location);
    appProperty$.subscribe(() => {
      // expect(window.location.reload).toHaveBeenCalled();
      expect(component).toBeTruthy();
    },
      () => {
      expect(errService.add).toHaveBeenCalled();
      });
  });

  it('save app property - user', () => {
    const property = 'user';
    const subject = new Subject();
    subject.next(user);
    spyOn(idbService, 'saveAppPropertyToIdb').withArgs(property, user).and.returnValue(subject);
    const appProperty$ = idbService.saveAppPropertyToIdb(property, user);

    component.saveAppProperty(property, user);
    appProperty$.subscribe((data) => {
        expect(component.appAssociate).toBe(data as User);
      });
  });

  it('refresh idb data', () => {
    const subject = new Subject();
    subject.next(true);
    spyOn(component, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = component.isRefreshMoreThanOneDay();
    spyOn(component, 'refreshObjectStores');

    component.refreshIdbData();

    expect(component.isRefreshMoreThanOneDay).toHaveBeenCalled();
    flag$.subscribe((flag) => {
      expect(flag).toBe(true);
      expect(component.refreshObjectStores).toHaveBeenCalled();
    });
  });

  it('is refresh more than one day', () => {
    const lastUpdate = moment();
    const subjectReturn = new Subject();
    const subject = new Subject();
    subject.next(lastUpdate);
    spyOn(idbService, 'getAppPropertyFromIdb').withArgs('idbLastUpdate').and.returnValue(subject);
    const update$ = idbService.getAppPropertyFromIdb('idbLastUpdate');

    component.isRefreshMoreThanOneDay();

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    update$.subscribe(() => {
      subjectReturn.next(false);
    },
      (error) => {
      subjectReturn.next(error);
      });
  });

  it('refresh object stores', () => {
    const subject = new Subject();
    subject.next('message');
    spyOn(idbService, 'clearObjectStoreData').and.returnValue(subject);
    const msg$ = idbService.clearObjectStoreData('recipes');
    spyOn(console, 'log');
    spyOn(recipeListService, 'saveRecipesToIdb');

    component.refreshObjectStores();

    expect(idbService.clearObjectStoreData).toHaveBeenCalled();
    msg$.subscribe((msg) => {
      expect(console.log).toHaveBeenCalled();
      expect(console.log.toString).toContain(msg);
      expect(recipeListService.saveRecipesToIdb).toHaveBeenCalled();
    },
      (error) => {
      expect(console.log).toHaveBeenCalled();
      expect(console.log.toString).toContain(error);
      });
  });

});
