import { User, DonationModel } from '../_models';
import { Budget } from './budget';
import { Account } from './account';
import { Campaign } from './campaign';

export class Donation extends DonationModel {
    account: Account;
    contributor: User;
    campaign: Campaign;
    budget: Budget;

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
        entity.budget = new Budget();
        entity.budget.id = model.budget.id;
        return entity;
    }

    static valuesOf(models: DonationModel[]): Donation[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setContributor(users: User[] ) {
        var result = users.find(user => this.contributor.id === user.id);
        result !== undefined ? this.contributor = result : null;
    }
}
