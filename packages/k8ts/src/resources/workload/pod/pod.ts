import { K8sResource, ResourcePart, type Resource_Props } from "@k8ts/instruments"
import type { Metadata_Input } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { merge } from "lodash"
import type { Workload_Ref } from "../../.."
import { v1 } from "../../../gvks"
import { K8tsResourceError } from "../../errors"
import { createSelectionMetadata } from "../util"
import type { PodContainer } from "./container"
import type { ContainerRef } from "./container/ref"
import { Pod_Scope } from "./container/scope"
export type Pod_Producer<Ports extends string> = (scope: Pod_Scope) => Iterable<ContainerRef<Ports>>

export interface Pod_Props<Ports extends string> extends Resource_Props<Partial<CDK.PodSpec>> {
    metadata?: Metadata_Input
    containers$: Pod_Producer<Ports>
}

export class Pod<Name extends string = string, Ports extends string = string>
    extends K8sResource<Name, Pod_Props<Ports>>
    implements Workload_Ref<Ports>
{
    get kind() {
        return v1.Pod._
    }
    private readonly _containers = seq(() => {
        return this.__scope__(this.props.containers$)(new Pod_Scope(this))
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

    protected __body__(): CDK.PodTemplateSpec {
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
                if (x.is(ResourcePart)) {
                    return x["__submanifest__"]() as CDK.Volume
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
        return {
            spec: spec2
        }
    }

    get selectorLabels() {
        return createSelectionMetadata(this)
    }
}
