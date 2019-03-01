import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordNotChangeConfirmationComponent } from './password-not-change-confirmation.component';

describe('PasswordChangeConfirmationComponent', () => {
  let component: PasswordNotChangeConfirmationComponent;
  let fixture: ComponentFixture<PasswordNotChangeConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordNotChangeConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordNotChangeConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
