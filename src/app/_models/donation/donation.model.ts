import { AuditModel, GenericModel } from "..";

export class DonationModel extends AuditModel {
    amount: number;
    account: GenericModel;
    contributor: GenericModel;
    campaign: GenericModel;
}