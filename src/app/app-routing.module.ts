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
import { BudgetsComponent } from './valyou/budgets/budgets.component';
import { ProfileComponent } from './valyou/profile/profile.component';
import { ReportComponent } from './valyou/report/report.component';
import { GettingStartedComponent } from './valyou/documentation/getting-started/getting-started.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: '', component: ValyouComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },
      { path: 'organizations/new', redirectTo: 'organizations/edit/0' },
      { path: 'organizations/edit/:id', component: EditOrganizationComponent },
      { path: 'organizations/edit/slack/:id', component: EditOrganizationComponent },
      { path: 'organizations', component: OrganizationsComponent },
      { path: 'projects/new', component: NewProjectComponent },
      { path: 'projects/:id/edit', component: NewProjectComponent },
      { path: 'projects/:id', component: ViewProjectComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'budgets', component: BudgetsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'report', component: ReportComponent },
      { path: 'users', component: UsersComponent },
      { path: 'doc/getting-started', component: GettingStartedComponent },
      { path: 'about', component: AboutComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'login/slack', component: LoginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
