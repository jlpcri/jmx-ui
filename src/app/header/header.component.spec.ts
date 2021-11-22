import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {AuthService} from '../auth.service';
import {of} from 'rxjs';
import {User} from '../shared/user.model';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IndexedDatabaseService} from '../shared/indexed-database.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let htmlElement: HTMLElement;
  let modalServiceSpy: NgbModal;
  const mockModalRef = {
    componentInstance: {
      location: 'Amv headquarter'
    },
    result: Promise.resolve()
  };
  let idbServiceSpy: IndexedDatabaseService;

  beforeEach(async(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['authorized']);
    authServiceSpy.authorized.and.returnValue(of(new User()));

    idbServiceSpy = jasmine.createSpyObj('IndexedDatabaseService', [
      'getAppPropertyFromIdb',
      'saveAppPropertyToIdb',
      'init'
    ]);

    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: IndexedDatabaseService, useValue: idbServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', {open: mockModalRef});

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NgbModal, userValue: modalServiceSpy}
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    htmlElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('set network status to false', () => {
    component.networkStatus = false;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should log out', () => {
    component.logout();

    expect(component).toBeTruthy();
  });

  it('open help modal', () => {
    const elementContent = htmlElement.querySelector('.modal-body');

    component.openHelp('content');
    fixture.detectChanges();

    expect(elementContent).toBeNull();
  });

  it('should open app location', () => {
    component.openAppLocation();
    mockModalRef.componentInstance.location = '';
    mockModalRef.result = Promise.resolve();

    expect(component).toBeTruthy();
  });

  it('is app config input error', () => {
    let location;
    expect(component.isAppConfigInputError(location)).toBe(true);

    location = '';
    expect(component.isAppConfigInputError(location)).toBe(true);

    location = 'Kurevapes';
    expect(component.isAppConfigInputError(location)).toBe(true);
  });

  it('get dismiss reason', () => {
    let reason;

    expect(component.getDismissReason(reason)).toContain('with:');

    reason = ModalDismissReasons.ESC;
    expect(component.getDismissReason(reason)).toEqual('by pressing ESC');

    reason = ModalDismissReasons.BACKDROP_CLICK;
    expect(component.getDismissReason(reason)).toEqual('by clicking on a backdrop');
  });

});
