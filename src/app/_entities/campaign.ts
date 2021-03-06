import { CampaignModel } from '../_models/campaign.model';

import { Budget } from './budget';
import { Donation } from './donation';
import { Organization } from './organization';
import { Project } from './project/project';
import { User } from './user';

export class Campaign extends CampaignModel {

    leader: User = new User();
    project: Project = new Project();
    donations: Donation[] = [];
    peopleGivingTime: User[] = [];
    organizations: Organization[] = [];
    budgets: Budget[] = [];

    static fromModel(model: CampaignModel): Campaign {
        var entity = new Campaign();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.title = model.title;
        entity.status = model.status;
        entity.shortDescription = model.shortDescription;
        entity.longDescription = model.longDescription;
        entity.donationsRequired = model.donationsRequired;
        entity.peopleRequired = model.peopleRequired;
        entity.fundingDeadline = model.fundingDeadline;
        entity.totalDonations = model.totalDonations;
        entity.peopleGivingTimeRef = model.peopleGivingTimeRef;
        entity.organizationsRef = model.organizationsRef;
        entity.budgetsRef = model.budgetsRef;
        entity.leader = new User();
        entity.leader.id = model.leader.id;
        entity.project = new Project();
        entity.project.id = model.project.id;
        return entity;
    }

    static valuesOf(models: CampaignModel[]): Campaign[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    static fromModels(models: CampaignModel[]): Campaign[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setProject(projects: Project[] ) {
        var result = projects.find(project => this.project.id === project.id);
        result !== undefined ? this.project = result : null;
    }
}
