import { CampaignModel } from '../../_models';

import { Budget } from '../budget/budget';
import { Donation } from '../donation/donation';
import { Project } from '../project/project';

export class Campaign extends CampaignModel {

    override project: Project = new Project();
    override budget: Budget = new Budget();
    donations: Donation[] = [];

    static fromModel(model: CampaignModel): Campaign {
        const entity = new Campaign();
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
        const entities: Campaign[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    static fromModels(models: CampaignModel[]): Campaign[] {
        const entities: Campaign[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setProject(projects: Project[] ) {
        const result = projects.find(project => this.project.id === project.id);
        result !== undefined ? this.project = result : null;
    }
}
