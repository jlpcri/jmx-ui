import {AuthService} from '../auth.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {ModalDismissReasons, NgbModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ErrorService} from '../error/error.service';
import {ProgressService} from '../progress-bar/shared/progress.service';
import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {HeaderComponent} from './header.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of, Subject} from 'rxjs';
import {User} from '../shared/user.model';
import {LocationModel} from '../shared/location.model';
import {HttpResponse} from '@angular/common/http';
import * as moment from 'moment';


describe('HeaderComponent', () => {
  let fixture;
  let component;
  let componentSpy: jasmine.SpyObj<HeaderComponent>;
  let authService: AuthService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let recipeListService: RecipeListService;
  let recipeListServiceSpy: jasmine.SpyObj<RecipeListService>;
  let idbService: IndexedDatabaseService;
  let idbServiceSpy: jasmine.SpyObj<IndexedDatabaseService>;
  let modalService: NgbModal;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let errorService: ErrorService;
  let errorServiceSpy: jasmine.SpyObj<ErrorService>;
  let progressService: ProgressService;
  let progressServiceStub: Partial<ProgressService>;


  const expectedUser: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };
  const expectedLocation: LocationModel = {
    name: 'kurevapes',
    storeLocation: '144th street omaha ne'
  };
  let mockModalRef = {
    componentInstance: {
      errors: []
    },
    result: Promise.resolve(expectedLocation)
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['authorized']);
    recipeListServiceSpy = jasmine.createSpyObj('RecipeListService',
      ['saveUsersToIdb', 'saveRecipesToIdb']);
    idbServiceSpy = jasmine.createSpyObj('IndexedDatabaseService',
      ['getLocationsOrUsersFromIdb']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', {open: mockModalRef});
    errorServiceSpy = jasmine.createSpyObj('ErrorService', ['add']);
    progressServiceStub = {
      loading: false,
      progressValue: 0,
      progressMessage: 'Loading Data ...',
      height: '2rem'
    };
    componentSpy = jasmine.createSpyObj('HeaderComponent', [
      'isAppConfigInputError', 'getAppProperty', 'openAppLocation'
    ]);

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        HttpClientTestingModule, NgbModule
      ],
      providers: [
        { provide: AuthService, userValue: authServiceSpy },
        { provide: RecipeListService, userValue: recipeListServiceSpy},
        { provide: IndexedDatabaseService, userValue: idbServiceSpy},
        { provide: NgbModal, userValue: modalServiceSpy},
        { provide: ErrorService, userValue: errorServiceSpy},
        { provide: ProgressService, userValue: progressServiceStub},
        { provide: HeaderComponent, userValue: componentSpy},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    recipeListService = TestBed.inject(RecipeListService);
    idbService = TestBed.inject(IndexedDatabaseService);
    modalService = TestBed.inject(NgbModal);
    errorService = TestBed.inject(ErrorService);
    progressService = TestBed.inject(ProgressService);

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  xit('ngOnInit', fakeAsync(() => {
    component.networkStatus = true;

    authServiceSpy.authorized.and.returnValue(of(expectedUser));

    // @ts-ignore
    idbServiceSpy.getLocationsOrUsersFromIdb.withArgs('user').and.returnValue(of(expectedUser));
    // @ts-ignore
    idbServiceSpy.getLocationsOrUsersFromIdb.withArgs('location').and.returnValue(of(expectedLocation));
    const subject = new Subject();
    subject.next(expectedLocation);
    componentSpy.getAppProperty.and.returnValue(subject);
    mockModalRef = modalService.open('content');

    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    const resp = new HttpResponse();

    component.ngOnInit();

    tick(500);
    authService.authorized();

    tick(1000);
    component.getAppProperty('location');

    tick(1500);
    idbService.getLocationsOrUsersFromIdb('user');
    idbService.getLocationsOrUsersFromIdb('location');

    tick(2000);
    recipeListService.saveUsersToIdb(expectedUser);

    tick(2500);
    authService.logout();
    httpClientSpy.get.and.returnValue(of(resp));


    flush();

  }));

  xit('should logout', fakeAsync(() => {
    component.currentUser = expectedUser;
    component.appLocation = expectedLocation;
    idbService.objectStoreName = 'recipes';
    recipeListServiceSpy.saveUsersToIdb.withArgs(expectedUser);
    // idbServiceSpy.syncUsers.withArgs(expectedUser);
    // componentSpy.isAppConfigInputError.and.returnValue(true);

    component.logout();

    tick(500);
    recipeListService.saveUsersToIdb(expectedUser);

    tick(1000);
    authService.logout();

    flush();
  }));

  it('is app config input error', () => {
    const loc = 'test';

    component.isAppConfigInputError(loc);
  });

  it('open help modal', () => {
    modalServiceSpy.open('content');

    component.openHelp('content');

    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('select event', () => {
    component.selectEvent();

    expect(component).toBeTruthy();
  });

  it('open app location', fakeAsync(() => {
    modalServiceSpy.open('content');
    // modalServiceSpy.open('content');

    component.openAppLocation();

    expect(modalServiceSpy.open).toHaveBeenCalled();
  }));

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
        expect(errorService.add).toHaveBeenCalled();
      });
  });

  it('save app property - user', () => {
    const property = 'user';
    const subject = new Subject();
    subject.next(expectedUser);
    spyOn(idbService, 'saveAppPropertyToIdb').withArgs(property, expectedUser).and.returnValue(subject);
    const appProperty$ = idbService.saveAppPropertyToIdb(property, expectedUser);

    component.saveAppProperty(property, expectedUser);
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
