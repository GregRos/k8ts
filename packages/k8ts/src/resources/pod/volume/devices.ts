import type { CDK } from "@k8ts/imports"
import type { ManifestResource } from "@k8ts/instruments"
import { relations, SubResource } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
import { Pvc } from "../../persistent"
import { Mount } from "../container/mounts"
export type Device = Device.Pod_Device
export namespace Device {
    interface Pod_Device_Backend_Pvc {
        $backend: Pvc.Pvc<"Block">
        readOnly?: boolean
    }

    export type Backend = Pod_Device_Backend_Pvc

    @relations({
        needs: self => ({
            backend: self.backend.$backend
        })
    })
    export class Pod_Device extends SubResource<Pod_Device_Backend_Pvc> {
        readonly kind = v1.Pod.Device._
        constructor(
            parent: ManifestResource,
            name: string,
            readonly backend: Pod_Device_Backend_Pvc
        ) {
            super(parent, name, backend)
        }

        submanifest(): CDK.Volume {
            return {
                name: this.name,
                persistentVolumeClaim: {
                    claimName: this.backend.$backend.name,
                    readOnly: this.backend.readOnly
                }
            }
        }

        Mount() {
            return new Mount.Container_Mount_Device({
                device: this
            })
        }
    }

    export function make(parent: ManifestResource, name: string, input: Backend) {
        return new Pod_Device(parent, name, input)
    }
}
