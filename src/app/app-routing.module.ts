import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ValyouComponent } from './valyou/valyou.component';
import { AuthGuard } from './_guards';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './valyou/users/users.component';
import { ProjectsComponent } from './valyou/projects/projects/projects.component';
import { NewProjectComponent } from './valyou/projects/new-project/new-project.component';
import { EditOrganizationComponent } from './valyou/organizations/edit-organization/edit-organization.component';
import { OrganizationsComponent } from './valyou/organizations/organizations/organizations.component';
import { ViewProjectComponent } from './valyou/projects/view-project/view-project.component';

const routes: Routes = [
  {
    path: '', component: ValyouComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },
      { path: 'organizations/new', redirectTo: 'organizations/edit/0' },
      { path: 'organizations/edit/:id', component: EditOrganizationComponent },
      { path: 'organizations', component: OrganizationsComponent },
      { path: 'projects/new', component: NewProjectComponent },
      { path: 'projects/:id', component: ViewProjectComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'users', component: UsersComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
