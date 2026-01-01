import { OriginContextTracker, ResourceRef, ResourceTop } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { omit, omitBy } from "lodash"
import { MakeError } from "../../error"
import { apps } from "../../idents/apps"
import { Pod_Template, type Pod_Props } from "../pod"

export interface DeploymentStrategyRollingUpdate extends CDK.RollingUpdateDeployment {
    type: "RollingUpdate"
}
export interface Deployment_Strategy_Recreate {
    type: "Recreate"
}
export type Deployment_Strategy = DeploymentStrategyRollingUpdate | Deployment_Strategy_Recreate

export type DeploymentProps<Ports extends string> = Omit<
    CDK.DeploymentSpec,
    "selector" | "template" | "strategy"
> & {
    $template: Pod_Props<Ports>
    $strategy?: Deployment_Strategy
}
export type DeploymentRef<Ports extends string> = ResourceRef<apps.v1.Deployment._> & {
    __PORTS__: Ports
}

export class Deployment<Name extends string, Ports extends string = string> extends ResourceTop<
    Name,
    DeploymentProps<Ports>
> {
    __PORTS__!: Ports
    get ident() {
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

    protected __kids__(): Iterable<ResourceRef> {
        return [this.template]
    }
    protected body(): CDK.KubeDeploymentProps {
        const self = this
        const template = self.template["__submanifest__"]()
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

    @doddlify
    get template() {
        const podTemplate = new Pod_Template(this, this.name, this.props.$template)
        podTemplate.meta.add("%app", this.name)
        return podTemplate
    }

    get ports() {
        return this.template.ports
    }
}
