import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeListComponent} from './recipe-list.component';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HeaderComponent} from '../header/header.component';
import {Subject} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {ErrorService} from '../error/error.service';
import {ApiService} from '../api/api.service';
import {User} from '../shared/user.model';
import {LocationModel} from '../shared/location.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import createSpyObj = jasmine.createSpyObj;

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
    spyOn(idbService, 'syncUsers');
    recipeListService = fixture.debugElement.injector.get(RecipeListService);
    headerComponent = fixture.debugElement.injector.get(HeaderComponent);
    apiService = fixture.debugElement.injector.get(ApiService);
    modalService = fixture.debugElement.injector.get(NgbModal);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('init get app property from idb', () => {
    const subject = new Subject<LocationModel>();
    subject.next({
      name: 'name', storeLocation: 'storeLocation'
    });
    spyOn(idbService, 'getAppPropertyFromIdb').withArgs('location').and.returnValue(subject);
    const appProperty$ = idbService.getAppPropertyFromIdb('location');

    component.ngOnInit();

    setTimeout(() => {
      expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
      appProperty$.subscribe((data) => {
        component.printData.name = data.name;
        component.printData.storeLocation = data.storeLocation;
      });
    }, 1000);
  });

  it('select event - true',  () => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(headerComponent, 'refreshObjectStores');

    component.selectEvent({name: 'name', labelKey: 'label'});

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    flag$.subscribe(flag => {
      expect(flag).toBe(true);
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
    },
      () => {
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
      });

  });

  it('select event - false', () => {
    const subject = new Subject();
    subject.next(false);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(component, 'selectEventFetchData');

    component.selectEvent({name: 'name', labelKey: 'label'});
    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    flag$.subscribe(flag => {
      expect(flag).toBe(false);
      expect(component.selectEventFetchData).toHaveBeenCalled();
    });
  });

  it('select event fetch data', () => {
    const spinner = fixture.debugElement.injector.get(NgxSpinnerService);
    const subject = new Subject();
    subject.next([
      {
        bottleSize: '10ml',
        nicStrength: 3
      }
    ]);
    spyOn(idbService, 'getProductSizeNicStrength').withArgs('label').and.returnValue(subject);
    const data$ = idbService.getProductSizeNicStrength('label');
    spyOn(component, 'getRecipeContents');
    spyOn(console, 'log');

    component.selectEventFetchData({name: 'name', labelKey: 'label'});

    expect(idbService.getProductSizeNicStrength).toHaveBeenCalled();
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
  });

  it('on change search', () => {
    const subject = new Subject();
    subject.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}, 'error'
    ]);

    spyOn(idbService, 'getProductNameList').and.returnValue(subject);
    const name$ = idbService.getProductNameList('name');

    component.onChangeSearch('prime');
    expect(idbService.getProductNameList).toHaveBeenCalled();
    name$.subscribe(() => {
      expect(component.isLoadingNameListFirst).toBe(false);
    },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      });
  });

  it('on change search - empty', () => {
    spyOn(idbService, 'getProductNameList');

    component.onChangeSearch('');
    expect(idbService.getProductNameList).not.toHaveBeenCalled();
    expect(component.isLoadingNameListFirst).toBe(false);
  });

  it('on input cleared', () => {
    spyOn(component, 'resetSizeStrengthRecipes');
    component.onInputCleared();

    expect(component.searchItemSecond).toEqual('');
    expect(component.resetSizeStrengthRecipes).toHaveBeenCalled();

  });

  it('select event second', () => {
    const subject = new Subject();
    subject.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}
    ]);
    spyOn(idbService, 'getProductNameListByComponent').and.returnValue(subject);
    const name$ = idbService.getProductNameListByComponent('prime');

    component.selectEventSecond('prime');

    expect(idbService.getProductNameListByComponent).toHaveBeenCalled();
    name$.subscribe(() => {
      expect(component.isLoadingNameListFirst).toBe(false);
      setTimeout(() => {
        expect(component.autocompleteFirst.focus).toHaveBeenCalled();
      }, 1000);
    });
  });

  it('on change search second', () => {
    const subject = new Subject();
    subject.next({
      id: 123,
      name: 'name'
    });
    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);
    const name$ = idbService.getComponentNameList('prime');

    component.onChangeSearchSecond('prime');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    name$.subscribe(() => {
      expect(component.notExistInArray).toHaveBeenCalled();
      expect(component.isLoadingNameListSecond).toBe(false);
    },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      });
  });

  it('on change search second - error in nameList', () => {
    const subject = new Subject();
    subject.next('error');
    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);
    const name$ = idbService.getComponentNameList('prime');

    component.onChangeSearchSecond('prime');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    name$.subscribe(() => {
        expect(component.notExistInArray).not.toHaveBeenCalled();
        expect(component.isLoadingNameListSecond).toBe(false);
      });
  });

  it('on change search second - empty', () => {
    const subject = new Subject();
    subject.next({
      id: 123,
      name: 'name'
    });
    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);

    component.onChangeSearchSecond('');
    expect(idbService.getComponentNameList).not.toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toEqual(false);
  });

  it('on input clear second', () => {
    spyOn(component, 'resetSizeStrengthRecipes');
    component.onInputClearedSecond();

    expect(component.searchItem).toEqual('');
    expect(component.resetSizeStrengthRecipes).toHaveBeenCalled();
  });

  it('save recipes to idb', () => {
    spyOn(recipeListService, 'saveRecipesToIdb');
    component.saveRecipesToIdb();

    expect(recipeListService.saveRecipesToIdb).toHaveBeenCalled();
  });

  it('save location to idb', () => {
    const subject = new Subject<any>();
    subject.next(10);
    spyOn(recipeListService, 'saveLocationsToIdb');
    spyOn(idbService, 'getLocationsObjectStoreCount').and.returnValue(subject);
    const count$ = idbService.getLocationsObjectStoreCount();

    component.saveLocationsToIdb();

    expect(recipeListService.saveLocationsToIdb).toHaveBeenCalled();
    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    count$.subscribe((count) => {
      expect(count).toBe(10);
    });
  });

  it('not exist in array - true', () => {
    const arr = [
      { id: 0, name: 'Blueberry lemon 960ml 0mg'},
      { id: 1, name: 'Strawberry 960ml 0mg'}
    ];
    const key = 'name';
    const value = 'Strawberry Daiquiri 960ml 0mg';

    expect(component.notExistInArray(arr, key, value)).toEqual(true);
  });

  it('not exist in array - false', () => {
    const arr = [
      { id: 0, name: 'Blueberry lemon 960ml 0mg'},
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

  it('get recipe contents', () => {
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

    expect(idbService.getRecipesFromIdb).toHaveBeenCalled();
    recipes$.subscribe((recipes) => {
      expect(component.recipes).toBe(recipes);
      },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      });
    expect(idbService.getProductPrintData).toHaveBeenCalled();
    printData$.subscribe((data) => {
      expect(component.printData.name).toBe(data.name);
      expect(component.printData.sku).toBe(data.sku);
      expect(component.printData.size).toBe(data.size);
      expect(component.printData.strength).toBe(data.strength);
    },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      });
    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    appProperty$.subscribe((location) => {
      expect(component.printData.name).toBe(location.name);
      expect(component.printData.storeLocation).toBe(location.storeLocation);
    },
      () => {},
      () => {
      expect(window.location.reload).toHaveBeenCalled();
      });
  });

  it('reset size strength recipes', () => {
    component.resetSizeStrengthRecipes();

    expect(component).toBeTruthy();
  });

  it('open bottle scan - true', () => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(headerComponent, 'refreshObjectStores');

    component.openBottleScan();

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    flag$.subscribe((flag) => {
      expect(flag).toBe(true);
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
    },
      () => {},
      () => {
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
      });
  });

  it('open bottle scan - false', () => {
    const subject = new Subject();
    subject.next(false);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(component, 'openBottleScanUser');

    component.openBottleScan();

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    flag$.subscribe((flag) => {
      expect(flag).toBe(false);
      expect(component.openBottleScanUser).toHaveBeenCalled();
    });
  });

  it('open bottle scan user', () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      authUri: '',
      roles: ['jmx']
    };
    const subject = new Subject();
    subject.next(user);
    spyOn(headerComponent, 'getAppProperty').and.returnValue(subject);
    const user$ = headerComponent.getAppProperty('user');

    component.openBottleScanUser();

    expect(headerComponent.getAppProperty).toHaveBeenCalled();
    user$.subscribe((userR) => {
      expect(component.user).toBe(userR);
      expect(component.openBottleScanLocation).toHaveBeenCalled();
    },
      () => {},
      () => {
      expect(errorService.add).toHaveBeenCalled();
      });
  });

  it('open bottle scan location', () => {
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
    spyOn(component, 'openBottleScan');
    spyOn(component, 'openBottleScanConfirmation');

    component.openBottleScanLocation('content');

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    location$.subscribe((locationR) => {
      expect(component.scanData.locationName).toBe(locationR.name);
      expect(component.scanData.productSku).toBe('25852');
      expect(component.scanData.batchId).toBe('002');
    },
      () => {
      expect(window.location.reload).toHaveBeenCalled();
      });
    result$.result.then(() => {
      // expect(component.isScanDataValid).toHaveBeenCalled();
      // expect(component.openBottleScan).toHaveBeenCalled();
      expect(component.openBottleScanConfirmation).toHaveBeenCalled();
    },
      (reason) => {
      expect(component.closeResult).toContain(reason);
      expect(component.isShowAlert).toBe(false);
      });
  });

  it('open bottle scan confirmation', () => {
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
      // expect(component.postBottleScanData).toHaveBeenCalled();
    },
      (reason) => {
      expect(component.closeResult).toContain(reason);
      });

  });

  it('post bottle scan data', () => {
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

    component.postBottleScanData(postData);

    expect(apiService.post).toHaveBeenCalled();
    data$.subscribe(() => {
      expect(idbService.addBottleScan).toHaveBeenCalled();
    },
      () => {
      expect(errorService.add).toHaveBeenCalled();
      expect(idbService.addBottleScan).toHaveBeenCalled();
      });
    expect(idbService.getBottleScan).toHaveBeenCalled();
    scan$.subscribe(() => {
      expect(apiService.post).toHaveBeenCalled();
      data$.subscribe(() => {
        expect(idbService.updateBottleScan).toHaveBeenCalled();
      },
        () => {
        expect(errorService.add).toHaveBeenCalled();
        });
    });
  });

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

  it('refresh idb data', () => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'refreshIdbData');
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    const flag$ = headerComponent.isRefreshMoreThanOneDay();
    spyOn(headerComponent, 'refreshObjectStores');

    component.refreshIdbData();

    expect(headerComponent.refreshIdbData).toHaveBeenCalled();
    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    flag$.subscribe((flag) => {
      expect(flag).toBe(true);
      expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
    });
  });

});
