import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ValyouComponent } from './valyou/valyou.component';
import { AuthGuard } from './_guards';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', component: ValyouComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
