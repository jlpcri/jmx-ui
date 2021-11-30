import {async, ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {RecipeListComponent} from './recipe-list.component';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HeaderComponent} from '../header/header.component';
import {Observable, of, Subject, throwError} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {ErrorService} from '../error/error.service';
import {ApiService} from '../api/api.service';
import {User} from '../shared/user.model';
import {LocationModel} from '../shared/location.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import createSpyObj = jasmine.createSpyObj;
import {share} from 'rxjs/operators';
import {error} from 'protractor';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let errorService: ErrorService;
  let idbService: IndexedDatabaseService;
  let recipeListService: RecipeListService;
  let headerComponent: HeaderComponent;
  let apiService: ApiService;
  let modalService: NgbModal;

  const user: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };

  beforeEach(async(() => {
    errorService = jasmine.createSpyObj('ErrorService', ['add']);
    TestBed.configureTestingModule({
      declarations: [ RecipeListComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ErrorService, useValue: errorService},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    idbService = fixture.debugElement.injector.get(IndexedDatabaseService);
    // spyOn(idbService, 'syncUsers').withArgs(user);
    recipeListService = fixture.debugElement.injector.get(RecipeListService);
    headerComponent = fixture.debugElement.injector.get(HeaderComponent);
    apiService = fixture.debugElement.injector.get(ApiService);
    modalService = fixture.debugElement.injector.get(NgbModal);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('init get app property from idb', fakeAsync(() => {
    const dummyLocation = {name: 'name', storeLocation: 'storeLocation'};
    spyOn(idbService, 'getAppPropertyFromIdb').and.returnValue(of(dummyLocation));
    const appProperty$ = idbService.getAppPropertyFromIdb('location');

    component.ngOnInit();

    tick(500);

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    expect(component.printData.name).toEqual('');
    expect(component.printData.storeLocation).toEqual('storeLocation');
  }));

  it('select event - true',  fakeAsync(() => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay().pipe(share());
    spyOn(headerComponent, 'refreshObjectStores');

    component.selectEvent({name: 'name', labelKey: 'label'});

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    tick();

    flag$.subscribe(flag => {
      expect(flag).toBe(true);
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
    });

  }));

  it('select event - false', fakeAsync(() => {
    const subject = new Subject();
    subject.next(false);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(component, 'selectEventFetchData');

    component.selectEvent({name: 'name', labelKey: 'label'});

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    tick();
    flag$.subscribe(flag => {
      expect(flag).toBe(false);
      expect(component.selectEventFetchData).toHaveBeenCalled();
    });
  }));

  it('select event - error', fakeAsync(() => {
    const subject = new Subject<any>();
    subject.next(throwError({status: '404'}));
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(headerComponent, 'refreshObjectStores');

    component.selectEvent({name: 'name', labelKey: 'label'});

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    tick();
    flag$.subscribe(() => {},
      () => {
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
      });
  }));

  it('select event fetch data', fakeAsync(() => {
    const spinner = fixture.debugElement.injector.get(NgxSpinnerService);
    const subject = new Subject();
    subject.next([
      {
        bottleSize: '10ml',
        nicStrength: 3
      }
    ]);
    subject.next(throwError({status: 404}));
    subject.next(Promise.resolve());
    spyOn(idbService, 'getProductSizeNicStrength').withArgs('label').and.returnValue(subject);
    const data$ = idbService.getProductSizeNicStrength('label');
    spyOn(component, 'getRecipeContents');
    spyOn(console, 'log');

    component.selectEventFetchData({name: 'name', labelKey: 'label'});

    expect(idbService.getProductSizeNicStrength).toHaveBeenCalled();
    tick();
    data$.subscribe(() => {
      expect(component.getRecipeContents).toHaveBeenCalled();
      expect(spinner.hide).toHaveBeenCalled();
    },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      expect(spinner.hide).toHaveBeenCalled();
      },
      () => {
      expect(console.log).toHaveBeenCalledWith('getProductSizeNicStrength');
      });
    flush();
  }));

  it('on change search', fakeAsync(() => {
    const subject = new Subject();
    subject.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}, 'error'
    ]);
    subject.next(throwError({status: 404}));

    spyOn(idbService, 'getProductNameList').and.returnValue(subject);
    const name$ = idbService.getProductNameList('name');

    component.onChangeSearch('prime');
    expect(idbService.getProductNameList).toHaveBeenCalled();
    tick();
    name$.subscribe(() => {
      expect(component.isLoadingNameListFirst).toBe(false);
    },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      });
  }));

  it('on change search - empty', () => {
    spyOn(idbService, 'getProductNameList');

    component.onChangeSearch('');

    fixture.detectChanges();
    expect(idbService.getProductNameList).not.toHaveBeenCalled();
    expect(component.isLoadingNameListFirst).toBe(false);
  });

  it('on input cleared', () => {
    spyOn(component, 'resetSizeStrengthRecipes');
    component.onInputCleared();

    expect(component.searchItemSecond).toEqual('');
    expect(component.resetSizeStrengthRecipes).toHaveBeenCalled();

  });

  it('select event second', fakeAsync(() => {
    const subject = new Subject();
    subject.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}
    ]);
    spyOn(idbService, 'getProductNameListByComponent').withArgs('prime').and.returnValue(subject);
    const name$ = idbService.getProductNameListByComponent('prime');

    component.selectEventSecond({name: 'prime'});

    expect(idbService.getProductNameListByComponent).toHaveBeenCalled();
    tick();
    name$.subscribe(() => {
      expect(component.isLoadingNameListFirst).toBe(false);
      tick(1000);
      expect(component.autocompleteFirst.focus).toHaveBeenCalled();
    });
  }));

  it('on change search second', fakeAsync(() => {
    const subject = new Subject();
    subject.next({
      id: 123,
      name: 'name'
    });

    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);
    const name$ = idbService.getComponentNameList('prime');
    spyOn(component, 'notExistInArray').and.callThrough();

    component.onChangeSearchSecond('prime');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    tick();
    expect(component.notExistInArray).not.toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toBe(true);
    expect(errorService.add).not.toHaveBeenCalled();
  }));

  it('on change search second - error', fakeAsync(() => {
    const subject = new Subject();
    subject.next(throwError({status: 404}));

    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);
    const name$ = idbService.getComponentNameList('prime');

    component.onChangeSearchSecond('prime');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    tick();
    expect(component.isLoadingNameListSecond).toBe(true);
    expect(errorService.add).not.toHaveBeenCalled();
  }));

  it('on change search second - error in nameList', fakeAsync(() => {
    const subject = new Subject();
    subject.next('error');
    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);
    const name$ = idbService.getComponentNameList('prime');
    spyOn(component, 'notExistInArray');

    component.onChangeSearchSecond('prime');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    tick();
    expect(component.notExistInArray).not.toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toBe(true);
  }));

  it('on change search second - empty', fakeAsync(() => {
    const subject = new Subject();
    subject.next({
      id: 123,
      name: 'name'
    });
    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);

    component.onChangeSearchSecond('');
    tick();
    expect(idbService.getComponentNameList).not.toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toEqual(false);
  }));

  it('on input clear second', () => {
    spyOn(component, 'resetSizeStrengthRecipes');
    component.onInputClearedSecond();

    expect(component.searchItem).toEqual('');
    expect(component.resetSizeStrengthRecipes).toHaveBeenCalled();
  });

  it('save recipes to idb', () => {
    spyOn(recipeListService, 'retrieveAllRecipes').withArgs('value');
    spyOn(recipeListService, 'saveRecipesToIdb');
    component.saveRecipesToIdb();

    expect(recipeListService.saveRecipesToIdb).toHaveBeenCalled();
  });

  it('save location to idb', fakeAsync(() => {
    const subject = new Subject<any>();
    subject.next(10);
    spyOn(recipeListService, 'saveLocationsToIdb');
    spyOn(idbService, 'getLocationsObjectStoreCount').and.returnValue(subject);
    const count$ = idbService.getLocationsObjectStoreCount();

    component.saveLocationsToIdb();
    tick();

    expect(recipeListService.saveLocationsToIdb).toHaveBeenCalled();
    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    count$.subscribe((count) => {
      expect(count).toBe(10);
    });
  }));

  it('not exist in array - true', () => {
    const arr = [
      { id: 0, name: 'Blueberry lemon 960ml 0mg'},
    ];
    const key = 'name';
    const value = 'Strawberry Daiquiri 960ml 0mg';

    expect(component.notExistInArray(arr, key, value)).toEqual(true);
  });

  it('not exist in array - false', () => {
    const arr = [
      { id: 1, name: 'Strawberry 960ml 0mg'}
    ];
    const key = 'name';
    const value = 'Strawberry 960ml 0mg';

    expect(component.notExistInArray(arr, key, value)).toEqual(false);
  });

  it('change size', () => {
    component.productSizeStrengths = {
      0: ['0', '3', '6'],
      3: ['6', '3', '0']
    };
    component.strengthRadioButtons = ['0', '3', '6'];
    component.nicStrengthSelected = '0';
    spyOn(component, 'getRecipeContents');

    component.changeSize('3');

    expect(component.getRecipeContents).toHaveBeenCalled();
  });

  it('change strength', () => {
    spyOn(component, 'getRecipeContents');
    component.changeStrength('3');

    expect(component.getRecipeContents).toHaveBeenCalled();

  });

  it('get recipe contents', fakeAsync(() => {
    const labelKey = 'blueberry';
    const size = '10';
    const strength = '3';
    const subject = new Subject<any>();
    subject.next([
      { ingredients: 'first', percentage: 33, color: 'red'}
    ]);
    const subjectPrintData = new Subject();
    subjectPrintData.next({
      name: 'name',
      sku: '12345',
      size: '10ml',
      strength: '3mg'
    });
    const subjectAppProperty = new Subject();
    subjectAppProperty.next({
      name: 'amv center',
      storeLocation: 'amvholdings'
    });
    const searchName = 'berry';
    spyOn(idbService, 'getRecipesFromIdb').and.returnValue(subject);
    const recipes$ = idbService.getRecipesFromIdb('product', searchName);
    spyOn(idbService, 'getProductPrintData').and.returnValue(subjectPrintData);
    const printData$ = idbService.getProductPrintData(searchName);
    spyOn(idbService, 'getAppPropertyFromIdb').and.returnValue(subjectAppProperty);
    const appProperty$ = idbService.getAppPropertyFromIdb('location');

    component.getRecipeContents(labelKey, size, strength);

    tick();
    expect(idbService.getRecipesFromIdb).toHaveBeenCalled();
    recipes$.subscribe((recipes) => {
      expect(component.recipes).toBe(recipes);
      });
    expect(errorService.add).not.toHaveBeenCalled();
    expect(idbService.getProductPrintData).toHaveBeenCalled();
    printData$.subscribe((data) => {
      expect(component.printData.name).toBe(data.name);
      expect(component.printData.sku).toBe(data.sku);
      expect(component.printData.size).toBe(data.size);
      expect(component.printData.strength).toBe(data.strength);
    });
    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    appProperty$.subscribe((location) => {
      expect(component.printData.name).toBe(location.name);
      expect(component.printData.storeLocation).toBe(location.storeLocation);
    });
  }));

  it('reset size strength recipes', () => {
    component.resetSizeStrengthRecipes();

    expect(component).toBeTruthy();
  });

  it('open bottle scan - true', fakeAsync(() => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(headerComponent, 'refreshObjectStores');

    component.openBottleScan();

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    tick();
    expect(headerComponent.refreshObjectStores).not.toHaveBeenCalled();

    flag$.subscribe((flag) => {
      expect(flag).toBe(true);
    });
  }));

  it('open bottle scan - false', fakeAsync(() => {
    const subject = new Subject();
    subject.next(false);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(component, 'openBottleScanUser');

    component.openBottleScan();

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    tick();
    expect(component.openBottleScanUser).not.toHaveBeenCalled();

    flag$.subscribe((flag) => {
      expect(flag).toBe(false);
    });
  }));

  it('open bottle scan user', fakeAsync(() => {
    const subject = new Subject();
    subject.next(user);
    spyOn(headerComponent, 'getAppProperty').and.returnValue(subject);
    const user$ = headerComponent.getAppProperty('user');
    spyOn(component, 'openBottleScanLocation');

    component.openBottleScanUser();

    expect(headerComponent.getAppProperty).toHaveBeenCalled();
    tick();

    expect(component.openBottleScanLocation).not.toHaveBeenCalled();

    user$.subscribe((userR) => {
      expect(component.user).toBe(userR);
    });
    expect(errorService.add).not.toHaveBeenCalled();
  }));

  it('open bottle scan location', fakeAsync(() => {
    component.scanData.scanCode = '(01)***********002(10)25852';
    const location: LocationModel = {
      name: 'amv headquarter',
      storeLocation: '144th street omaha NE'
    };
    const subject = new Subject();
    subject.next(location);
    spyOn(idbService, 'getAppPropertyFromIdb').and.returnValue(subject);
    const location$ = idbService.getAppPropertyFromIdb('location');
    const inputData = {};
    const modalServiceRef = {
      componentInstance: {},
      result: Promise.resolve(inputData)
    };
    const modalServiceSpy = createSpyObj('NgbModal', {open: modalServiceRef});
    const result$ = modalServiceSpy.open();
    spyOn(component, 'isScanDataValid');
    spyOn(component, 'openBottleScan');
    spyOn(component, 'openBottleScanConfirmation');

    component.openBottleScanLocation('content');

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    tick();
    location$.subscribe((locationR) => {
      expect(component.scanData.locationName).toBe(locationR.name);
      expect(component.scanData.productSku).toBe('25852');
      expect(component.scanData.batchId).toBe('002');
    });
    tick();
    result$.result.then(() => {
      expect(component.isScanDataValid).not.toHaveBeenCalled();
      expect(component.openBottleScan).not.toHaveBeenCalled();
      expect(component.openBottleScanConfirmation).not.toHaveBeenCalled();
    },
      (reason) => {
      expect(component.closeResult).toContain(reason);
      expect(component.isShowAlert).toBe(false);
      });
    flush();
  }));

  it('open bottle scan confirmation', fakeAsync(() => {
    const postData = {
      associateName: 'Username',
      batchId: '25852',
      eventTimestamp: '2021-11-23T12:47:47-06:00',
      locationName: 'Alohma Council Bluffs',
      productName: '',
      productSku: '0002'
    };
    const modalServiceRef = {
      componentInstance: {},
      result: Promise.resolve(postData)
    };
    const modalServiceSpy = createSpyObj('NgbModal', { open: modalServiceRef});
    const result$ = modalServiceSpy.open();
    spyOn(component, 'postBottleScanData');

    component.openBottleScanConfirmation(postData);

    result$.result.then(() => {
      expect(component.postBottleScanData).not.toHaveBeenCalled();
    },
      (reason) => {
      expect(component.closeResult).toContain(reason);
      });

  }));

  it('post bottle scan data', fakeAsync(() => {
    const postData = {
      associateName: 'Username',
      batchId: '25852',
      eventTimestamp: '2021-11-23T12:47:47-06:00',
      locationName: 'Alohma Council Bluffs',
      productName: '',
      productSku: '0002'
    };
    const subject = new Subject();
    subject.next({
      productName: 'product'
    });
    const subjectBottleScan = new Subject();
    subjectBottleScan.next(postData);
    spyOn(apiService, 'post').and.returnValue(subject);
    const data$ = apiService.post('/bottleScanEvents', postData);
    spyOn(idbService, 'getBottleScan').and.returnValue(subjectBottleScan);
    const scan$ = idbService.getBottleScan('bottleScanCommit');
    spyOn(idbService, 'addBottleScan');
    spyOn(idbService, 'updateBottleScan');

    component.postBottleScanData(postData);

    expect(apiService.post).toHaveBeenCalled();
    tick();
    expect(idbService.addBottleScan).not.toHaveBeenCalled();
    expect(errorService.add).not.toHaveBeenCalled();
    expect(idbService.addBottleScan).not.toHaveBeenCalled();

    tick();
    expect(idbService.getBottleScan).toHaveBeenCalled();
    expect(apiService.post).toHaveBeenCalled();

    tick();
    expect(idbService.updateBottleScan).not.toHaveBeenCalled();
    expect(errorService.add).not.toHaveBeenCalled();

  }));

  it('is scan data valid - true', () => {
    const data = [
      { batchId: '1234' },
      { batchId: ''}
    ];
    spyOn(component, 'isScanDataValid').withArgs(data[0]).and.returnValue(true);

    expect(component.isScanDataValid(data[0])).toEqual(true);
  });

  it('is scan data valid - false', () => {
    const data = [
      { batchId: '1234' },
      { batchId: ''}
    ];
    spyOn(component, 'isScanDataValid').withArgs(data[1]).and.returnValue(false);

    expect(component.isScanDataValid(data[1])).toEqual(false);
  });

  it('refresh idb data', fakeAsync(() => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'refreshIdbData');
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(headerComponent, 'refreshObjectStores');

    component.refreshIdbData();

    expect(headerComponent.refreshIdbData).toHaveBeenCalled();
    tick();
    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(headerComponent.refreshObjectStores).not.toHaveBeenCalled();
    flag$.subscribe((flag) => {
      expect(flag).toBe(true);
    });
  }));

});
