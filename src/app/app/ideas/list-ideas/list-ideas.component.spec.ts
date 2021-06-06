import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListIdeasComponent } from './list-ideas.component';

describe('ListIdeasComponent', () => {
  let component: ListIdeasComponent;
  let fixture: ComponentFixture<ListIdeasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListIdeasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListIdeasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
