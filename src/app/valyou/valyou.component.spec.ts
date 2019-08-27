import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValyouComponent } from './valyou.component';
import { AppNavbarComponent } from './navbar/navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('ValyouComponent', () => {
  let component: ValyouComponent;
  let fixture: ComponentFixture<ValyouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AppNavbarComponent,
        ValyouComponent 
      ],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValyouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
