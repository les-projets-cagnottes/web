import { AuditModel } from "../audit/audit.model";

export class FileModel extends AuditModel {
    name = '';
    directory = '';
    format = '';
    url = '';
}
