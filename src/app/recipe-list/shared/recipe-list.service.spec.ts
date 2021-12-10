import {TestBed} from '@angular/core/testing';

import {RecipeListService} from './recipe-list.service';
import {ApiService} from '../../api/api.service';
import {Subject, throwError} from 'rxjs';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {User} from '../../shared/user.model';
import {LocationModel, LocationResponseListModel, LocationResponseModel} from '../../shared/location.model';
import {RecipeModel} from './recipe.model';
import {ProgressService} from '../../progress-bar/shared/progress.service';
import {ErrorService} from '../../error/error.service';
import {SourceDataModel} from './sourcedata.model';

describe('RecipeListService', () => {
  let service: RecipeListService;
  let apiService: jasmine.SpyObj<ApiService>;
  let idbService: jasmine.SpyObj<IndexedDatabaseService>;
  let errService: jasmine.SpyObj<ErrorService>;
  let progressService: jasmine.SpyObj<ProgressService>;

  const location: LocationResponseModel = {
    name: 'amv',
    addrLine1: 'address line 1',
    addrLine2: '',
    city: 'omaha',
    state: 'NE',
    zipCode: '68112'
  };
  const location1: LocationResponseModel = {
    name: 'kurevapes',
    addrLine1: '',
    addrLine2: '',
    city: 'omaha',
    state: 'NE',
    zipCode: '68112'
  };
  const locationResponseList: LocationResponseListModel = {
    content: [
      location, location1
    ],
    page: {
      totalElements: 1
    }
  };
  const locationList: LocationModel[] = [
    {
      name: 'amv',
      storeLocation: 'address line 1 , omaha NE, 68112'
    },
    {
      name: 'kurevapes',
      storeLocation: ''
    }
  ];
  const recipe: RecipeModel = {
    id: 12,
    name: 'name',
    sku: '123',
    label: 'label',
    labelKey: 'label-key',
    bottleSize: 10,
    nicStrength: 3,
    key: 'key',
    ingredients: [{name: 'name', sku: '3322', quantity: 1}],
    saltNic: true
  };
  const recipeList: RecipeModel[] = [recipe];
  const sourceData: SourceDataModel = {
    name: 'amvpos',
    value: 'value'
  };
  const recipes$ = new Subject<RecipeModel[]>();
  const sourceData$ = new Subject<SourceDataModel>();
  const products$ = new Subject<any>();

  beforeEach(() => {
    // Create service spies.  Either list method names or get full list from service class.
    errService = jasmine.createSpyObj('ErrorService', ['add']);
    apiService = jasmine.createSpyObj('ApiService', ['get', 'getRoot']);
    idbService = jasmine.createSpyObj('IndexedDatabaseService', Object.getOwnPropertyNames(IndexedDatabaseService.prototype));
    progressService = jasmine.createSpyObj('ProgressService', Object.getOwnPropertyNames(ProgressService.prototype));
    // Keep real console available
    spyOn(console, 'log');

    // Include all created spies under providers.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ErrorService, useValue: errService },
        { provide: ApiService, useValue: apiService },
        { provide: IndexedDatabaseService, useValue: idbService },
        { provide: ProgressService, useValue: progressService }
      ]
    });

    // Real service under test.
    service = TestBed.inject(RecipeListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saves recipes to idb', () => {
    apiService.getRoot.and.returnValue(sourceData$);
    idbService.syncRecipes.and.returnValue(products$);

    // use spyOn for service under test to replace only this method
    spyOn(service, 'retrieveAllRecipes').withArgs('value').and.returnValue(recipes$);

    // run method under test
    service.saveRecipesToIdb();

    // Progress set to loading because nothing has happened yet
    expect(progressService.loading).toBe(true);

    // Trigger observables in exact order they are called in the code to simulate async
    // Must happen after code is run because the subscriptions need to exist
    sourceData$.next(sourceData);
    recipes$.next(recipeList);
    products$.next(recipeList);

    // If everything happened correctly, no longer loading
    expect(progressService.loading).toBe(false);

    // Check other behavior of method under test
    expect(apiService.getRoot).toHaveBeenCalledWith('/sourceData', jasmine.anything());
    expect(service.retrieveAllRecipes).toHaveBeenCalledWith('value');
    expect(idbService.syncRecipes).toHaveBeenCalled();
    // expect(errService.add).toHaveBeenCalled();
  });

  it('saves recipes to idb - syncRecipes error', () => {
    apiService.getRoot.and.returnValue(sourceData$);
    idbService.syncRecipes.and.returnValue(products$);

    // use spyOn for service under test to replace only this method
    spyOn(service, 'retrieveAllRecipes').withArgs('value').and.returnValue(recipes$);

    // run method under test
    service.saveRecipesToIdb();

    // Progress set to loading because nothing has happened yet
    expect(progressService.loading).toBe(true);

    // Trigger observables in exact order they are called in the code to simulate async
    // Must happen after code is run because the subscriptions need to exist
    sourceData$.next(sourceData);
    recipes$.next(recipeList);
    products$.error(new Error());

    // If everything happened correctly, no longer loading
    expect(progressService.loading).toBe(false);

    // Check other behavior of method under test
    expect(apiService.getRoot).toHaveBeenCalledWith('/sourceData', jasmine.anything());
    expect(service.retrieveAllRecipes).toHaveBeenCalledWith('value');
    expect(idbService.syncRecipes).toHaveBeenCalled();
    expect(errService.add).toHaveBeenCalled();
  });

  it('retrieve locations', () => {
    const options = {
      params: new HttpParams()
        .set('size', '1000')
        .set('sort', 'name')
    };
    const locations$ = new Subject<LocationResponseListModel>();

    apiService.get.withArgs('/locations', options).and.returnValue(locations$);

    // Call code and subscribe to check result
    let result;
    service.retrieveLocations().subscribe(
      data => {
        result = data;
      }
    );

    locations$.next(locationResponseList);

    // With methods that might be reused with other arguments to do something completely
    // different, check arguments when possible
    expect(apiService.get).toHaveBeenCalledWith('/locations', options);
    expect(console.log).toHaveBeenCalled();
    expect(errService.add).not.toHaveBeenCalled();
    // Verify result that will be sent to code subscribing to the output observable
    expect(result).toEqual(locationList);
  });

  it('retrieve locations - error', () => {
    const errorResponse = new HttpErrorResponse({
      error: new ErrorEvent('errorEvent', {message: 'not found'}),
      status: 404,
      statusText: 'Not Found'
    });
    apiService.get.and.returnValue(throwError(errorResponse));

    service.retrieveLocations();

    expect(errService.add).toHaveBeenCalled();
  });


  it('save locations to idb - locations store exists', () => {
    const count$ = new Subject();

    idbService.getLocationsObjectStoreCount.and.returnValue(count$);

    service.saveLocationsToIdb();

    count$.next(10);

    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
    // Check negatives when a branch should not have run
    expect(idbService.syncLocations).not.toHaveBeenCalled();
  });

  it('save locations to idb - locations store does not exist', () => {
    const count$ = new Subject();

    idbService.getLocationsObjectStoreCount.and.returnValue(count$);

    const locations$ = new Subject<LocationModel[]>();
    spyOn(service, 'retrieveLocations').and.returnValue(locations$);

    service.saveLocationsToIdb();

    count$.next(0);
    locations$.next(locationList);

    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    expect(service.retrieveLocations).toHaveBeenCalled();
    expect(idbService.syncLocations).toHaveBeenCalled();
  });


  it('save users to idb', () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      authUri: '',
      roles: ['jmx']
    };

    service.saveUsersToIdb(user);

    expect(idbService.syncUsers).toHaveBeenCalledWith({
      name: 'John Doe',
      roles: ['jmx']
    });
  });

  xit('retrieve all recipes - totalRecipes 1', () => {
    const resp$ = new Subject();
    apiService.get.and.returnValue(resp$);

    service.retrieveAllRecipes('amvpos');

    resp$.next({recipes: recipeList, totalRecipes: 1});

    expect(apiService.get).toHaveBeenCalled();
  });

  it('retrieve all recipes - totalRecipes 2', () => {
    const resp$ = new Subject();
    apiService.get.and.returnValue(resp$);

    service.retrieveAllRecipes('amvpos');

    resp$.next({recipes: recipeList, totalRecipes: 2});

    expect(apiService.get).toHaveBeenCalled();
  });

  it('retrieve all recipes - error', () => {
    const resp$ = new Subject();
    apiService.get.and.returnValue(resp$);

    service.retrieveAllRecipes('amvpos');

    resp$.error(new Error());

    expect(apiService.get).toHaveBeenCalled();
  });

});
