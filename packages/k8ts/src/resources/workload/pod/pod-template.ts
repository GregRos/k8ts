import { ResourcePart, ResourceRef, type Resource_Props } from "@k8ts/instruments"
import { Metadata, type Metadata_Input } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { merge } from "lodash"
import { v1 } from "../../../gvks/default"
import { K8tsResourceError } from "../../errors"
import { PodContainer } from "./container"
import { PodScope } from "./scope"
import { PodDevice } from "./volume/devices"
import { PodVolume } from "./volume/volumes"
type ContainerRef<Ports extends string> = ResourceRef<v1.Pod.Container._> & {
    __PORTS__: Ports
}
export type PodTemplate_Producer<Ports extends string> = (
    scope: PodScope
) => Iterable<ContainerRef<Ports>>

export interface PodTemplate_Props<Ports extends string>
    extends Resource_Props<Partial<CDK.PodSpec>> {
    $metadata?: Metadata_Input
    Containers: PodTemplate_Producer<Ports>
}

export class PodTemplate<Ports extends string = string> extends ResourcePart<
    PodTemplate_Props<Ports>
> {
    get kind() {
        return v1.PodTemplate._
    }
    private readonly _containers = seq(() => {
        const origin = this.__parent__()["__origin__"]()
        const Containers = origin["__binder__"]().bind(this.props.Containers)
        return Containers(new PodScope(this))
    })
        .as<PodContainer<Ports>>()
        .cache()

    private readonly _mounts = seq(() => this._containers.concatMap(x => x.mounts))
        .uniq()
        .cache()
    private readonly _volumes = seq(() => this._containers.concatMap(x => x.volumes))
        .uniq()
        .cache()
    private readonly _ports = this._containers.map(x => x.ports).reduce((a, b) => a.union(b))

    get containers() {
        return this._containers.toIterable()
    }
    get mounts() {
        return this._mounts.toIterable()
    }

    get volumes() {
        return this._volumes.toIterable()
    }

    get ports() {
        return this._ports.pull()
    }

    protected __kids__() {
        this._containers.toArray().pull()
        return super.__kids__()
    }
    protected __metadata__() {
        return {
            name: this.ident.name,
            labels: this.metadata.labels,
            annotations: this.metadata.annotations
        }
    }
    readonly metadata = new Metadata(this.props.$metadata ?? {})

    protected __submanifest__(): CDK.PodTemplateSpec {
        const self = this
        const { props } = self
        const containers = self._containers
        const initContainers = containers
            .filter(c => c.subtype === "init")
            .map(x => x["__submanifest__"]())
            .toArray()
        const mainContainers = containers
            .filter(c => c.subtype === "main")
            .map(x => x["__submanifest__"]())
            .toArray()

        const volumes = self._volumes
            .map(x => {
                if (x.is(PodVolume)) {
                    return x["__submanifest__"]()
                } else if (x.is(PodDevice)) {
                    return x["__submanifest__"]()
                }
                throw new K8tsResourceError(`Unsupported volume type: ${x}`)
            })
            .toArray()
        const spec = {
            containers: mainContainers.pull(),
            initContainers: initContainers.pull(),
            volumes: volumes.pull()
        } satisfies CDK.PodSpec
        const spec2 = merge(spec, props.$overrides)
        const body = {
            metadata: self.__metadata__(),
            spec: spec2
        }
        return body
    }
}
