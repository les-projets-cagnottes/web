import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewCampaignComponent } from './view-campaign.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ViewCampaignComponent', () => {
  let component: ViewCampaignComponent;
  let fixture: ComponentFixture<ViewCampaignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCampaignComponent],
      imports: [
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MarkdownModule.forRoot(),
        ModalModule.forRoot(),
        RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  /*
    it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
