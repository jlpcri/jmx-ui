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
import createSpyObj = jasmine.createSpyObj;
import {ApiService} from '../api/api.service';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('select event - true', () => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    component.selectEvent({name: 'name', labelKey: 'label'});

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
  });

  it('select event - false', () => {
    const subject = new Subject();
    subject.next(false);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);
    component.selectEvent({name: 'name', labelKey: 'label'});

    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
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

    component.selectEventFetchData({name: 'name', labelKey: 'label'});
    expect(spinner.show).toBeTruthy();
    expect(idbService.getProductSizeNicStrength).toHaveBeenCalled();
    expect(spinner.hide).toBeTruthy();
  });

  it('on change select', () => {
    const subject = new Subject();
    subject.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}, 'error'
    ]);

    spyOn(idbService, 'getProductNameList').and.returnValue(subject);
    component.onChangeSearch('prime');
    expect(idbService.getProductNameList).toHaveBeenCalled();
    expect(component.isLoadingNameListFirst).toEqual(true);
  });

  it('on change select - empty', () => {
    const subject = new Subject();
    subject.next([
      { label: 'blueberry juice', labelKey: 'blueberry-juice'}, 'error'
    ]);

    spyOn(idbService, 'getProductNameList').and.returnValue(subject);
    component.onChangeSearch('');
    expect(idbService.getProductNameList).not.toHaveBeenCalled();
    expect(component.isLoadingNameListFirst).toEqual(false);
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

    component.selectEventSecond('prime');
    expect(idbService.getProductNameListByComponent).toHaveBeenCalled();
  });

  it('on change search second', () => {
    const subject = new Subject();
    subject.next({
      id: 123,
      name: 'name'
    });
    spyOn(idbService, 'getComponentNameList').and.returnValue(subject);

    component.onChangeSearchSecond('prime');
    expect(idbService.getComponentNameList).toHaveBeenCalled();
    expect(component.isLoadingNameListSecond).toEqual(true);
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
    spyOn(recipeListService, 'saveLocationsToIdb');
    component.saveLocationsToIdb();

    expect(recipeListService.saveLocationsToIdb).toHaveBeenCalled();
  });

  it('not exist in array', () => {
    const arr = [
      { key: 'name', value: 'blueberry'},
      { key: 'name', value: 'strawberry'},
      { key: 'name', value: 'blackberry'}
    ];
    const key = 'name';
    const value = 'berry';

    expect(component.notExistInArray(arr, key, value)).toEqual(true);
  });

  it('change size', () => {
    component.productSizeStrengths = {
      0: ['0', '3', '6'],
      3: ['6', '3', '0']
    };
    component.strengthRadioButtons = ['0', '3', '6'];
    const size = '3';
    spyOn(component.productSizeStrengths[size], 'sort');
    // todo: cannot read from undefined
    // component.strengthRadioButtons[0].and.returnValue('0');
    spyOn(component, 'getRecipeContents');

    // component.changeSize('3');
    component.strengthRadioButtons = component.productSizeStrengths[size].sort();
    // nicStrengthSelected = component.strengthRadioButtons[0];

    // expect(component.getRecipeContents).toHaveBeenCalled();
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
    spyOn(idbService, 'getRecipesFromIdb').and.returnValue(subject);
    spyOn(idbService, 'getProductPrintData').and.returnValue(subjectPrintData);
    spyOn(idbService, 'getAppPropertyFromIdb').and.returnValue(subjectAppProperty);


    component.getRecipeContents(labelKey, size, strength);
    expect(idbService.getRecipesFromIdb).toHaveBeenCalled();
    expect(idbService.getProductPrintData).toHaveBeenCalled();
    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
  });

  it('reset size strength recipes', () => {
    component.resetSizeStrengthRecipes();

    expect(component).toBeTruthy();
  });

  it('open bottle scan - true', () => {
    const subject = new Subject();
    subject.next(true);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);

    component.openBottleScan();
    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
  });

  it('open bottle scan - false', () => {
    const subject = new Subject();
    subject.next(false);
    spyOn(headerComponent, 'isRefreshMoreThanOneDay').and.returnValue(subject);

    component.openBottleScan();
    expect(headerComponent.isRefreshMoreThanOneDay).toHaveBeenCalled();
  });

  it('open bottle scan user', () => {
    const subject = new Subject();
    subject.next();
    spyOn(headerComponent, 'getAppProperty').and.returnValue(subject);

    component.openBottleScanUser();
    expect(headerComponent.getAppProperty).toHaveBeenCalled();
  });

  it('open bottle scan location', () => {
    const content = 'content';
    const subject = new Subject();
    subject.next({
      name: 'amv center'
    });
    spyOn(idbService, 'getAppPropertyFromIdb').and.returnValue(subject);
    // spyOn(modalService, {open: modalServiceRef});
    component.openBottleScanLocation(content);

    expect(idbService.getAppPropertyFromIdb).toHaveBeenCalled();
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

    component.openBottleScanConfirmation(postData);
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(modalServiceSpy.open).toHaveBeenCalledTimes(0);
  });

  it('ost bottle scan data', () => {
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
    spyOn(idbService, 'getBottleScan').and.returnValue(subjectBottleScan);

    component.postBottleScanData(postData);
    expect(apiService.post).toHaveBeenCalled();
    expect(idbService.getBottleScan).toHaveBeenCalled();
  });

  it('is scan data valid', () => {
    const data = {
      field: 'name'
    };

    expect(component.isScanDataValid(data)).toEqual(true);
  });

  it('refresh idb data', () => {
    spyOn(headerComponent, 'refreshIdbData');

    component.refreshIdbData();

    expect(headerComponent.refreshIdbData).toHaveBeenCalled();
  });

});
