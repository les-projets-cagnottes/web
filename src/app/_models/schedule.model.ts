import { AuditModel } from './audit.model';

export class ScheduleModel extends AuditModel {
    type: string;
    params: string;
    planning: string;
    enabled: boolean;
    nextExecution: Date;
}
