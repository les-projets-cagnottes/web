import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppNavbarComponent } from './valyou/navbar/navbar.component';
import { ValyouComponent } from './valyou/valyou.component';
import { LoginComponent } from './login/login.component';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { AlertComponent } from './_components'
import { JwtInterceptor, ErrorInterceptor } from './_helpers';


@NgModule({
  declarations: [
    AppComponent,
    AppNavbarComponent,
    ValyouComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
