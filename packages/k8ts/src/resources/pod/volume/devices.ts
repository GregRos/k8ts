import type { Resource } from "@k8ts/instruments"
import { ResourcePart } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../idents/default"
import { Pvc } from "../../persistent"
import type { ContainerDeviceMountSource } from "../container/mounts/device"
interface PodDeviceBackendPvc {
    $backend: Pvc<"Block">
    readOnly?: boolean
}

export type PodDeviceBackend = PodDeviceBackendPvc

export class PodDevice extends ResourcePart<PodDeviceBackendPvc> {
    get ident() {
        return v1.Pod.Device._
    }

    constructor(
        parent: Resource,
        name: string,
        readonly backend: PodDeviceBackendPvc
    ) {
        super(parent, name, backend)
    }
    get sourceNamespace() {
        const backend = this.props.$backend as any as Resource
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

    Mount(): ContainerDeviceMountSource {
        return {
            $backend: this
        }
    }
}

export function make(parent: Resource, name: string, input: PodDeviceBackend) {
    return new PodDevice(parent, name, input)
}
