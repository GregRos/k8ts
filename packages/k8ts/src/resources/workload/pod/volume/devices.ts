import type { Resource_Props, ResourceEntity, ResourceRef } from "@k8ts/instruments"
import { ResourcePart } from "@k8ts/instruments"
import type { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../../../gvks/default"
import type { ContainerDeviceMount_Input } from "../container/mounts/device"
interface PodDeviceBackendPvc extends Resource_Props<K8S.Volume> {
    $backend: ResourceRef<v1.PersistentVolumeClaim._>
    readOnly?: boolean
}

export type PodDeviceBackend = PodDeviceBackendPvc

export class PodDevice extends ResourcePart<PodDeviceBackendPvc> {
    get kind() {
        return v1.Pod.Device._
    }

    constructor(
        parent: ResourceEntity,
        name: string,
        readonly backend: PodDeviceBackendPvc
    ) {
        super(parent, name, backend)
    }
    get sourceNamespace() {
        const backend = this.props.$backend as any as ResourceEntity
        return backend.ident.namespace
    }
    protected __needs__() {
        return {
            backend: this.backend.$backend
        }
    }

    protected __submanifest__(): K8S.Volume {
        const body = {
            name: this.ident.name,
            persistentVolumeClaim: {
                claimName: this.backend.$backend.ident.name,
                readOnly: this.backend.readOnly
            }
        }
        return merge(body, this.props.$$manifest)
    }

    Mount(): ContainerDeviceMount_Input {
        return {
            $backend: this
        }
    }
}

export function make(parent: ResourceEntity, name: string, input: PodDeviceBackend) {
    return new PodDevice(parent, name, input)
}
