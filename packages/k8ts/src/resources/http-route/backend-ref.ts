import type { CDK } from "@imports"
import type { Service } from "../service"

export class ServiceBackendRef<P extends string> {
    constructor(
        readonly service: Service<P>,
        readonly port: P
    ) {}

    manifest(): CDK.HttpRouteSpecRulesBackendRefs {
        return {
            kind: this.service.api.kind,
            name: this.service.name,
            port: this.service.ports.get(this.port).target
        }
    }
}
