import { CDK } from "@k8ts/imports"
import {
    OriginContextTracker,
    Refable,
    Resource_Top,
    type Resource_Entity
} from "@k8ts/instruments"
import { doddle } from "doddle"
import { omit, omitBy } from "lodash"
import { MakeError } from "../../error"
import { apps } from "../../kinds/apps"
import { Pod_Template, type Pod_Props } from "../pod"

export interface Deployment_Strategy_RollingUpdate extends CDK.RollingUpdateDeployment {
    type: "RollingUpdate"
}
export interface Deployment_Strategy_Recreate {
    type: "Recreate"
}
export type Deployment_Strategy = Deployment_Strategy_RollingUpdate | Deployment_Strategy_Recreate
export type Deployment_Props_Original = Omit<
    CDK.DeploymentSpec,
    "selector" | "template" | "strategy"
>

export type Deployment_Props<Ports extends string> = Deployment_Props_Original & {
    $template: Pod_Props<Ports>
    $strategy?: Deployment_Strategy
}
export type Deployment_Ref<Ports extends string> = Refable<apps.v1.Deployment._> & {
    __PORTS__: Ports
}

export class Deployment<Name extends string, Ports extends string = string> extends Resource_Top<
    Name,
    Deployment_Props<Ports>
> {
    __PORTS__!: Ports
    get kind() {
        return apps.v1.Deployment._
    }

    #_ = (() => {
        const origin = OriginContextTracker.current
        if (!origin) {
            throw new MakeError(
                `Deployment ${this.name} must be created within an OriginEntity context`
            )
        }
        this.props.$template.$POD = origin["__binder__"]().bind(this.props.$template.$POD)
    })()

    protected __kids__(): Resource_Entity[] {
        return [this._template.pull()]
    }
    protected body(): CDK.KubeDeploymentProps {
        const self = this
        const template = self._template.pull()["__submanifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        return {
            spec: {
                ...omitBy(self.props, (x, k) => k.startsWith("$")),
                selector: {
                    matchLabels: {
                        app: self.name
                    }
                },
                template: noKindFields,
                strategy: self._strategy
            }
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
        throw new MakeError(`Invalid strategy type: ${strat}`)
    }
    private readonly _template = doddle(() => {
        const podTemplate = new Pod_Template(this, this.name, this.props.$template)
        podTemplate.meta.add("%app", this.name)
        return podTemplate
    })

    get ports() {
        return this._template.pull().ports
    }
}
