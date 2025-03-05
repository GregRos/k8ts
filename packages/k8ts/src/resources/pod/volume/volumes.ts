import type { CDK } from "@imports"

import type { ConfigMap } from "../../configmap/configmap"
import type { Pvc } from "../../persistent/pvc"
import type { Secret } from "../../secret"
import { VolumeMount, type MountOptions } from "./mounts"
interface PvcBackend {
    backend: Pvc
    readOnly: boolean
}

interface ConfigMapBackend {
    backend: ConfigMap
}
interface SecretBackend {
    backend: Secret
}
export type AnyVolumeBackend = PvcBackend | ConfigMapBackend | SecretBackend
export abstract class Volume<Props extends object = object> {
    constructor(
        readonly name: string,
        readonly props: Props
    ) {}

    abstract manifest(): CDK.Volume

    mount(options: MountOptions) {
        return new VolumeMount(this as any, options)
    }

    static make(name: string, input: AnyVolumeBackend): Volume {
        const { backend } = input
        switch (backend.kind) {
            case "PersistentVolumeClaim":
                return new PvcVolume(name, input as PvcBackend)
            case "ConfigMap":
                return new ConfigMapVolume(name, input as ConfigMapBackend)
            case "Secret":
                return new SecretVolume(name, input as SecretBackend)
        }
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
