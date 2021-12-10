import {HeaderComponent} from './header.component';
import {async, ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {AuthService} from '../auth.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorService} from '../error/error.service';
import {ProgressService} from '../progress-bar/shared/progress.service';
import {User} from '../shared/user.model';
import {Subject} from 'rxjs';
import * as moment from 'moment';
import {GlobalConstants} from '../shared/GlobalConstants';
import createSpyObj = jasmine.createSpyObj;


describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let recipeListService: jasmine.SpyObj<RecipeListService>;
  let idbService: jasmine.SpyObj<IndexedDatabaseService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let progressService: jasmine.SpyObj<ProgressService>;

  const testUser: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };
  const testLocation = {
    name: 'kurevapes',
    storeLocation: '144th street omaha ne'
  };

  beforeEach(async(() => {
    spyOn(console, 'log');
    authService = jasmine.createSpyObj('AuthService', ['authorized', 'logout']);
    recipeListService = jasmine.createSpyObj('RecipeListService', Object.getOwnPropertyNames(RecipeListService.prototype));
    idbService = jasmine.createSpyObj('IndexedDatabaseService', Object.getOwnPropertyNames(IndexedDatabaseService.prototype));
    modalService = jasmine.createSpyObj('NgbModal', ['open']);
    errorService = jasmine.createSpyObj('ErrorService', ['add']);
    progressService = jasmine.createSpyObj('ProgressService', Object.getOwnPropertyNames(ProgressService.prototype));

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: RecipeListService, useValue: recipeListService },
        { provide: IndexedDatabaseService, useValue: idbService },
        { provide: NgbModal, useValue: modalService },
        { provide: ErrorService, useValue: errorService },
        { provide: ProgressService, useValue: progressService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('logout', fakeAsync(() => {
    recipeListService.saveUsersToIdb(testUser);
    authService.logout();

    component.logout();

    tick(500);
    expect(recipeListService.saveUsersToIdb).toHaveBeenCalled();
    tick(500);
    expect(authService.logout).toHaveBeenCalled();

    flush();
  }));

  it('open help modal', () => {
    const content = 'content';
    modalService.open(content);

    component.openHelp(content);

    expect(modalService.open).toHaveBeenCalled();
  });

  it('select event', () => {
    component.selectEvent();

    expect(component).toBeTruthy();
  });

  it('is app config input error', () => {
    component.appLocation.name = 'name';
    const result = component.isAppConfigInputError('Kurevapes');

    expect(result).toEqual(true);
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
    GlobalConstants.appPropertyLocation = 'location';
    const property$ = new Subject();
    idbService.getAppPropertyFromIdb.and.returnValue(property$);

    component.getAppProperty('location');
    property$.next(testLocation);

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalledWith('location');
  });

  it('get app property- error', () => {
    const property$ = new Subject();
    idbService.getAppPropertyFromIdb.and.returnValue(property$);
    spyOn(component, 'openAppLocation');

    component.getAppProperty('location');
    property$.error(new Error());

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalledWith('location');
    expect(component.openAppLocation).toHaveBeenCalled();
  });

  it('save app property', () => {
    const data$ = new Subject();
    idbService.saveAppPropertyToIdb.and.returnValue(data$);

    component.saveAppProperty('user', testUser);
    data$.next(testUser);

    expect(idbService.saveAppPropertyToIdb).toHaveBeenCalledWith('user', testUser);
  });

  it('save app property - error', () => {
    const data$ = new Subject();
    idbService.saveAppPropertyToIdb.and.returnValue(data$);

    component.saveAppProperty('user', testUser);
    data$.error(new Error());

    expect(idbService.saveAppPropertyToIdb).toHaveBeenCalledWith('user', testUser);
  });

  it('refresh idb data', () => {
    const flag$ = new Subject();
    spyOn(component, 'isRefreshMoreThanOneDay').and.returnValue(flag$);
    spyOn(component, 'refreshObjectStores');

    component.refreshIdbData();
    flag$.next(true);

    expect(component.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(component.refreshObjectStores).toHaveBeenCalled();
  });

  it('refresh idb data - false', () => {
    const flag$ = new Subject();
    spyOn(component, 'isRefreshMoreThanOneDay').and.returnValue(flag$);
    spyOn(component, 'refreshObjectStores');

    component.refreshIdbData();
    flag$.next(false);

    expect(component.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(component.refreshObjectStores).not.toHaveBeenCalled();
  });

  it('is refresh more than one day', () => {
    const lastUpdate = moment();
    const lastUpdate$ = new Subject();
    idbService.getAppPropertyFromIdb.and.returnValue(lastUpdate$);

    component.isRefreshMoreThanOneDay();

    lastUpdate$.next(lastUpdate);

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();

  });

  it('is refresh more than one day - error', () => {
    const lastUpdate$ = new Subject();
    idbService.getAppPropertyFromIdb.and.returnValue(lastUpdate$);

    component.isRefreshMoreThanOneDay();

    lastUpdate$.error(new Error());

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();

  });

  it('refresh object stores', () => {
    const msg$ = new Subject();
    idbService.clearObjectStoreData.and.returnValue(msg$);

    component.refreshObjectStores();
    msg$.next('message');

    expect(idbService.clearObjectStoreData).toHaveBeenCalled();
    expect(recipeListService.saveRecipesToIdb).toHaveBeenCalled();
  });

  it('refresh object stores - error', () => {
    const msg$ = new Subject();
    idbService.clearObjectStoreData.and.returnValue(msg$);

    component.refreshObjectStores();
    msg$.error(new Error());

    expect(idbService.clearObjectStoreData).toHaveBeenCalled();
    expect(recipeListService.saveRecipesToIdb).not.toHaveBeenCalled();
  });

  it('open app location', () => {
    component.locationSelect = 'kurevapes';

    const modalServiceRef = createSpyObj('NgbModalRef', {}, {result: Promise.resolve(testLocation)});
    modalService.open.and.returnValue(modalServiceRef);
    spyOn(component, 'isAppConfigInputError').withArgs(testLocation).and.returnValue(true);

    component.openAppLocation();

    expect(component.isShowAlert).toEqual(false);
  });

});
