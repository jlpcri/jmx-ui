import {async, ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {RecipeListComponent} from './recipe-list.component';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {HeaderComponent} from '../header/header.component';
import {of, Subject} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {ErrorService} from '../error/error.service';
import {ApiService} from '../api/api.service';
import {User} from '../shared/user.model';
import {LocationModel} from '../shared/location.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import createSpyObj = jasmine.createSpyObj;
import {GlobalConstants} from '../shared/GlobalConstants';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let idbService: jasmine.SpyObj<IndexedDatabaseService>;
  let recipeListService: jasmine.SpyObj<RecipeListService>;
  let headerComponent: jasmine.SpyObj<HeaderComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let ngxSpinnerService: NgxSpinnerService;

  const user: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };

  beforeEach(async(() => {
    spyOn(console, 'log');

    errorService = jasmine.createSpyObj('ErrorService', ['add']);
    idbService = jasmine.createSpyObj('IndexedDatabaseService', Object.getOwnPropertyNames(IndexedDatabaseService.prototype));
    apiService = jasmine.createSpyObj('ApiService', Object.getOwnPropertyNames(ApiService.prototype));
    recipeListService = jasmine.createSpyObj('RecipeListService', Object.getOwnPropertyNames(RecipeListService.prototype));
    headerComponent = jasmine.createSpyObj('HeaderComponent', Object.getOwnPropertyNames(HeaderComponent.prototype));
    modalService = jasmine.createSpyObj('NgbModal', ['open']);
    ngxSpinnerService = jasmine.createSpyObj('NgxSpinnerService', ['hide', 'show']);

    // Http testing support should not be needed for anything that is using a service to make API calls
    TestBed.configureTestingModule({
      declarations: [ RecipeListComponent ],
      providers: [
        { provide: ErrorService, useValue: errorService },
        { provide: IndexedDatabaseService, useValue: idbService },
        { provide: ApiService, useValue: apiService },
        { provide: RecipeListService, useValue: recipeListService },
        { provide: HeaderComponent, useValue: headerComponent },
        { provide: NgbModal, useValue: modalService },
        { provide: NgxSpinnerService, useValue: ngxSpinnerService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('init get app property from idb', fakeAsync(() => {
    // fakeAsync should only be used with promises like setTimeout here
    const dummyLocation = {name: 'name', storeLocation: 'storeLocation'};
    idbService.getAppPropertyFromIdb.and.returnValue(of(dummyLocation));

    component.ngOnInit();

    tick(500);

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalledWith('location');
    expect(component.printData.storeName).toEqual('name');
    expect(component.printData.storeLocation).toEqual('storeLocation');
  }));

  it('select event - true', () => {
    const refresh$ = new Subject();
    headerComponent.isRefreshMoreThanOneDay.and.returnValue(refresh$);

    component.selectEvent({name: 'name', labelKey: 'label'});
    refresh$.next(true);

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
  });

  it('select event - false', () => {
    const refresh$ = new Subject();

    headerComponent.isRefreshMoreThanOneDay.and.returnValue(refresh$);
    spyOn(component, 'selectEventFetchData');

    component.selectEvent({name: 'name', labelKey: 'label'});
    refresh$.next(false);

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(component.selectEventFetchData).toHaveBeenCalled();
  });

  it('select event - error', fakeAsync(() => {
    const refresh$ = new Subject<any>();

    headerComponent.isRefreshMoreThanOneDay.and.returnValue(refresh$);
    spyOn(component, 'selectEventFetchData');

    component.selectEvent({name: 'name', labelKey: 'label'});
    refresh$.error(new Error());

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
    expect(component.selectEventFetchData).not.toHaveBeenCalled();
  }));

  it('select event fetch data', () => {
    const productSize$ = new Subject();
    spyOn(component, 'getRecipeContents');

    idbService.getProductSizeNicStrength.withArgs('label').and.returnValue(productSize$);

    component.selectEventFetchData({name: 'name', labelKey: 'label'});
    expect(ngxSpinnerService.show).toHaveBeenCalled();

    productSize$.next([
      {
        bottleSize: '10ml',
        nicStrength: 3
      }
    ]);
    expect(component.getRecipeContents).toHaveBeenCalled();
    expect(ngxSpinnerService.hide).toHaveBeenCalled();

    productSize$.complete();
    expect(console.log).toHaveBeenCalledWith('Job done');

    expect(idbService.getProductSizeNicStrength).toHaveBeenCalled();
  });

  it('select event fetch data - error', () => {
    spyOn(component, 'getRecipeContents');
    const productSize$ = new Subject();

    idbService.getProductSizeNicStrength.withArgs('label').and.returnValue(productSize$);

    component.selectEventFetchData({name: 'name', labelKey: 'label'});
    expect(ngxSpinnerService.show).toHaveBeenCalled();

    productSize$.error(new Error());
    productSize$.complete();
    expect(component.getRecipeContents).not.toHaveBeenCalled();
    expect(errorService.add).toHaveBeenCalled();
    expect(ngxSpinnerService.hide).toHaveBeenCalled();

    expect(console.log).not.toHaveBeenCalled();

    expect(idbService.getProductSizeNicStrength).toHaveBeenCalled();
  });

  it('on change search', () => {
    const productNames$ = new Subject();

    idbService.getProductNameList.and.returnValue(productNames$);

    component.onChangeSearch('test search');
    productNames$.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}, 'error'
    ]);

    expect(idbService.getProductNameList).toHaveBeenCalledWith('test-search');
    expect(component.isLoadingNameListFirst).toBe(false);
    expect(errorService.add).not.toHaveBeenCalled();

  });

  it('on change search - error', () => {
    const productNames$ = new Subject();

    idbService.getProductNameList.and.returnValue(productNames$);

    component.onChangeSearch('test search');
    productNames$.error(new Error());
    expect(idbService.getProductNameList).toHaveBeenCalledWith('test-search');
    expect(component.isLoadingNameListFirst).toBe(true);
    expect(errorService.add).toHaveBeenCalled();
  });

  it('on change search - empty', () => {
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

  it('select event second', fakeAsync(() => {
    const productName = { label: 'blueberry juice', labelKey: 'blueberry-juice'};
    const productName$ = new Subject();

    idbService.getProductNameListByComponent.withArgs('prime').and.returnValue(productName$);

    spyOn(component.autocompleteFirst.nativeElement, 'focus');

    component.selectEventSecond({name: 'prime'});
    productName$.next(productName);

    expect(idbService.getProductNameListByComponent).toHaveBeenCalled();
    expect(component.firstNameList).toEqual([{name: productName.label, labelKey: productName.labelKey }]);
    expect(component.isLoadingNameListFirst).toBe(false);

    expect(component.autocompleteFirst.nativeElement.focus).not.toHaveBeenCalled();
    tick(1000);
    expect(component.autocompleteFirst.nativeElement.focus).toHaveBeenCalled();

    flush();
  }));

  it('on change search second', () => {
    const componentName$ = new Subject();

    idbService.getComponentNameList.and.returnValue(componentName$);

    component.onChangeSearchSecond('prime');

    expect(component.isLoadingNameListSecond).toBe(true);

    componentName$.next({
      id: 123,
      name: 'name'
    });

    expect(idbService.getComponentNameList).toHaveBeenCalledWith('prime');
    expect(component.isLoadingNameListSecond).toBe(false);
    expect(errorService.add).not.toHaveBeenCalled();
  });

  it('on change search second - error', fakeAsync(() => {
    const componentName$ = new Subject();
    componentName$.error(new Error());
    idbService.getComponentNameList.and.returnValue(componentName$);

    component.onChangeSearchSecond('prime');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toBe(true);
    expect(errorService.add).toHaveBeenCalled();
  }));

  it('on change search second - error in nameList', () => {
    const componentName$ = new Subject();

    idbService.getComponentNameList.and.returnValue(componentName$);

    component.onChangeSearchSecond('prime');
    componentName$.next('error');

    expect(idbService.getComponentNameList).toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toBe(false);
    expect(errorService.add).not.toHaveBeenCalled();
  });

  it('on change search second - empty', () => {
    const componentName$ = new Subject();
    componentName$.next({
      id: 123,
      name: 'name'
    });
    idbService.getComponentNameList.and.returnValue(componentName$);

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
    component.saveRecipesToIdb();
    expect(recipeListService.saveRecipesToIdb).toHaveBeenCalled();
  });

  it('save location to idb', () => {
    component.saveLocationsToIdb();
    expect(recipeListService.saveLocationsToIdb).toHaveBeenCalled();
  });


  it('change size', () => {
    spyOn(component, 'getRecipeContents');
    component.searchItem = {
      labelKey: 'itemKey'
    };
    component.productSizeStrengths = {
      0: ['0', '3', '6'],
      3: ['6', '3', '0']
    };
    component.strengthRadioButtons = ['0', '3', '6'];
    component.nicStrengthSelected = '6';

    component.changeSize('3');

    expect(component.getRecipeContents).toHaveBeenCalledWith('itemKey', '3', '0');
  });

  it('change strength', () => {
    spyOn(component, 'getRecipeContents');
    component.searchItem = {
      labelKey: 'itemKey'
    };
    component.bottleSizeSelected = '60';
    component.changeStrength('3');

    expect(component.getRecipeContents).toHaveBeenCalledWith('itemKey', '60', '3');
  });

  it('get recipe contents', fakeAsync(() => {
    const labelKey = 'blueberry';
    const size = '10';
    const strength = '3';
    const recipes$ = new Subject<any>();

    const printData$ = new Subject();

    const appProperty$ = new Subject();

    idbService.getRecipesFromIdb.and.returnValue(recipes$);
    idbService.getProductPrintData.and.returnValue(printData$);
    idbService.getAppPropertyFromIdb.and.returnValue(appProperty$);

    component.getRecipeContents(labelKey, size, strength);

    expect(idbService.getRecipesFromIdb).toHaveBeenCalledWith(GlobalConstants.indexProductKey, 'blueberry:10:3');

    const recipes = [
      { ingredients: 'first', percentage: 33, color: 'red', quantity: 1}
    ];
    recipes$.next(recipes);

    expect(component.recipes).toBe(recipes);
    expect(idbService.getProductPrintData).toHaveBeenCalled();
    const printData = {
      name: 'name',
      sku: '12345',
      size: '10ml',
      strength: '3mg'
    };
    printData$.next(printData);

    expect(component.printData.name).toBe(printData.name);
    expect(component.printData.sku).toBe(printData.sku);
    expect(component.printData.size).toBe(printData.size);
    expect(component.printData.strength).toBe(printData.strength);
    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();

    const location = {
      name: 'amv center',
      storeLocation: 'amvholdings'
    };
    appProperty$.next(location);

    expect(component.printData.storeName).toBe(location.name);
    expect(component.printData.storeLocation).toBe(location.storeLocation);

    expect(errorService.add).not.toHaveBeenCalled();
  }));

  it('reset size strength recipes', () => {
    // If all this does is reset data, actually verify that data is reset.
    component.bottleSizeSelected = 'bottleSize';
    component.nicStrengthSelected = 'nicStrength';
    component.sizeRadioButtons = ['0'];
    component.strengthRadioButtons = ['0'];

    component.firstNameList = ['first'];
    component.secondNameList = ['second'];
    component.recipes = [{ ingredients: 'first', percentage: 33, color: 'red', quantity: 1}];
    component.recipeRectangles = ['rectangle'];
    component.printData.name = 'name';
    component.resetSizeStrengthRecipes();

    expect(component.bottleSizeSelected).toEqual('');
    expect(component.nicStrengthSelected).toEqual('');
    expect(component.sizeRadioButtons).toEqual([]);
    expect(component.strengthRadioButtons).toEqual([]);

    expect(component.firstNameList).toEqual([GlobalConstants.nameListInitial]);
    expect(component.secondNameList).toEqual([]);
    expect(component.recipes).toEqual([]);
    expect(component.recipeRectangles).toEqual([]);
    expect(component.printData.name).toEqual('');
  });

  it('open bottle scan - true', () => {
    spyOn(component, 'openBottleScanUser');
    const refresh$ = new Subject();

    headerComponent.isRefreshMoreThanOneDay.and.returnValue(refresh$);

    component.openBottleScan();
    refresh$.next(true);

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(headerComponent.refreshObjectStores).toHaveBeenCalled();
    expect(component.openBottleScanUser).not.toHaveBeenCalled();
  });

  it('open bottle scan - false', () => {
    const refresh$ = new Subject();

    headerComponent.isRefreshMoreThanOneDay.and.returnValue(refresh$);

    spyOn(component, 'openBottleScanUser');

    component.openBottleScan();
    refresh$.next(false);

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
    expect(headerComponent.refreshObjectStores).not.toHaveBeenCalled();
    expect(component.openBottleScanUser).toHaveBeenCalled();
  });

  it('open bottle scan user', fakeAsync(() => {
    const user$ = new Subject();

    headerComponent.getAppProperty.and.returnValue(user$);
    spyOn(component, 'openBottleScanLocation');

    component.openBottleScanUser();

    expect(headerComponent.getAppProperty).toHaveBeenCalledWith('user');
    user$.next(user);
    expect(component.user).toBe(user);
    expect(component.openBottleScanLocation).toHaveBeenCalled();

    expect(errorService.add).not.toHaveBeenCalled();
  }));

  it('open bottle scan location', fakeAsync(() => {
    component.scanData.scanCode = '(01)***********002(10)25852';
    component.user = user;
    const location: LocationModel = {
      name: 'amv headquarter',
      storeLocation: '144th street omaha NE'
    };
    const location$ = new Subject();

    idbService.getAppPropertyFromIdb.and.returnValue(location$);

    spyOn(component, 'isScanDataValid').and.returnValue(true);
    spyOn(component, 'openBottleScan');
    spyOn(component, 'openBottleScanConfirmation');

    // Modal closure must be tested separately with a reject instead of resolve.
    const modalServiceRef = createSpyObj('NgbModalRef', {}, {result: Promise.resolve({})});
    modalService.open.and.returnValue(modalServiceRef);

    component.openBottleScanLocation('content');
    location$.next(location);
    tick();

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
    expect(component.scanData.locationName).toBe(location.name);
    // These seem to have been backwards, please verify
    expect(component.scanData.productSku).toBe('002');
    expect(component.scanData.batchId).toBe('25852');

    expect(component.isScanDataValid).toHaveBeenCalled();
    expect(component.openBottleScan).not.toHaveBeenCalled();
    expect(component.openBottleScanConfirmation).toHaveBeenCalled();
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
    // Modal closure must be tested separately with a reject instead of resolve.
    const modalServiceRef = createSpyObj('NgbModalRef', {}, {result: Promise.resolve(postData)});
    modalService.open.and.returnValue(modalServiceRef);

    spyOn(component, 'postBottleScanData');

    component.openBottleScanConfirmation(postData);
    tick();
    expect(component.postBottleScanData).toHaveBeenCalledWith(postData);
  }));

  it('post bottle scan data', () => {
    const postData = {
      associateName: 'Username',
      batchId: '25852',
      eventTimestamp: '2021-11-23T12:47:47-06:00',
      locationName: 'Alohma Council Bluffs',
      productName: '',
      productSku: '0002'
    };
    const postScan$ = new Subject();
    const bottleScan$ = new Subject();

    apiService.post.and.returnValue(postScan$);
    idbService.getBottleScan.and.returnValue(bottleScan$);

    component.postBottleScanData(postData);

    expect(apiService.post).toHaveBeenCalledWith('/bottleScanEvents', postData);
    expect(apiService.post).toHaveBeenCalledTimes(1);
    postScan$.next({
      productName: 'product'
    });
    expect(idbService.addBottleScan).toHaveBeenCalled();

    expect(idbService.getBottleScan).toHaveBeenCalled();
    bottleScan$.next(postData);
    expect(apiService.post).toHaveBeenCalledTimes(2);
    postScan$.next({
      productName: 'product'
    });
    expect(idbService.updateBottleScan).toHaveBeenCalled();
    expect(errorService.add).not.toHaveBeenCalled();
  });

  it('is scan data valid', () => {
    const data = [
      { batchId: '1234' },
      { batchId: ''}
    ];

    // Must call the actual code to test the result.
    expect(component.isScanDataValid(data[0])).toBe(true);
    expect(component.isScanDataValid(data[1])).toBe(false);
  });

  it('refreshes idb data', () => {
    component.refreshIdbData();

    expect(headerComponent.refreshIdbData).toHaveBeenCalled();
  });

});
