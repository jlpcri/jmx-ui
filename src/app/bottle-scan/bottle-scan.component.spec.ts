import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottleScanComponent } from './bottle-scan.component';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {ApiService} from '../api/api.service';

describe('BottleScanComponent', () => {
  let component: BottleScanComponent;
  let fixture: ComponentFixture<BottleScanComponent>;
  let service: RecipeListService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottleScanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        RecipeListService,
        {provide: ApiService, useValue: apiSpy}
      ]
    });
    service = TestBed.inject(RecipeListService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    fixture = TestBed.createComponent(BottleScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
