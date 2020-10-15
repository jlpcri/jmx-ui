import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeListComponent } from './recipe-list.component';
import {RecipeListService} from './shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;

  beforeEach(async(() => {
    const recipeListServiceSpy = jasmine.createSpyObj('RecipeListService', ['retrieveAll']);
    const idbServiceSpy = jasmine.createSpyObj('IndexedDatabaseService', ['getRecipesFromIdb', 'init']);
    TestBed.configureTestingModule({
      declarations: [ RecipeListComponent ],
      providers: [
        { provide: RecipeListService, useValue: recipeListServiceSpy},
        { provide: IndexedDatabaseService, useValue: idbServiceSpy},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
