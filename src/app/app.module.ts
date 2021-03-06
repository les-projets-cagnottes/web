import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxSummernoteModule } from 'ngx-summernote';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppNavbarComponent } from './app/navbar/navbar.component';
import { LesProjetsCagnottesComponent } from './app/lesprojetscagnottes.component';
import { LoginComponent } from './login/login.component';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { UsersComponent } from './app/users/users.component';
import { OrganizationsComponent } from './app/organizations/list/list-organizations.component';
import { EditOrganizationComponent } from './app/organizations/edit/edit-organization.component';
import { ListProjectsComponent } from './app/projects/list/list-projects.component';
import { EditProjectComponent } from './app/projects/edit/edit-project.component';
import { ListCampaignsComponent } from './app/campaigns/list/list-campaigns.component';
import { EditCampaignComponent } from './app/campaigns/edit/edit-campaign.component';
import { ViewCampaignComponent } from './app/campaigns/view/view-campaign.component';
import { BudgetsComponent } from './app/budgets/budgets.component';
import { ProfileComponent } from './app/profile/profile.component';
import { ReportComponent } from './app/report/report.component';
import { GettingStartedComponent } from './app/documentation/getting-started/getting-started.component';
import { AboutComponent } from './about/about.component';
import { AdminComponent } from './app/admin/admin.component';
import { ListIdeasComponent } from './app/ideas/list-ideas/list-ideas.component';
import { SchedulerComponent } from './app/scheduler/scheduler.component';

import { ConfigService } from './_services/config/config.service';
import { ViewProjectComponent } from './app/projects/view/view-project.component';
import { ListNewsComponent } from './app/news/list/list-news.component';
import { EditNewsComponent } from './app/news/edit/edit-news.component';

const appConfig = (config: ConfigService) => {
  return () => {
    return config.loadConfig();
  };
};

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
    AdminComponent,
    ListIdeasComponent,
    SchedulerComponent,
    EditProjectComponent,
    ListProjectsComponent,
    ViewProjectComponent,
    ListNewsComponent,
    EditNewsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    NgxSummernoteModule,
    ReactiveFormsModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appConfig,
      multi: true,
      deps: [ConfigService],
    },
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
