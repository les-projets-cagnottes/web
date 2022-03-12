import { BudgetModel } from '../../_models/budget/budget.model';

import { Account } from '../account/account';
import { Content } from '../content/content';
import { Donation } from '../donation/donation';
import { Organization } from '../organization/organization';
import { User } from '../user/user';

export class Budget extends BudgetModel {

    override organization: Organization = new Organization();
    override sponsor: User = new User();
    override rules: Content = new Content();
    accounts: Account[] = [];
    donations: Donation[] = [];

    static fromModel(model: BudgetModel): Budget {
        const entity = new Budget();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.amountPerMember = model.amountPerMember;
        entity.isDistributed = model.isDistributed;
        entity.startDate = model.startDate;
        entity.endDate = model.endDate;
        entity.totalDonations = model.totalDonations;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        entity.sponsor = new User();
        entity.sponsor.id = model.sponsor.id;
        entity.rules = new Content();
        entity.rules.id = model.rules.id;
        entity.accounts = [];
        entity.donations = [];
        return entity;
    }

    static fromModels(models: BudgetModel[]): Budget[] {
        const entities: Budget[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }
    
    setOrganization(organizations: Organization[]) {
        const result = organizations.find(organization => this.organization.id === organization.id);
        result !== undefined ? this.organization = result : null;
    }

}