import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LesProjetsCagnottesComponent } from './app/lesprojetscagnottes.component';
import { AuthGuard } from './_guards';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './app/users/users.component';
import { ListCampaignsComponent } from './app/campaigns/list/list-campaigns.component';
import { EditCampaignComponent } from './app/campaigns/edit/edit-campaign.component';
import { EditOrganizationComponent } from './app/organizations/edit/edit-organization.component';
import { OrganizationsComponent } from './app/organizations/list/list-organizations.component';
import { ViewCampaignComponent } from './app/campaigns/view/view-campaign.component';
import { BudgetsComponent } from './app/budgets/budgets.component';
import { ProfileComponent } from './app/profile/profile.component';
import { ReportComponent } from './app/report/report.component';
import { GettingStartedComponent } from './app/documentation/getting-started/getting-started.component';
import { AboutComponent } from './about/about.component';
import { AdminComponent } from './app/admin/admin.component';
import { ListIdeasComponent } from './app/ideas/list-ideas/list-ideas.component';
import { SchedulerComponent } from './app/scheduler/scheduler.component';
import { EditProjectComponent } from './app/projects/edit/edit-project.component';

const routes: Routes = [
  {
    path: '', component: LesProjetsCagnottesComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'campaigns', pathMatch: 'full' },
      { path: 'organizations/new', redirectTo: 'organizations/edit/0' },
      { path: 'organizations/edit/:id', component: EditOrganizationComponent },
      { path: 'organizations/edit/slack/:id', component: EditOrganizationComponent },
      { path: 'organizations', component: OrganizationsComponent },
      { path: 'projects/new', component: EditProjectComponent },
      { path: 'projects/:id/edit', component: EditCampaignComponent },
      { path: 'projects/:id', component: ViewCampaignComponent },
      { path: 'projects', component: ListCampaignsComponent },
      { path: 'campaigns/new', component: EditCampaignComponent },
      { path: 'campaigns/:id/edit', component: EditCampaignComponent },
      { path: 'campaigns/:id', component: ViewCampaignComponent },
      { path: 'campaigns', component: ListCampaignsComponent },
      { path: 'ideas', component: ListIdeasComponent },
      { path: 'budgets', component: BudgetsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'report', component: ReportComponent },
      { path: 'users', component: UsersComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'schedules', component: SchedulerComponent },
      { path: 'doc/getting-started', component: GettingStartedComponent },
      { path: 'about', component: AboutComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'login/slack', component: LoginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
