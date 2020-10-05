import { TestBed } from '@angular/core/testing';

import { RecipeListService } from './recipe-list.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import {RecipeListModel} from './recipe-list.model';

describe('RecipListService', () => {
  let service: RecipeListService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(RecipeListService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all recipes', () => {
    const url = '/jmx-ui/api/productComponents/search/recipes';
    const params = 'projection=recipeProjection&sourceSystem=amvpos&status=active&size=1000&page=';
    const recipeList: RecipeListModel = {
      content: [],
      page: { totalPages: 1 }
    };
    service.retrieveAll();
    let req = httpTestingController.expectOne(`${url}?${params}0`);
    req.flush(recipeList);
    expect(req.request.method).toEqual('GET');

    req = httpTestingController.expectOne(`${url}?${params}1`);
    req.flush(recipeList);

    req = httpTestingController.expectOne(`${url}?${params}2`);
    req.flush(recipeList);

  });

});
