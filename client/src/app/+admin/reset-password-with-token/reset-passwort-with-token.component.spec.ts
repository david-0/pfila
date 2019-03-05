import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswortWithTokenComponent } from './reset-passwort-with-token.component';

describe('PasswordChangeComponent', () => {
  let component: ResetPasswortWithTokenComponent;
  let fixture: ComponentFixture<ResetPasswortWithTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswortWithTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswortWithTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
