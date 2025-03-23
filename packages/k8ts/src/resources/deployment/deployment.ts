import { manifest, Origin, Refable, relations, WritableDeep } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { omit } from "lodash"
import { CDK } from "../../_imports"
import { MakeError } from "../../error"
import { k8ts } from "../../kind-map"
import { api } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
import { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export type DeploymentStrategy =
        | { type: "Recreate" }
        | ({
              type: "RollingUpdate"
          } & CDK.RollingUpdateDeployment)
    export type NormalProps = WritableDeep<
        Omit<CDK.DeploymentSpec, "selector" | "template" | "strategy">
    >
    export type Props<Ports extends string> = NormalProps & {
        template: PodTemplate.Props<Ports>
        strategy?: DeploymentStrategy
    }
    export type AbsDeployment<Ports extends string> = Refable<api.apps_.v1_.Deployment> & {
        __PORTS__: Ports
    }

    @k8ts(api.apps_.v1_.Deployment)
    @equiv_cdk8s(CDK.KubeDeployment)
    @relations({
        kids: s => [s.template]
    })
    @manifest({
        async body(self): Promise<CDK.KubeDeploymentProps> {
            const template = await self.template["manifest"]()
            const noKindFields = omit(template, ["kind", "apiVersion"])
            return {
                spec: {
                    ...omit(self.props, "template"),
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
    export class Deployment<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        __PORTS__!: Ports
        kind = api.apps_.v1_.Deployment
        template: PodTemplate<Ports>

        private get _strategy() {
            const strat = this.props.strategy
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
        constructor(origin: Origin, meta: Meta | MutableMeta, props: Props<Ports>) {
            super(origin, meta, props)
            this.template = new PodTemplate.PodTemplate(
                origin,
                Meta.make({
                    name: this.name,
                    "%app": this.name
                }),
                props.template
            )
        }
        get ports() {
            return this.template.ports
        }
    }
}
