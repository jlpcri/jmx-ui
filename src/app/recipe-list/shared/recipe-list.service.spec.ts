import {TestBed} from '@angular/core/testing';

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

describe('RecipListService', () => {
  let service: RecipeListService;
  let apiService: ApiService;
  let idbService: IndexedDatabaseService;
  let errService: ErrorService;
  let progressService: ProgressService;

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
        // { provide: ApiService, userValue: apiService},
        ProgressService,
        // { provide: IndexedDatabaseService, userValue: idbService},
        { provide: ErrorService, userValue: errService},
        HttpClient
      ]
    });
    service = TestBed.inject(RecipeListService);
    apiService = TestBed.inject(ApiService);
    idbService = TestBed.inject(IndexedDatabaseService);
    progressService = TestBed.inject(ProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('save recipes to idb', () => {
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
    const subjectRecipes = new Subject<any>();
    subjectRecipes.next(recipeList);
    const subjectSourceData = new Subject();
    subjectSourceData.next(sourceData);
    spyOn(apiService, 'get').withArgs('/jmx-ui/sourceData', null).and.returnValue(subjectSourceData);
    const sourceData$ = apiService.get('/jmx-ui/sourceData', null);
    spyOn(service, 'retrieveAllRecipes').withArgs('value').and.returnValue(subjectRecipes);
    const recipes$ = service.retrieveAllRecipes('value');
    const subjectProducts = new Subject<any>();
    subjectProducts.next({length: 1});
    spyOn(idbService, 'syncRecipes').and.returnValue(subjectProducts);
    const product$ = idbService.syncRecipes(recipeList);

    service.saveRecipesToIdb();

    expect(apiService.get).toHaveBeenCalled();
    sourceData$.subscribe((data) => {
      expect(data).toBe(sourceData);
      expect(service.sourceData).toEqual(data);
    });
    setTimeout(() => {
      expect(service.retrieveAllRecipes).toHaveBeenCalled();
      recipes$.subscribe(() => {
        expect(progressService.progressMessage).toBe('Saving Recipes...');
        expect(idbService.syncRecipes).toHaveBeenCalled();
        product$.subscribe((products) => {
          expect(products.length).toBe(1);
          expect(progressService.loading).toBe(false);
        },
          () => {
          expect(errService.add).toHaveBeenCalled();
          expect(progressService.loading).toBe(false);
          });
      });
    }, 500);
  });

  it('retrieve locations', () => {
    const options = {
      params: new HttpParams()
        .set('size', '1000')
        .set('sort', 'name')
    };
    const subject = new Subject();
    subject.next(locationList);
    spyOn(apiService, 'get').and.returnValue(subject);
    const resp$ = apiService.get('/locations', options);

    service.retrieveLocations();

    expect(apiService.get).toHaveBeenCalled();
    resp$.subscribe(() => {
      expect(console.log).toHaveBeenCalled();
    },
      () => {
      expect(errService.add).toHaveBeenCalled();
      });
  });

  it('save locations to idb',   () => {
    const subject = new Subject();
    subject.next(10);
    spyOn(idbService, 'getLocationsObjectStoreCount').and.returnValue(subject);
    const count$ = idbService.getLocationsObjectStoreCount();

    service.retrieveLocations();

    service.saveLocationsToIdb();
    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    count$.subscribe((count) => {
      expect(count).toBe(10);
      expect(console.log).toHaveBeenCalled();
    });
  });

  it('save locations to idb - count zero',   () => {
    const subject = new Subject();
    subject.next(0);
    spyOn(idbService, 'getLocationsObjectStoreCount').and.returnValue(subject);
    const count$ = idbService.getLocationsObjectStoreCount();
    const subjectLocations = new Subject();
    subjectLocations.next(locationList);
    spyOn(service, 'retrieveLocations').and.returnValue(subjectLocations);
    const locations$ = service.retrieveLocations();
    spyOn(idbService, 'syncLocations');

    service.retrieveLocations();

    service.saveLocationsToIdb();
    expect(idbService.getLocationsObjectStoreCount).toHaveBeenCalled();
    count$.subscribe((count) => {
      expect(count).toBe(0);
      expect(service.retrieveLocations).toHaveBeenCalled();
      locations$.subscribe(() => {
        expect(idbService.syncLocations).toHaveBeenCalled();
      });
    });
  });


  it('sav users to idb', () => {
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
