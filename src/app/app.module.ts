import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { MarkdownModule } from 'ngx-markdown';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppNavbarComponent } from './valyou/navbar/navbar.component';
import { ValyouComponent } from './valyou/valyou.component';
import { LoginComponent } from './login/login.component';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { UsersComponent } from './valyou/users/users.component';
import { ProjectsComponent } from './valyou/projects/projects/projects.component';
import { OrganizationsComponent } from './valyou/organizations/organizations/organizations.component';
import { EditOrganizationComponent } from './valyou/organizations/edit-organization/edit-organization.component';
import { NewProjectComponent } from './valyou/projects/new-project/new-project.component';
import { ViewProjectComponent } from './valyou/projects/view-project/view-project.component';
import { BudgetsComponent } from './valyou/budgets/budgets.component';
import { ProfileComponent } from './valyou/profile/profile.component';
import { ReportComponent } from './valyou/report/report.component';
import { GettingStartedComponent } from './valyou/documentation/getting-started/getting-started.component';
import { AboutComponent } from './about/about.component';


@NgModule({
  declarations: [
    AppComponent,
    AppNavbarComponent,
    ValyouComponent,
    LoginComponent,
    UsersComponent,
    ProjectsComponent,
    OrganizationsComponent,
    NewProjectComponent,
    EditOrganizationComponent,
    ViewProjectComponent,
    BudgetsComponent,
    ProfileComponent,
    ReportComponent,
    GettingStartedComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule,
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
