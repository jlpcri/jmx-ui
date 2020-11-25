import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let modalServiceSpy;

  beforeEach(async(() => {
    modalServiceSpy = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [ ErrorComponent ],
      providers: [
        { provide: NgbActiveModal, useValue: modalServiceSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes the active modal when the close button is clicked', () => {
    const button = fixture.debugElement.nativeElement.querySelector('button.close');
    button.click();
    expect(modalServiceSpy.close).toHaveBeenCalled();
  });
});
