import type { CDK } from "@imports"

import type { ManifestResource } from "../../../node"
import { dependencies } from "../../../node/base"
import { SubResource } from "../../../node/sub-resource"
import type { ConfigMap } from "../../configmap"
import type { Persistent } from "../../persistent"
import type { Secret } from "../../secret"
import { Mount } from "../container/mounts"
export type Volume<Props extends Volume.Backend = Volume.Backend> = Volume.Volume<Props>
export namespace Volume {
    interface PvcBackend {
        backend: Persistent.Claim<"Filesystem">
        readOnly?: boolean
    }

    interface ConfigMapBackend {
        backend: ConfigMap
    }
    interface SecretBackend {
        backend: Secret
    }
    export type Backend = PvcBackend | ConfigMapBackend | SecretBackend
    export abstract class Volume<Props extends Backend = Backend> extends SubResource {
        kind = "Volume" as const
        constructor(
            parent: ManifestResource,
            name: string,
            readonly props: Props
        ) {
            super(parent, name)
        }

        abstract manifest(): CDK.Volume

        mount(options?: Mount.Options) {
            return new Mount.Volume(this as any, options ?? {})
        }

        override get dependsOn() {
            return dependencies({
                backend: this.props.backend
            })
        }
    }
    class PvcVolume extends Volume<PvcBackend> {
        override manifest(): CDK.Volume {
            return {
                name: this.name,
                persistentVolumeClaim: {
                    claimName: this.props.backend.name,
                    readOnly: this.props.readOnly
                }
            }
        }
    }

    class ConfigMapVolume extends Volume<ConfigMapBackend> {
        override manifest(): CDK.Volume {
            return {
                name: this.name,
                configMap: {
                    name: this.props.backend.name
                }
            }
        }
    }

    class SecretVolume extends Volume<SecretBackend> {
        override manifest(): CDK.Volume {
            return {
                name: this.name,
                secret: {
                    secretName: this.props.backend.name
                }
            }
        }
    }

    export function make(parent: ManifestResource, name: string, input: Backend): Volume {
        const { backend } = input
        switch (backend.api.name) {
            case "PersistentVolumeClaim":
                return new PvcVolume(parent, name, input as PvcBackend)
            case "ConfigMap":
                return new ConfigMapVolume(parent, name, input as ConfigMapBackend)
            case "Secret":
                return new SecretVolume(parent, name, input as SecretBackend)
        }
    }
}
