import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjectComponent } from './view-project.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ViewProjectComponent', () => {
  let component: ViewProjectComponent;
  let fixture: ComponentFixture<ViewProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewProjectComponent ],
      imports: [
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MarkdownModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forRoot([])]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
