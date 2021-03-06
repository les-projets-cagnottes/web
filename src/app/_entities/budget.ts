import { BudgetModel } from '../_models/budget.model';

import { Account } from './account';
import { Content } from './content';
import { Donation } from './donation';
import { Organization } from './organization';
import { User } from './user';

export class Budget extends BudgetModel {

    organization: Organization = new Organization();
    sponsor: User = new User();
    rules: Content = new Content();
    accounts: Account[];
    donations: Donation[];

    static fromModel(model: BudgetModel): Budget {
        var entity = new Budget();
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
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }
    
    setOrganization(organizations: Organization[]) {
        var result = organizations.find(organization => this.organization.id === organization.id);
        result !== undefined ? this.organization = result : null;
    }

}