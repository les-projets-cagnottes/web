import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCampaignsComponent } from './list-campaigns.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('ListCampaignsComponent', () => {
  let component: ListCampaignsComponent;
  let fixture: ComponentFixture<ListCampaignsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListCampaignsComponent ],
      imports: [
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot([])]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCampaignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
