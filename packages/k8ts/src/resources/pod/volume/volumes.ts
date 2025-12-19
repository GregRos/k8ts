import type { CDK } from "@k8ts/imports"

import type { ResourceEntity } from "@k8ts/instruments"
import { SubResource } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
import type { ConfigMap } from "../../configmap"
import { Pvc } from "../../persistent"
import type { Secret } from "../../secret"
import { Container_Mount_Volume, type Container_Mount_Props } from "../container/mounts"

interface Pod_Volume_Backend_Pvc {
    $backend: Pvc<"Filesystem">
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

export abstract class Pod_Volume<
    Props extends Pod_Volume_Backend = Pod_Volume_Backend
> extends SubResource<Props> {
    get kind() {
        return v1.Pod.Volume._
    }

    static make(parent: ResourceEntity, name: string, backend: Pod_Volume_Backend): Pod_Volume {
        switch (backend.$backend.kind.name) {
            case "PersistentVolumeClaim":
                return new Pod_Volume_Pvc(parent, name, backend as Pod_Volume_Backend_Pvc)
            case "ConfigMap":
                return new Pod_Volume_ConfigMap(
                    parent,
                    name,
                    backend as Pod_Volume_Backend_ConfigMap
                )
            case "Secret":
                return new Pod_Volume_Secret(parent, name, backend as Pod_Volume_Backend_Secret)
        }
    }

    protected __needs__(): Record<string, ResourceEntity | ResourceEntity[] | undefined> {
        return {
            backend: this.props.$backend
        }
    }
    Mount(options?: Omit<Container_Mount_Props, "volume">) {
        return new Container_Mount_Volume({
            volume: this,
            ...options
        })
    }

    protected abstract __submanifest__(): CDK.Volume
}

class Pod_Volume_Pvc extends Pod_Volume<Pod_Volume_Backend_Pvc> {
    protected __submanifest__(): CDK.Volume {
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
    protected __submanifest__(): CDK.Volume {
        return {
            name: this.name,
            configMap: {
                name: this.props.$backend.name
            }
        }
    }
}

class Pod_Volume_Secret extends Pod_Volume<Pod_Volume_Backend_Secret> {
    protected __submanifest__(): CDK.Volume {
        return {
            name: this.name,
            secret: {
                secretName: this.props.$backend.name
            }
        }
    }
}

export function make(parent: ResourceEntity, name: string, input: Pod_Volume_Backend): Pod_Volume {
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
