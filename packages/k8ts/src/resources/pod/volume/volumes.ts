import type { CDK } from "../../../_imports"

import { relations } from "@k8ts/instruments"
import type { ManifestResource } from "../../../node"
import { SubResource } from "../../../node/sub-resource"
import type { ConfigMap } from "../../configmap"
import { Pvc } from "../../persistent"
import type { Secret } from "../../secret"
import { Mount } from "../container/mounts"
export type Volume<Props extends Volume.Backend = Volume.Backend> = Volume.PodVolume<Props>
export namespace Volume {
    interface PodVolume_Backend_Pvc {
        backend: Pvc.Pvc<"Filesystem">
        readOnly?: boolean
    }

    interface PodVolume_Backend_ConfigMap {
        backend: ConfigMap
    }
    interface PodVolume_Backend_Secret {
        backend: Secret
    }
    export type Backend =
        | PodVolume_Backend_Pvc
        | PodVolume_Backend_ConfigMap
        | PodVolume_Backend_Secret
    @relations({
        needs: self => ({
            backend: self.props.backend
        })
    })
    export abstract class PodVolume<Props extends Backend = Backend> extends SubResource<Props> {
        get kind() {
            return this.parent.kind.subkind("Volume")
        }

        abstract submanifest(): CDK.Volume

        Mount(options?: Mount.Options) {
            return new Mount.ContainerVolumeMount(this as any, options ?? {})
        }
    }

    class PvcPodVolume extends PodVolume<PodVolume_Backend_Pvc> {
        override submanifest(): CDK.Volume {
            return {
                name: this.name,
                persistentVolumeClaim: {
                    claimName: this.props.backend.name,
                    readOnly: this.props.readOnly
                }
            }
        }
    }

    class ConfigMapPodVolume extends PodVolume<PodVolume_Backend_ConfigMap> {
        override submanifest(): CDK.Volume {
            return {
                name: this.name,
                configMap: {
                    name: this.props.backend.name
                }
            }
        }
    }

    class SecretPodVolume extends PodVolume<PodVolume_Backend_Secret> {
        override submanifest(): CDK.Volume {
            return {
                name: this.name,
                secret: {
                    secretName: this.props.backend.name
                }
            }
        }
    }

    export function make(parent: ManifestResource, name: string, input: Backend): PodVolume {
        const { backend } = input
        switch (backend.kind.name) {
            case "PersistentVolumeClaim":
                return new PvcPodVolume(parent, name, input as PodVolume_Backend_Pvc)
            case "ConfigMap":
                return new ConfigMapPodVolume(parent, name, input as PodVolume_Backend_ConfigMap)
            case "Secret":
                return new SecretPodVolume(parent, name, input as PodVolume_Backend_Secret)
        }
    }
}
