import type { CDK } from "@imports"
import type { Service } from "../service"

export class ServiceBackendRef<P extends string> {
    constructor(
        readonly backend: Service<P>,
        readonly port: P
    ) {}

    manifest(): CDK.HttpRouteSpecRulesBackendRefs {
        return {
            kind: this.backend.api.kind,
            name: this.backend.name,
            port: this.backend.ports.get(this.port).target
        }
    }
}
