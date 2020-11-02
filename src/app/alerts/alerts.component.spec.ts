import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsComponent } from './alerts.component';
import { AlertService } from './alert.service';
import { By } from '@angular/platform-browser';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

describe('AlertsComponent', () => {
  let component: AlertsComponent;
  let fixture: ComponentFixture<AlertsComponent>;
  let alertServiceSpy;

  beforeEach(async(() => {
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['add', 'remove']);
    alertServiceSpy.alerts = ['test error'];
    TestBed.configureTestingModule({
      declarations: [ AlertsComponent, NgbAlert ],
      providers: [
        { provide: AlertService, useValue: alertServiceSpy},
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the error alert', () => {
    const alert = fixture.debugElement.query(By.css('.alert-dismissible'));
    expect(alert.nativeElement.textContent.trim()).toBe('Error: test error ×');
  });

  it('should delete an error when close button is clicked', () => {
    const closeButton = fixture.debugElement.query(By.css('.alert-dismissible .close'));
    closeButton.triggerEventHandler('click', {});
    expect(alertServiceSpy.remove).toHaveBeenCalled();
  });
});
