
import { CampaignModel } from '../../_models/campaign/campaign.model';
import { DonationModel } from '../../_models/donation/donation.model';
import { UserModel } from '../../_models/user.model';

import { Budget } from '../budget';
import { Account } from '../account/account';
import { Campaign } from '../campaign/campaign';
import { User } from '../user';

export class Donation extends DonationModel {

    account: Account = new Account();
    contributor: User = new User();
    campaign: Campaign = new Campaign();

    static fromModel(model: DonationModel): Donation {
        var entity = new Donation();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.amount = model.amount;
        entity.account = new Account();
        entity.account.id = model.account.id;
        entity.contributor = new User();
        entity.contributor.id = model.contributor.id;
        entity.campaign = new Campaign();
        entity.campaign.id = model.campaign.id;
        return entity;
    }

    static fromModels(models: DonationModel[]): Donation[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setCampaign(campaigns: CampaignModel[] ) {
        var result = campaigns.find(user => this.campaign.id === user.id);
        result !== undefined ? this.campaign = Campaign.fromModel(result) : null;
    }

    setContributor(users: UserModel[] ) {
        var result = users.find(user => this.contributor.id === user.id);
        result !== undefined ? this.contributor = User.fromModel(result) : null;
    }
}
