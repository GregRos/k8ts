import type { CDK } from "@k8ts/imports"
import type { Resource_Entity } from "@k8ts/instruments"
import { Resource_Child } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
import { Pvc } from "../../persistent"
import { Container_Mount_Device } from "../container/mounts"
interface Pod_Device_Backend_Pvc {
    $backend: Pvc<"Block">
    readOnly?: boolean
}

export type Pod_Device_Backend = Pod_Device_Backend_Pvc

export class Pod_Device extends Resource_Child<Pod_Device_Backend_Pvc> {
    get kind() {
        return v1.Pod.Device._
    }

    constructor(
        parent: Resource_Entity,
        name: string,
        readonly backend: Pod_Device_Backend_Pvc
    ) {
        super(parent, name, backend)
    }

    protected __needs__(): Record<string, Resource_Entity | Resource_Entity[] | undefined> {
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

    Mount() {
        return new Container_Mount_Device({
            device: this
        })
    }
}

export function make(parent: Resource_Entity, name: string, input: Pod_Device_Backend) {
    return new Pod_Device(parent, name, input)
}
