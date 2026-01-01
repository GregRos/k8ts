import { Service, type ServiceRef } from "./service"

export interface ServicePortProps<Port extends string> {
    service: ServiceRef<Port>
    name: Port
}

export class Port<Port extends string> {
    constructor(readonly props: ServicePortProps<Port>) {}
    get service() {
        return this.props.service
    }

    port() {
        return this.props.service.assert(Service).ports.get(this.props.name).frontend
    }
}
