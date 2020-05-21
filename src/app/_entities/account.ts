import { AccountModel } from '../_models/account.model';

import { Budget } from './budget';
import { User } from './user';

export class Account extends AccountModel {
    
    owner: User = new User();
    budget: Budget = new Budget();

    // Front only
    usage: string = "0%";

    static fromModel(model: AccountModel): Account {
        var entity = new Account();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.initialAmount = model.initialAmount;
        entity.amount = model.amount;
        entity.owner = new User();
        entity.owner.id = model.owner.id;
        entity.budget = new Budget();
        entity.budget.id = model.budget.id;
        return entity;
    }

    static fromModels(models: AccountModel[]): Account[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setBudget(budgets: Budget[] ) {
        var result = budgets.find(budget => this.budget.id === budget.id);
        result !== undefined ? this.budget = result : null;
    }

    setOwner(users: User[] ) {
        var result = users.find(user => this.owner.id === user.id);
        result !== undefined ? this.owner = result : null;
    }
}
