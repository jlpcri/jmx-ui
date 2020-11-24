import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorTestComponent } from './error-test.component';
import { ErrorService } from './error.service';

describe('ErrorTestComponent', () => {
  let component: ErrorTestComponent;
  let fixture: ComponentFixture<ErrorTestComponent>;
  let errorServiceSpy;

  beforeEach(async(() => {
    errorServiceSpy = jasmine.createSpyObj('ErrorService', ['add']);
    TestBed.configureTestingModule({
      declarations: [ ErrorTestComponent ],
      providers: [
        { provide: ErrorService, useValue: errorServiceSpy},
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
