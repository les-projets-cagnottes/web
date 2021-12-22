import { CampaignModel } from '../../_models/campaign/campaign.model';

import { Budget } from '../budget';
import { Donation } from '../donation/donation';
import { Organization } from '../organization/organization';
import { Project } from '../project/project';
import { User } from '../user';

export class Campaign extends CampaignModel {

    project: Project = new Project();
    budget: Budget = new Budget();
    donations: Donation[] = [];

    static fromModel(model: CampaignModel): Campaign {
        var entity = new Campaign();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.title = model.title;
        entity.status = model.status;
        entity.donationsRequired = model.donationsRequired;
        entity.fundingDeadline = model.fundingDeadline;
        entity.totalDonations = model.totalDonations;
        entity.project = new Project();
        entity.project.id = model.project.id;
        entity.budget = new Budget();
        entity.budget.id = model.budget.id;
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
