import type { Rsc_Entity } from "@k8ts/instruments"
import { Rsc_Child } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../kinds/default"
import { Pvc } from "../../persistent"
import type { Container_Device_Mount_Source } from "../container/mounts/device"
interface Pod_Device_Backend_Pvc {
    $backend: Pvc<"Block">
    readOnly?: boolean
}

export type Pod_Device_Backend = Pod_Device_Backend_Pvc

export class Pod_Device extends Rsc_Child<Pod_Device_Backend_Pvc> {
    get kind() {
        return v1.Pod.Device._
    }

    constructor(
        parent: Rsc_Entity,
        name: string,
        readonly backend: Pod_Device_Backend_Pvc
    ) {
        super(parent, name, backend)
    }
    get sourceNamespace() {
        const backend = this.props.$backend as any as Rsc_Entity
        return backend.namespace
    }
    protected __needs__() {
        return {
            backend: this.backend.$backend
        }
    }

    protected __submanifest__(): CDK.Volume {
        return {
            name: this.name,
            persistentVolumeClaim: {
                claimName: this.backend.$backend.name,
                readOnly: this.backend.readOnly
            }
        }
    }

    Mount(): Container_Device_Mount_Source {
        return {
            $backend: this
        }
    }
}

export function make(parent: Rsc_Entity, name: string, input: Pod_Device_Backend) {
    return new Pod_Device(parent, name, input)
}
