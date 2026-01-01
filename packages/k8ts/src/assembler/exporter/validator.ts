import { ResourceNode } from "@k8ts/instruments"
import { FileNodes } from "./assembler"
export interface ValidatingEvent {
    node: ResourceNode
}
export interface ValidatorEventsTable {
    validating: ValidatingEvent
}
export interface ValidatorOptions {}
export class NodeGraphValidator {
    constructor(readonly options: ValidatorOptions) {}
    validate(collection: FileNodes[]) {}
}
