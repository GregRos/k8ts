import type { CDK } from "@imports"

import type { ConfigMap } from "../../configmap"
import type { Persistent } from "../../persistent"
import type { Secret } from "../../secret"
import { Mount } from "../container/mounts"
export type Volume<Props extends object = object> = Volume.Volume<Props>
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
    export abstract class Volume<Props extends object = object> {
        constructor(
            readonly name: string,
            readonly props: Props
        ) {}

        abstract manifest(): CDK.Volume

        mount(options?: Mount.Options) {
            return new Mount.Volume(this as any, options ?? {})
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

    export function make(name: string, input: Backend): Volume {
        const { backend } = input
        switch (backend.api.kind) {
            case "PersistentVolumeClaim":
                return new PvcVolume(name, input as PvcBackend)
            case "ConfigMap":
                return new ConfigMapVolume(name, input as ConfigMapBackend)
            case "Secret":
                return new SecretVolume(name, input as SecretBackend)
        }
    }
}
