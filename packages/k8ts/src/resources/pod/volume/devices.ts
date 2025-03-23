import { relations } from "@k8ts/instruments"
import type { CDK } from "../../../_imports"
import { api } from "../../../api-kinds"
import { k8ts } from "../../../kind-map"
import type { ManifestResource } from "../../../node"
import { SubResource } from "../../../node/sub-resource"
import { Pvc } from "../../persistent"
import { Mount } from "../container/mounts"
export type Device = Device.PodDevice
export namespace Device {
    interface PodDevice_Backend_Pvc {
        backend: Pvc.Pvc<"Block">
        readOnly?: boolean
    }

    export type Backend = PodDevice_Backend_Pvc
    @k8ts(api.v1_.Pod_.Device)
    @relations({
        needs: self => ({
            backend: self.backend.backend
        })
    })
    export class PodDevice extends SubResource<PodDevice_Backend_Pvc> {
        readonly kind = api.v1_.Pod_.Device
        constructor(
            parent: ManifestResource,
            name: string,
            readonly backend: PodDevice_Backend_Pvc
        ) {
            super(parent, name, backend)
        }

        submanifest(): CDK.Volume {
            return {
                name: this.name,
                persistentVolumeClaim: {
                    claimName: this.backend.backend.name,
                    readOnly: this.backend.readOnly
                }
            }
        }

        Mount() {
            return new Mount.ContainerDeviceMount({
                device: this
            })
        }
    }

    export function make(parent: ManifestResource, name: string, input: Backend) {
        return new PodDevice(parent, name, input)
    }
}
