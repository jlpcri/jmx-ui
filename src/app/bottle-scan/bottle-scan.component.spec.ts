import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottleScanComponent } from './bottle-scan.component';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {ApiService} from '../api/api.service';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('BottleScanComponent', () => {
  let component: BottleScanComponent;
  let fixture: ComponentFixture<BottleScanComponent>;
  let service: RecipeListService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottleScanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RecipeListService,
        {provide: ApiService, useValue: apiSpy}
      ]
    });
    service = TestBed.inject(RecipeListService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BottleScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
