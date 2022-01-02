import { AuditModel, GenericModel } from "..";

export class DonationModel extends AuditModel {
    amount: number = 0;
    account: GenericModel = new GenericModel();
    campaign: GenericModel = new GenericModel();
}