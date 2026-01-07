import { ResourceRef, ResourceTop, type Resource_Props_Top } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omit } from "lodash"
import { apps } from "../../../gvks/apps"
import { K8tsResourceError } from "../../errors"
import { PodTemplate, type PodTemplate_Props } from "../pod"

export interface Deployment_Strategy_RollingUpdate extends CDK.RollingUpdateDeployment {
    type: "RollingUpdate"
    options?: CDK.RollingUpdateDeployment
}
export interface Deployment_Strategy_Recreate {
    type: "Recreate"
}
export type Deployment_Strategy = Deployment_Strategy_RollingUpdate | Deployment_Strategy_Recreate

export interface Deployment_Props<Ports extends string>
    extends Resource_Props_Top<CDK.DeploymentSpec> {
    $replicas?: number
    $template: PodTemplate_Props<Ports>
    $strategy?: Deployment_Strategy
}
const matchLabel = "k8ts.org/app" as const
export class Deployment<Name extends string, Ports extends string = string> extends ResourceTop<
    Name,
    Deployment_Props<Ports>
> {
    get kind() {
        return apps.v1.Deployment._
    }

    protected __kids__(): Iterable<ResourceRef> {
        return [this.Template]
    }
    protected __body__(): CDK.KubeDeploymentProps {
        const self = this
        const template = self.Template["__submanifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        const spec = {
            replicas: self.props.$replicas,
            selector: {
                matchLabels: {
                    [matchLabel]: self.ident.name
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
    get Template() {
        const podTemplate = new PodTemplate(this, this.ident.name, this.props.$template)
        podTemplate.metadata.add(`%${matchLabel}`, this.ident.name)
        return podTemplate
    }

    get ports() {
        return this.Template.ports
    }
}
