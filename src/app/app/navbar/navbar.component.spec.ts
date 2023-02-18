import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppNavbarComponent } from './navbar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('AppNavbarComponent', () => {
  let component: AppNavbarComponent;
  let fixture: ComponentFixture<AppNavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppNavbarComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule.forRoot([], {})]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
