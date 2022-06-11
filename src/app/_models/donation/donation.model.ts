import { AuditModel, GenericModel } from "..";

export class DonationModel extends AuditModel {
    amount = 0;
    account: GenericModel = new GenericModel();
    campaign: GenericModel = new GenericModel();
}