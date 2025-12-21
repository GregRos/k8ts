import { Resource_Node } from "@k8ts/instruments"
import { FileNodes } from "./assembler"
export interface ValidatingEvent {
    node: Resource_Node
}
export interface ValidatorEventsTable {
    validating: ValidatingEvent
}
export interface ValidatorOptions {}
export class NodeGraphValidator {
    constructor(readonly options: ValidatorOptions) {}
    validate(collection: FileNodes[]) {}
}
