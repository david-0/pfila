import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordChangeConfirmationComponent } from './password-change-confirmation.component';

describe('PasswordChangeConfirmationComponent', () => {
  let component: PasswordChangeConfirmationComponent;
  let fixture: ComponentFixture<PasswordChangeConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordChangeConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordChangeConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
