import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelect2Module } from 'ng-select2';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppNavbarComponent } from './app/navbar/navbar.component';
import { LesProjetsCagnottesComponent } from './app/lesprojetscagnottes.component';
import { LoginComponent } from './login/login.component';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { UsersComponent } from './app/users/users.component';
import { ListCampaignsComponent } from './app/campaigns/list/list-campaigns.component';
import { OrganizationsComponent } from './app/organizations/organizations/organizations.component';
import { EditOrganizationComponent } from './app/organizations/edit-organization/edit-organization.component';
import { EditCampaignComponent } from './app/campaigns/edit/edit-campaign.component';
import { ViewCampaignComponent } from './app/campaigns/view/view-campaign.component';
import { BudgetsComponent } from './app/budgets/budgets.component';
import { ProfileComponent } from './app/profile/profile.component';
import { ReportComponent } from './app/report/report.component';
import { GettingStartedComponent } from './app/documentation/getting-started/getting-started.component';
import { AboutComponent } from './about/about.component';
import { ManagerComponent } from './app/manager/manager.component';


@NgModule({
  declarations: [
    AppComponent,
    AppNavbarComponent,
    LesProjetsCagnottesComponent,
    LoginComponent,
    UsersComponent,
    ListCampaignsComponent,
    OrganizationsComponent,
    EditCampaignComponent,
    EditOrganizationComponent,
    ViewCampaignComponent,
    BudgetsComponent,
    ProfileComponent,
    ReportComponent,
    GettingStartedComponent,
    AboutComponent,
    ManagerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelect2Module,
    MarkdownModule.forRoot(),
    ModalModule.forRoot(),
    RouterModule.forRoot([])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
