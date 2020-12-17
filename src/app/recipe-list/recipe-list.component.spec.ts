import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeListComponent } from './recipe-list.component';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    const recipeListServiceSpy = jasmine.createSpyObj('RecipeListService', ['retrieveAll', 'retrieveLocations']);
    const idbServiceSpy = jasmine.createSpyObj('IndexedDatabaseService', ['getRecipesFromIdb', 'init']);
    TestBed.configureTestingModule({
      declarations: [ RecipeListComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: RecipeListService, useValue: recipeListServiceSpy},
        { provide: IndexedDatabaseService, useValue: idbServiceSpy},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
