import { Service, type Service_Ref } from "./service"

export interface Service_Port_Props<Port extends string> {
    service: Service_Ref<Port>
    name: Port
}

export class Port<Port extends string> {
    constructor(readonly props: Service_Port_Props<Port>) {}
    get service() {
        return this.props.service
    }

    port() {
        return this.props.service.assert(Service).ports.get(this.props.name).frontend
    }
}
