import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpParams} from '@angular/common/http';
import {any} from 'codelyzer/util/function';
import {Observable, of} from 'rxjs';
import {RecipeListModel} from '../recipe-list/shared/recipe-list.model';

describe('ApiService', () => {
  let service: ApiService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  const baseUrl = '/jmx-ui/api';
  const requestUrl = '/recipes';
  const httpParams = new HttpParams().set('sourceSystem', 'amvpos').set('status', 'active');
  const requestOptions = {
    params: httpParams
  };
  const recipeList: RecipeListModel = {
    totalRecipes: 0,
    recipes: []
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        {provide: ApiService, useValue: apiSpy}
      ]
    });
    service = TestBed.inject(ApiService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get data', () => {


    service.get(requestUrl, requestOptions);

    apiServiceSpy.get.and.callFake((url: string, options: {params: HttpParams}): Observable<any> => {
      expect(url).toBe(baseUrl + requestUrl);
      expect(options.params.get('sourceSystem')).toBe('amvpos');
      expect(options.params.get('status')).toBe('active');

      return of(recipeList);
    });

    expect(service).toBeTruthy();
  });

  it ('should post data', () => {
    service.post(requestUrl, any);

    apiServiceSpy.post.and.callFake((url: string): Observable<any> => {
      expect(url).toBe(baseUrl + requestUrl);

      return of(recipeList);
    });

    expect(service).toBeTruthy();
  });
});
