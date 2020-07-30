import { ScheduleModel } from '../_models';

export class Schedule extends ScheduleModel {

    scheduled: boolean;

    static fromModel(model: ScheduleModel): Schedule {
        var entity = new Schedule();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.type = model.type;
        entity.params = model.params;
        entity.nextExecution = model.nextExecution;
        entity.planning = model.planning;
        entity.enabled = model.enabled;
        return entity;
    }

    static fromModels(models: ScheduleModel[]): Schedule[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }
}
