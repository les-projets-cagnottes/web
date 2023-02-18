import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        HttpClientModule,
        RouterModule.forRoot([], {})]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
});
