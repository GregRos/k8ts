import type { CDK } from "@k8ts/imports"

import type { ManifestResource } from "@k8ts/instruments"
import { relations, SubResource } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
import type { ConfigMap } from "../../configmap"
import { Pvc } from "../../persistent"
import type { Secret } from "../../secret"
import { Mount } from "../container/mounts"
export type Volume<Props extends Volume.Pod_Volume_Backend = Volume.Pod_Volume_Backend> =
    Volume.Pod_Volume<Props>
export namespace Volume {
    interface Pod_Volume_Backend_Pvc {
        $backend: Pvc.Pvc<"Filesystem">
        readOnly?: boolean
    }

    interface Pod_Volume_Backend_ConfigMap {
        $backend: ConfigMap
    }
    interface Pod_Volume_Backend_Secret {
        $backend: Secret
    }
    export type Pod_Volume_Backend =
        | Pod_Volume_Backend_Pvc
        | Pod_Volume_Backend_ConfigMap
        | Pod_Volume_Backend_Secret

    @relations({
        needs: self => ({
            backend: self.props.$backend
        })
    })
    export abstract class Pod_Volume<
        Props extends Pod_Volume_Backend = Pod_Volume_Backend
    > extends SubResource<Props> {
        readonly kind = v1.Pod.Volume._

        abstract submanifest(): CDK.Volume

        Mount(options?: Omit<Mount.Container_Mount_Props, "volume">) {
            return new Mount.Container_Mount_Volume({
                volume: this,
                ...options
            })
        }
    }

    class Pod_Volume_Pvc extends Pod_Volume<Pod_Volume_Backend_Pvc> {
        override submanifest(): CDK.Volume {
            return {
                name: this.name,
                persistentVolumeClaim: {
                    claimName: this.props.$backend.name,
                    readOnly: this.props.readOnly
                }
            }
        }
    }

    class Pod_Volume_ConfigMap extends Pod_Volume<Pod_Volume_Backend_ConfigMap> {
        override submanifest(): CDK.Volume {
            return {
                name: this.name,
                configMap: {
                    name: this.props.$backend.name
                }
            }
        }
    }

    class Pod_Volume_Secret extends Pod_Volume<Pod_Volume_Backend_Secret> {
        override submanifest(): CDK.Volume {
            return {
                name: this.name,
                secret: {
                    secretName: this.props.$backend.name
                }
            }
        }
    }

    export function make(
        parent: ManifestResource,
        name: string,
        input: Pod_Volume_Backend
    ): Pod_Volume {
        const { $backend } = input
        switch ($backend.kind.name) {
            case "PersistentVolumeClaim":
                return new Pod_Volume_Pvc(parent, name, input as Pod_Volume_Backend_Pvc)
            case "ConfigMap":
                return new Pod_Volume_ConfigMap(parent, name, input as Pod_Volume_Backend_ConfigMap)
            case "Secret":
                return new Pod_Volume_Secret(parent, name, input as Pod_Volume_Backend_Secret)
        }
    }
}
