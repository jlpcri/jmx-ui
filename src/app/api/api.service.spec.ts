import {User} from '../shared/user.model';
import {ApiService} from './api.service';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {fakeAsync, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of} from 'rxjs';


describe('ApiService', () => {
  let apiService: ApiService;
  let httpClient: HttpClient;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;


  const expectedUser: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };

  const postData = {
    associateName: 'Username',
    batchId: '25852',
    eventTimestamp: '2021-11-23T12:47:47-06:00',
    locationName: 'Alohma Council Bluffs',
    productName: 'product',
    productSku: '0002'
  };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy}
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    apiService = new ApiService(httpClient);
  });

  it('should create service', () => {
    expect(apiService).toBeTruthy();
  });

  it('apiService get', fakeAsync(() => {
    httpClientSpy.get.and.returnValue(of(expectedUser));

    apiService.get('url', {params: new HttpParams()});
  }));

  it('apiService - post', () => {
    httpClientSpy.post.and.returnValue(of(postData));

    apiService.post('url', postData);
  });

  it('error handler', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found',
      url: 'http://error.html'
    });

    ApiService.errorHandler(errorResponse);
  });

  it('error handler - ErrorEvent', () => {
    const errorResponse = new HttpErrorResponse({
      error: new ErrorEvent('errorEvent', {message: 'not found'}),
      status: 404,
      statusText: 'Not Found',
      url: 'http://error.html'
    });

    ApiService.errorHandler(errorResponse);
  });
});
