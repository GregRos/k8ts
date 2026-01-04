import {
    OriginContextTracker,
    ResourceRef,
    ResourceTop,
    type Resource_Props
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omit } from "lodash"
import { apps } from "../../resource-idents/apps"
import { K8tsResourceError } from "../errors"
import { PodTemplate, type PodProps } from "../pod"

export interface Deployment_Strategy_RollingUpdate extends CDK.RollingUpdateDeployment {
    type: "RollingUpdate"
    options?: CDK.RollingUpdateDeployment
}
export interface Deployment_Strategy_Recreate {
    type: "Recreate"
}
export type Deployment_Strategy = Deployment_Strategy_RollingUpdate | Deployment_Strategy_Recreate

export interface Deployment_Props<Ports extends string> extends Resource_Props<CDK.DeploymentSpec> {
    replicas?: number
    $template: PodProps<Ports>
    $strategy?: Deployment_Strategy
}
export type Deployment_Ref<Ports extends string> = ResourceRef<apps.v1.Deployment._> & {
    __PORTS__: Ports
}

export class Deployment<Name extends string, Ports extends string = string> extends ResourceTop<
    Name,
    Deployment_Props<Ports>
> {
    __PORTS__!: Ports
    get ident() {
        return apps.v1.Deployment._
    }

    #_ = (() => {
        const origin = OriginContextTracker.current
        if (!origin) {
            throw new K8tsResourceError(
                `Deployment ${this.name} must be created within an OriginEntity context`
            )
        }
        this.props.$template.$POD = origin["__binder__"]().bind(this.props.$template.$POD)
    })()

    protected __kids__(): Iterable<ResourceRef> {
        return [this.template]
    }
    protected __body__(): CDK.KubeDeploymentProps {
        const self = this
        const template = self.template["__submanifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        const spec = {
            replicas: self.props.replicas,
            selector: {
                matchLabels: {
                    app: self.name
                }
            },
            template: noKindFields,
            strategy: self._strategy
        } satisfies CDK.DeploymentSpec
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
    get template() {
        const podTemplate = new PodTemplate(this, this.name, this.props.$template)
        podTemplate.meta.add("%app", this.name)
        return podTemplate
    }

    get ports() {
        return this.template.ports
    }
}
