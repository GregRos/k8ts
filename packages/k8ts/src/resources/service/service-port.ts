import { CDK } from "../../_imports"
import type { Service } from "./service"

export type Port<Port extends string> = Port.Port<Port>
export namespace Port {
    export interface Props<Port extends string> {
        service: Service<Port>
        port: Port
    }

    export class Port<Port extends string> {
        constructor(
            readonly service: Service<Port>,
            readonly portName: Port,
            readonly port: number
        ) {}

        ref(): CDK.HttpRouteSpecRulesBackendRefs {
            return {
                kind: "Service",
                namespace: this.service.meta.tryGet("namespace"),
                name: this.service.meta.get("name"),
                port: this.port
            }
        }
    }
}
