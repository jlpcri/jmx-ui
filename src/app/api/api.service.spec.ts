
import {ApiService} from './api.service';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {fakeAsync, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Subject} from 'rxjs';


describe('ApiService', () => {
  let apiService: ApiService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let options;

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
    apiService = TestBed.inject(ApiService);
    options = {params: new HttpParams()};
  });

  it('should create service', () => {
    expect(apiService).toBeTruthy();
  });

  it('apiService get', fakeAsync(() => {
    httpClientSpy.get.and.returnValue(new Subject());
    apiService.get('/url', options);
    expect(httpClientSpy.get).toHaveBeenCalledWith('/jmx-ui/api/url', options);
  }));

  it('apiService getRoot', fakeAsync(() => {
    httpClientSpy.get.and.returnValue(new Subject());
    apiService.getRoot('/url', options);
    expect(httpClientSpy.get).toHaveBeenCalledWith('/jmx-ui/url', options);
  }));

  it('apiService - post', () => {
    httpClientSpy.post.and.returnValue(new Subject());
    apiService.post('/url', postData);
    expect(httpClientSpy.post).toHaveBeenCalledWith('/jmx-ui/api/url', postData);
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
