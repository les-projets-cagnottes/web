import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LesProjetsCagnottesComponent } from './lesprojetscagnottes.component';
import { AppNavbarComponent } from './navbar/navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('AppComponent', () => {
  let component: LesProjetsCagnottesComponent;
  let fixture: ComponentFixture<LesProjetsCagnottesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AppNavbarComponent,
        LesProjetsCagnottesComponent 
      ],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LesProjetsCagnottesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
