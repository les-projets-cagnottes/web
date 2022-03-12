import { CampaignModel, DonationModel } from 'src/app/_models';
import { Account } from '../account/account';
import { Campaign } from '../campaign/campaign';

export class Donation extends DonationModel {

    override account: Account = new Account();
    override campaign: Campaign = new Campaign();

    static fromModel(model: DonationModel): Donation {
        const entity = new Donation();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.amount = model.amount;
        entity.account = new Account();
        entity.account.id = model.account.id;
        entity.campaign = new Campaign();
        entity.campaign.id = model.campaign.id;
        return entity;
    }

    static fromModels(models: DonationModel[]): Donation[] {
        const entities: Donation[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setCampaign(campaigns: CampaignModel[] ) {
        const result = campaigns.find(user => this.campaign.id === user.id);
        result !== undefined ? this.campaign = Campaign.fromModel(result) : null;
    }

}
