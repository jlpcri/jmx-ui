import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {AuthService} from './auth.service';
import {RecipeListService} from './recipe-list/shared/recipe-list.service';
import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {User} from './shared/user.model';
import {of, Subject, throwError} from 'rxjs';


describe('Auth service', () => {
  let httpClient: HttpClient;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let authService: AuthService;
  let recipeListService: RecipeListService;
  let recipeListServiceSpy: jasmine.SpyObj<RecipeListService>;

  const expectedUser: User = {
    id: 12,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    authUri: '',
    roles: ['jmx']
  };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    recipeListServiceSpy = jasmine.createSpyObj('RecipeListService', ['saveUsersToIdb']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpClientSpy},
        { provide: RecipeListService, useValue: recipeListServiceSpy}
      ]
    });
    // authService = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
    recipeListService = TestBed.inject(RecipeListService);
    authService = new AuthService(httpClientSpy, recipeListServiceSpy);
  });

  it('should create service', () => {
    expect(authService).toBeTruthy();
  });

  it('authorized - current user exist', () => {
    authService.user = expectedUser;

    authService.authorized().subscribe(
      user => {
        expect(user).toEqual(expectedUser);
      }
    );
  });

  it('authorized - get user', fakeAsync(() => {
    httpClientSpy.get.and.returnValue(of(expectedUser));

    authService.authorized().subscribe(user => {
      expect(authService.user).toEqual(expectedUser);
      tick();
      expect(recipeListService.saveUsersToIdb).toHaveBeenCalled();
    });

    flush();
  }));

  it('authorized - get user error', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found',
      url: 'http://error.html'
    });

    httpClientSpy.get.and.returnValue(throwError(errorResponse));

    authService.authorized().subscribe(() => {},
      () => {
      location.href = 'localhost:9876';
    });

  }));

  it('logout - success', fakeAsync(() => {
    const resp = new HttpResponse();
    const resp$ = new Subject();
    httpClientSpy.get.and.returnValue(resp$);

    authService.logout();
    resp$.next(resp);
    location.href = 'localhost:9876';

    expect(httpClientSpy.get).toHaveBeenCalled();

  }));

  it('logout - error', fakeAsync(() => {
    const resp$ = new Subject();

    httpClientSpy.get.and.returnValue(resp$);

    authService.logout();
    resp$.error(new Error());
    location.href = 'localhost:9876';

    expect(httpClientSpy.get).toHaveBeenCalled();

  }));

});
