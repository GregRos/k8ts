import { ResourceRef, TemplateOrigin, TopResource } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddle, seq } from "doddle"
import { merge, omit } from "lodash"
import { Pvc } from "../../.."
import { apps } from "../../../gvks/apps"
import { K8tsResourceError } from "../../errors"
import { Service } from "../../network"
import type { Pod_Scope } from "../pod/container/scope"
import { Pod } from "../pod/pod"
import { createSelectionMetadata } from "../util"
import type { Workload_Ref } from "../workload-ref"
import type { StatefulSet_Props } from "./props"
import { StatefulSet_Scope } from "./scope"
export class StatefulSet<
        Name extends string = string,
        SvcName extends string = string,
        Ports extends string = string,
        SvcPorts extends NoInfer<Ports> = Ports
    >
    extends TopResource<Name, StatefulSet_Props<Ports, SvcPorts, SvcName>>
    implements Workload_Ref<Ports>
{
    private readonly _template = new TemplateOrigin(`${this.ident.name}_template`, {
        owner: this
    })
    readonly Service = new Service(
        this.props.$service.name,
        {
            ...this.props.$service,
            $backend: this,
            $frontend: {
                type: "Headless"
            }
        },
        {
            metadata: {
                "^k8ts.org/auto-created-by": this.__entity_id__
            }
        }
    )
    get kind() {
        return apps.v1.StatefulSet._
    }

    protected __needs__(): Record<string, ResourceRef> {
        return {
            service: this.Service
        }
    }

    get selectorLabels() {
        return createSelectionMetadata(this)
    }

    private _podTemplate = doddle(() => {
        const self = this
        const wrappedContainers = (podScope: Pod_Scope) => {
            return this.props.$template.Containers(new StatefulSet_Scope(podScope, self._template))
        }
        const resource = new Pod(
            `${self.ident.name}`,
            {
                ...self.props.$template,
                Containers: wrappedContainers
            },
            {
                origins: {
                    own: self._template,
                    subscope: self["__origin__"]
                },
                metadata: this.selectorLabels
            }
        )

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
