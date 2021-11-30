import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {RecipeListService} from './recipe-list.service';
import {ApiService} from '../../api/api.service';
import {Subject} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {User} from '../../shared/user.model';
import {LocationResponseListModel, LocationResponseModel} from '../../shared/location.model';
import {RecipeModel} from './recipe.model';
import {ProgressService} from '../../progress-bar/shared/progress.service';
import {ErrorService} from '../../error/error.service';
import {SourceDataModel} from './sourcedata.model';

describe('RecipeListService', () => {
  let service: RecipeListService;
  let apiService: ApiService;
  let idbService: IndexedDatabaseService;
  let errService: ErrorService;
  let progressService: ProgressService;
  let httpClient: HttpClient;

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
  const locationList: LocationResponseListModel = {
    content: [
      location, location1
    ],
    page: {
      totalElements: 1
    }
  };

  beforeEach(() => {
    errService = jasmine.createSpyObj('ErrorService', ['add']);
    spyOn(console, 'log');
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProgressService,
        { provide: ErrorService, userValue: errService},
      ]
    });
    service = TestBed.inject(RecipeListService);
    apiService = TestBed.inject(ApiService);
    idbService = TestBed.inject(IndexedDatabaseService);
    progressService = TestBed.inject(ProgressService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  xit('save recipes to idb', fakeAsync(() => {
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
    const options = {
      params: new HttpParams()
        .set('size', '1000')
        .set('sort', 'name')
    };
    const subjectRecipes = new Subject<any>();
    subjectRecipes.next(recipeList);
    const subjectSourceData = new Subject();
    subjectSourceData.next(sourceData);
    spyOn(httpClient, 'get').withArgs('/jmx-ui/sourceData').and.returnValue(subjectSourceData);
    const sourceData$ = httpClient.get('/jmx-ui/sourceData');
    spyOn(service, 'retrieveAllRecipes').withArgs('value').and.returnValue(subjectRecipes);
    const recipes$ = service.retrieveAllRecipes('value');
    const subjectProducts = new Subject<any>();
    subjectProducts.next({length: 1});
    spyOn(idbService, 'syncRecipes').and.returnValue(subjectProducts);
    const product$ = idbService.syncRecipes(recipeList);

    service.saveRecipesToIdb();

    expect(httpClient.get).toHaveBeenCalled();

    // tick();
    sourceData$.subscribe((data) => {
      expect(data).toBe(sourceData);
      expect(service.sourceData).toEqual(data as SourceDataModel);
    });

    tick(1000);
    expect(service.retrieveAllRecipes).toHaveBeenCalled();
    tick();
    expect(idbService.syncRecipes).toHaveBeenCalled();

    recipes$.subscribe(() => {
      // expect(progressService.progressMessage).toBe('Saving Recipes...');
      product$.subscribe((products) => {
        expect(products.length).toBe(1);
        expect(progressService.loading).toBe(false);
      });
    });
    expect(errService.add).not.toHaveBeenCalled();
    expect(progressService.loading).toBe(true);

    flush();

  }));

  it('retrieve locations', fakeAsync(() => {
    const options = {
      params: new HttpParams()
        .set('size', '1000')
        .set('sort', 'name')
    };
    const subject = new Subject();
    subject.next(locationList);
    spyOn(apiService, 'get').withArgs('/locations', options).and.returnValue(subject);
    const resp$ = apiService.get('/locations', options);

    service.retrieveLocations();

    expect(apiService.get).toHaveBeenCalled();
    tick();
    expect(console.log).toHaveBeenCalled();
    expect(errService.add).not.toHaveBeenCalled();
  }));

  it('save locations to idb',   fakeAsync(() => {
    const subject = new Subject();
    subject.next(10);
    spyOn(idbService, 'getLocationsObjectStoreCount').and.returnValue(subject);
    const count$ = idbService.getLocationsObjectStoreCount();

    service.saveLocationsToIdb();

    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    tick();
    expect(console.log).toHaveBeenCalled();
    count$.subscribe((count) => {
      expect(count).toBe(10);
    });
    flush();
  }));

  it('save locations to idb - count zero',   fakeAsync(() => {
    const subject = new Subject();
    subject.next(0);
    spyOn(idbService, 'getLocationsObjectStoreCount').and.returnValue(subject);
    const count$ = idbService.getLocationsObjectStoreCount();
    const subjectLocations = new Subject();
    subjectLocations.next(locationList);
    spyOn(service, 'retrieveLocations').and.returnValue(subjectLocations);
    const locations$ = service.retrieveLocations();
    spyOn(idbService, 'syncLocations');

    service.saveLocationsToIdb();

    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    tick();
    expect(service.retrieveLocations).toHaveBeenCalled();
    tick();
    expect(idbService.syncLocations).not.toHaveBeenCalled();

    flush();
  }));


  it('save users to idb', () => {
    spyOn(idbService, 'syncUsers');
    const user: User = {
      id: 1,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      authUri: '',
      roles: ['jmx']
    };

    service.saveUsersToIdb(user);

    expect(idbService.syncUsers).toHaveBeenCalled();
  });

});
