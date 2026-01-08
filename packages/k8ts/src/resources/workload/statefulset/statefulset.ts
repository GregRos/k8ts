import {
    ResourceRef,
    ResourceTop,
    TemplateOrigin,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddle, seq } from "doddle"
import { merge, omit } from "lodash"
import { Pvc } from "../../.."
import { apps } from "../../../gvks/apps"
import { K8tsResourceError } from "../../errors"
import { Service, Service_Props } from "../../network"
import type { ContainerRef } from "../pod/container"
import type { Pod_Scope } from "../pod/container/scope"
import { Pod, Pod_Props } from "../pod/pod"
import { createSelectionMetadata } from "../util"
import type { Workload_Ref } from "../workload-ref"
import { StatefulSet_Scope } from "./scope"
export interface StatefulSet_UpdateStrategy_RollingUpdate
    extends CDK.RollingUpdateStatefulSetStrategy {
    type: "RollingUpdate"
}
export interface StatefulSet_UpdateStrategy_OnDelete {
    type: "OnDelete"
}
export type StatefulSet_UpdateStrategy =
    | StatefulSet_UpdateStrategy_RollingUpdate
    | StatefulSet_UpdateStrategy_OnDelete

export type StatefulSet_Producer<Ports extends string> = (
    scope: StatefulSet_Scope
) => Iterable<ContainerRef<Ports>>
export interface StatefulSet_Props<
    Ports extends string,
    SvcPorts extends NoInfer<Ports>,
    SvcName extends string
> extends Resource_Props_Top<CDK.StatefulSetSpec> {
    $replicas?: number
    $template: Omit<Pod_Props<Ports>, "Containers"> & {
        Containers: StatefulSet_Producer<Ports>
    }
    $service: {
        name: SvcName
    } & Omit<Service_Props<Ports, SvcPorts>, "$backend" | "$frontend">
    $updateStrategy?: StatefulSet_UpdateStrategy
}

export class StatefulSet<
        Name extends string = string,
        SvcName extends string = string,
        Ports extends string = string,
        SvcPorts extends NoInfer<Ports> = Ports
    >
    extends ResourceTop<Name, StatefulSet_Props<Ports, SvcPorts, SvcName>>
    implements Workload_Ref<Ports>
{
    private readonly _template = new TemplateOrigin("StatefulSetTemplate", {
        owner: this
    })
    readonly Service = new Service(this.props.$service.name, {
        ...this.props.$service,
        $backend: this,
        $frontend: {
            type: "ClusterIP",
            clusterIp: "None"
        }
    })
    get kind() {
        return apps.v1.StatefulSet._
    }

    get selectorLabels() {
        return createSelectionMetadata(this.ident.name)
    }

    private _podTemplate = doddle(() => {
        const self = this
        const wrappedContainers = (podScope: Pod_Scope) => {
            return this.props.$template.Containers(new StatefulSet_Scope(podScope, self._template))
        }
        const resource = this._template.attach(() => {
            return new Pod(
                `${self.ident.name}`,
                {
                    ...self.props.$template,
                    Containers: wrappedContainers
                },
                {
                    scopedOrigin: self.__origin__
                }
            )
        })

        return resource
    })

    protected __kids__(): Iterable<ResourceRef> {
        this._podTemplate.pull()
        return [...this.PvcTemplates, this.PodTemplate]
    }

    protected async __body__(): Promise<CDK.KubeStatefulSetProps> {
        const self = this
        const template = await self.PodTemplate["__manifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        const spec = {
            replicas: self.props.$replicas,
            selector: {
                matchLabels: this.selectorLabels.labels
            },
            serviceName: self.Service.ident.name,
            template: noKindFields,
            volumeClaimTemplates: await Promise.all(
                self.PvcTemplates.map(pvc => pvc["__manifest__"]())
            ),
            updateStrategy: self._updateStrategy
        } satisfies CDK.StatefulSetSpec
        const spec2 = merge(spec, self.props.$overrides)
        return {
            spec: spec2
        }
    }

    private get _updateStrategy() {
        const strategy = this.props.$updateStrategy
        if (!strategy) {
            return undefined
        }
        if (strategy.type === "OnDelete") {
            return { type: "OnDelete" }
        }
        if (strategy.type === "RollingUpdate") {
            return {
                type: "RollingUpdate",
                rollingUpdate: omit(strategy, "type")
            }
        }
        throw new K8tsResourceError(`Invalid update strategy type: ${strategy}`)
    }

    get PodTemplate() {
        return this._podTemplate.pull()
    }

    get PvcTemplates() {
        this._podTemplate.pull()
        return seq(this._template.resources).filter(x => x.is(Pvc))
    }

    get ports() {
        return this.PodTemplate.ports
    }
}
