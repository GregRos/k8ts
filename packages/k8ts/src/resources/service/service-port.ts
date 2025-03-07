import type { Service } from "./service"

export interface Props<Port extends string> {
    service: Service<Port>
    port: Port
}

export class Port<Port extends string> {
    constructor(
        readonly service: Service<Port>,
        readonly port: Port
    ) {}

    manifest() {
        return {
            kind: "Service",
            namespace: this.service.meta.tryGet("namespace"),
            name: this.service.meta.get("name")
        }
    }
}
