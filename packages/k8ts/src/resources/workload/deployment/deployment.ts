import { K8sResource, ResourceRef, TemplateOrigin } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omit } from "lodash"
import { apps } from "../../../gvks/apps"
import { K8tsResourceError } from "../../errors"
import { Pod } from "../pod/pod"
import { createSelectionMetadata } from "../util"
import type { Workload_Ref } from "../workload-ref"
import type { Deployment_Props } from "./props"
export class Deployment<Name extends string, Ports extends string = string>
    extends K8sResource<Name, Deployment_Props<Ports>>
    implements Workload_Ref<Ports>
{
    private _template = new TemplateOrigin("DeploymentTemplate", {
        owner: this
    })
    get kind() {
        return apps.v1.Deployment._
    }

    get selectorLabels() {
        return createSelectionMetadata(this)
    }

    protected __kids__(): Iterable<ResourceRef> {
        return [this.PodTemplate]
    }
    protected async __body__(): Promise<K8S.KubeDeploymentProps> {
        const self = this
        const template = await self.PodTemplate["__manifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        const spec = {
            replicas: self.props.$replicas,
            selector: {
                matchLabels: this.selectorLabels.labels
            },
            template: noKindFields,
            strategy: self._strategy
        } satisfies K8S.DeploymentSpec
        const spec2 = merge(spec, self.props.$overrides)
        return {
            spec: spec2
        }
    }
    private get _strategy() {
        const strat = this.props.$strategy
        if (!strat) {
            return undefined
        }
        if (strat.type === "Recreate") {
            return strat
        }
        if (strat.type === "RollingUpdate") {
            return {
                type: "RollingUpdate",
                rollingUpdate: omit(strat, "type")
            }
        }
        throw new K8tsResourceError(`Invalid strategy type: ${strat}`)
    }

    @doddlify
    get PodTemplate() {
        const self = this
        const resource = new Pod(`${self.ident.name}`, self.props.$template, {
            origins: {
                own: self._template,
                subscope: self.__origin__
            },
            metadata: this.selectorLabels
        })
        return resource
    }

    get ports() {
        return this.PodTemplate.ports
    }
}
