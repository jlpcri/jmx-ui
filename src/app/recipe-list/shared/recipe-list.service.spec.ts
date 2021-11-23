import {TestBed} from '@angular/core/testing';

import {RecipeListService} from './recipe-list.service';
import {RecipeListModel} from './recipe-list.model';
import {ApiService} from '../../api/api.service';
import {Observable, of, Subject} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {User} from '../../shared/user.model';
import {LocationResponseListModel, LocationResponseModel} from '../../shared/location.model';
import {RecipeModel} from './recipe.model';

describe('RecipListService', () => {
  let service: RecipeListService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let idbServiceSpy: jasmine.SpyObj<IndexedDatabaseService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get']);
    const idbSpy = jasmine.createSpyObj('IndexedDatabaseService', ['getLocationsObjectStoreCount', 'syncUsers']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RecipeListService,
        { provide: ApiService, useValue: apiSpy },
        { provide: IndexedDatabaseService, useValue: idbSpy}
      ]
    });
    service = TestBed.inject(RecipeListService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    idbServiceSpy = TestBed.inject(IndexedDatabaseService) as jasmine.SpyObj<IndexedDatabaseService>;
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
    const recipeList: RecipeListModel = {
      totalRecipes: 1,
      recipes: [recipe]
    };

    apiServiceSpy.get.and.callFake((url: string, options: { params: HttpParams }): Observable<any> => {
      expect(url).toBe('/recipes');
      expect(options.params.get('sourceSystem')).toBe('amvpos');
      expect(options.params.get('status')).toBe('active');
      return of(recipeList);
    });

    service.saveRecipesToIdb();
    expect(service).toBeTruthy();
  });

  it('retrieve locations', () => {
    const location: LocationResponseModel = {
      name: 'amv',
      addrLine1: 'address line 1',
      addrLine2: '',
      city: 'omaha',
      state: 'NE',
      zipCode: '68112'
    };
    const locationList: LocationResponseListModel = {
      content: [
        location
      ],
      page: {
        totalElements: 1
      }
    };
    apiServiceSpy.get.and.callFake((url: string, options: {params: HttpParams}): Observable<any> => {
      expect(url).toBe('/locations');
      expect(options.params.get('sourceSystem')).toBe(null);
      expect(options.params.get('status')).toBe(null);
      return of(locationList);
    });

    service.retrieveLocations();
    expect(apiServiceSpy.get).toHaveBeenCalled();
  });

  it('save locations to idb', () => {
    const subject = new Subject();
    subject.next(10);
    idbServiceSpy.getLocationsObjectStoreCount.and.returnValue(subject);

    service.saveLocationsToIdb();
    expect(idbServiceSpy.getLocationsObjectStoreCount).toHaveBeenCalled();
  });

  it('save locations to idb - count zero', () => {
    const subject = new Subject();
    subject.next(0);
    idbServiceSpy.getLocationsObjectStoreCount.and.returnValue(subject);

    service.saveLocationsToIdb();
    expect(idbServiceSpy.getLocationsObjectStoreCount).toHaveBeenCalled();
  });

  it('sav users to idb', () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      authUri: '',
      roles: ['jmx']
    };
    service.saveUsersToIdb(user);

    expect(idbServiceSpy.syncUsers).toHaveBeenCalled();
  });

});
