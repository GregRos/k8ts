import type { Volume as Cdk8s_Volume } from "@imports"
import type { ConfigMap } from "../../resources/configmap/configmap"
import type { Pvc } from "../../resources/persistent/pvc"
import type { Secret } from "../../resources/secret/secret"
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

    abstract manifest(): Cdk8s_Volume

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
    override manifest(): Cdk8s_Volume {
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
    override manifest(): Cdk8s_Volume {
        return {
            name: this.name,
            configMap: {
                name: this.props.backend.name
            }
        }
    }
}

class SecretVolume extends Volume<SecretBackend> {
    override manifest(): Cdk8s_Volume {
        return {
            name: this.name,
            secret: {
                secretName: this.props.backend.name
            }
        }
    }
}
