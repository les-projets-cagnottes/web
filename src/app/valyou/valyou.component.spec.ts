import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValyouComponent } from './valyou.component';

describe('ValyouComponent', () => {
  let component: ValyouComponent;
  let fixture: ComponentFixture<ValyouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValyouComponent ]
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
