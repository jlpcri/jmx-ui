import {fakeAsync, flush, TestBed} from '@angular/core/testing';

import {ApiService} from './api.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpParams} from '@angular/common/http';
import {User} from '../shared/user.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const options = {params: new HttpParams()};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get data', fakeAsync(() => {
    const dummyUser: User = {
      id: 12,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      authUri: '',
      roles: ['jmx']
    };
    // const options = {params: new HttpParams()};

    service.get('/user/user-info', options).subscribe(data => {
      expect(data).toBe(dummyUser);
    });

    const req = httpMock.expectOne('/jmx-ui/api/user/user-info');
    expect(req.request.method).toBe('GET');
    flush();
  }));

  it ('should post data', fakeAsync(() => {
      const postData = {
        associateName: 'Username',
        batchId: '25852',
        eventTimestamp: '2021-11-23T12:47:47-06:00',
        locationName: 'Alohma Council Bluffs',
        productName: 'product',
        productSku: '0002'
      };

      service.post('/bottleScanEvents', options).subscribe(data => {
        expect(data).toEqual(postData);
      });

      const req = httpMock.expectOne('/jmx-ui/api/bottleScanEvents');
      expect(req.request.method).toBe('POST');
      flush();
  }));
});
