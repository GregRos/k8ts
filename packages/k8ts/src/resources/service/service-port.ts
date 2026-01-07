import { Service, type Service_Ref } from "./service"

export interface Service_PortRef_Props<Port extends string> {
    service: Service_Ref<Port>
    name: Port
}

export class Service_PortRef<Port extends string> {
    constructor(readonly props: Service_PortRef_Props<Port>) {}
    get service() {
        return this.props.service
    }

    number() {
        return this.props.service.mustBe(Service).ports.get(this.props.name).frontend
    }
}
