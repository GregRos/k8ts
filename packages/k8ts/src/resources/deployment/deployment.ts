import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, Origin, Refable, relations } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { omit, omitBy } from "lodash"
import { MakeError } from "../../error"
import { k8ts } from "../../kind-map"
import { api2 } from "../../kinds"
import { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export interface Deployment_Strategy_RollingUpdate extends CDK.RollingUpdateDeployment {
        type: "RollingUpdate"
    }
    export interface Deployment_Strategy_Recreate {
        type: "Recreate"
    }
    export type Deployment_Strategy =
        | Deployment_Strategy_RollingUpdate
        | Deployment_Strategy_Recreate
    export type Deployment_Props_Original = Omit<
        CDK.DeploymentSpec,
        "selector" | "template" | "strategy"
    >

    export type Deployment_Props<Ports extends string> = Deployment_Props_Original & {
        $template: PodTemplate.Pod_Props<Ports>
        $strategy?: Deployment_Strategy
    }
    export type Deployment_Ref<Ports extends string> = Refable<api2.apps.v1.Deployment._> & {
        __PORTS__: Ports
    }

    @k8ts(api2.apps.v1.Deployment._)
    @relations({
        kids: s => [s.template]
    })
    @manifest({
        async body(self): Promise<CDK.KubeDeploymentProps> {
            const template = await self.template["manifest"]()
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
    })
    export class Deployment<Ports extends string = string> extends ManifestResource<
        Deployment_Props<Ports>
    > {
        __PORTS__!: Ports
        kind = api2.apps.v1.Deployment._
        template: PodTemplate<Ports>

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
        constructor(origin: Origin, meta: Meta | MutableMeta, props: Deployment_Props<Ports>) {
            super(origin, meta, props)
            this.template = new PodTemplate.Pod_Template(
                origin,
                Meta.make({
                    name: this.name,
                    "%app": this.name
                }),
                props.$template
            )
        }
        get ports() {
            return this.template.ports
        }
    }
}
