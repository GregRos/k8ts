import { CDK } from "../../_imports"
import type { Service } from "./service"

export type Port<Port extends string> = Port.Port<Port>
export namespace Port {
    export interface Props<Port extends string> {
        service: Service.AbsService<Port>
        name: Port
    }

    export class Port<Port extends string> {
        constructor(readonly props: Props<Port>) {}

        get service() {
            return this.props.service as Service<Port>
        }

        get port() {
            return this.props
        }

        ref(): CDK.HttpRouteSpecRulesBackendRefs {
            return {
                kind: "Service",
                namespace: this.service.meta.tryGet("namespace"),
                name: this.service.meta.get("name"),
                port: this.service.ports.get(this.props.name).frontend
            }
        }
    }
}
