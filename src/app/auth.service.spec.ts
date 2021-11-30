import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RecipeListService} from './recipe-list/shared/recipe-list.service';
import {of, Subject} from 'rxjs';
import {User} from './shared/user.model';
import {HttpClient, HttpParams} from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let recipeListService: RecipeListService;
  const user: User = null;

  const userData: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ RecipeListService ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    recipeListService = TestBed.inject(RecipeListService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('authorized - user exist', () => {
    service.user = userData;

    service.authorized().subscribe(userR => {
      expect(userR).toEqual(userData);
    });

    httpMock.expectNone('/jmx-ui/user/user-info');

  });

  it('authorized', fakeAsync(() => {
    spyOn(recipeListService, 'saveUsersToIdb');

    const dummyUser = userData;
    service.authorized().subscribe(userR => {
      expect(userR).toEqual(dummyUser);
      tick(1000);
      expect(recipeListService.saveUsersToIdb).toHaveBeenCalled();
    });

    const req = httpMock.expectOne('/jmx-ui/user/user-info');
    expect(req.request.method).toBe('GET');

    flush();
  }));

  it('authorized - error url', fakeAsync(() => {
    service.authorized().subscribe(() => {}, err => {
      expect(err).toBe({url: 'context.html'});
    });

    const req = httpMock.expectOne('/jmx-ui/user/user-info');
    expect(req.request.method).toBe('GET');
    expect(location.href).toContain('context.html');
    flush();
  }));


});
