import { TestBed } from '@angular/core/testing';

import { RecipeListService } from './recipe-list.service';
import {RecipeListModel} from './recipe-list.model';
import {ApiService} from '../../api/api.service';
import {Observable, of} from 'rxjs';
import {HttpParams} from '@angular/common/http';

describe('RecipListService', () => {
  let service: RecipeListService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        RecipeListService,
        { provide: ApiService, useValue: apiSpy }
      ]
    });
    service = TestBed.inject(RecipeListService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all recipes', () => {
    const recipeList: RecipeListModel = {
      totalRecipes: 0,
      recipes: []
    };

    apiServiceSpy.get.and.callFake((url: string, options: { params: HttpParams }): Observable<any> => {
      expect(url).toBe('/recipes');
      expect(options.params.get('sourceSystem')).toBe('amvpos');
      expect(options.params.get('status')).toBe('active');
      return of(recipeList);
    });

    service.retrieveAllRecipes();

  });

});
