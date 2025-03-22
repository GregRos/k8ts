import { ResourceNode } from "@k8ts/instruments"
import { App, Chart } from "cdk8s"
import { ManifestResource } from "../../node"
import { EquivCdk8s } from "../../node/equiv-cdk8s"
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
    validate(collection: FileNodes[]) {
        const app = new App()
        const rootChart = new Chart(app, "root_chart")
        for (const fileNode of collection) {
            for (const nodeManifest of fileNode.resources) {
                const equiv = EquivCdk8s.get(nodeManifest.node._entity as ManifestResource)
                const fullFqn = nodeManifest.node.fullFqn.replaceAll("/", "_").replaceAll(".", "-")
                const cdk8sNode = new equiv(rootChart, fullFqn, nodeManifest.manifest)
            }
        }
        app.synthYaml()
    }
}
