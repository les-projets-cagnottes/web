import { CampaignModel } from '../_models/campaign.model';

import { Budget } from './budget';
import { Donation } from './donation';
import { Organization } from './organization';
import { User } from './user';

export class Campaign extends CampaignModel {

    leader: User = new User();
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
        return entity;
    }

    static valuesOf(models: CampaignModel[]): Campaign[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
