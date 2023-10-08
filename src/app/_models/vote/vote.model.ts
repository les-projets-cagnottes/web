import { AuditModel } from "..";
import { GenericModel } from "../generic/generic.model";
import { VoteType } from "./vote-type";

export class VoteModel extends AuditModel {
  type: VoteType = VoteType.UP;
  project: GenericModel = new GenericModel();
  user: GenericModel = new GenericModel();
}
