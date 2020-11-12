import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottleScanComponent } from './bottle-scan.component';

describe('BottleScanComponent', () => {
  let component: BottleScanComponent;
  let fixture: ComponentFixture<BottleScanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottleScanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottleScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
