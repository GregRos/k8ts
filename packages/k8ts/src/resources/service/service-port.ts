import { CDK } from "@k8ts/sample-interfaces"
import type { Service, Service_Ref } from "./service"

export interface Service_Port_Props<Port extends string> {
    service: Service_Ref<Port>
    name: Port
}

export class Port<Port extends string> {
    constructor(readonly props: Service_Port_Props<Port>) {}
    get service() {
        return this.props.service as any as Service<Port>
    }

    get port() {
        return this.props
    }

    // TODO: Does this need to resolve ports?
    ref(): CDK.HttpRouteSpecRulesBackendRefs {
        return {
            kind: "Service",
            namespace: this.service.meta.tryGet("namespace"),
            name: this.service.meta.get("name"),
            port: this.service.ports.get(this.props.name).frontend
        }
    }
}
