import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetMailComponent } from './reset-mail.component';

describe('ResetMailComponent', () => {
  let component: ResetMailComponent;
  let fixture: ComponentFixture<ResetMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
