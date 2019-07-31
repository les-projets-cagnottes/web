import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppNavbarComponent } from './valyou/navbar/navbar.component';
import { ValyouComponent } from './valyou/valyou.component';
import { LoginComponent } from './login/login.component';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { UsersComponent } from './valyou/users/users.component';
import { ProjectsComponent } from './valyou/projects/projects.component';
import { OrganizationsComponent } from './valyou/organizations/organizations.component';
import { NewOrganizationComponent } from './valyou/organizations/new-organization/new-organization.component';
import { NewProjectComponent } from './valyou/projects/new-project/new-project.component';


@NgModule({
  declarations: [
    AppComponent,
    AppNavbarComponent,
    ValyouComponent,
    LoginComponent,
    UsersComponent,
    ProjectsComponent,
    OrganizationsComponent,
    NewOrganizationComponent,
    NewProjectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
