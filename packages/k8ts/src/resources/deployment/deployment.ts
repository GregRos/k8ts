import { manifest, Origin, relations } from "@k8ts/instruments"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { omit } from "lodash"
import { CDK } from "../../_imports"
import { api } from "../../api-kinds"
import { k8ts } from "../../kind-map"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
import { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export type SmallerProps = Omit<CDK.DeploymentSpec, "selector" | "template">
    export type Props<Ports extends string> = SmallerProps & {
        template: PodTemplate.Props<Ports>
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
                    template: noKindFields
                }
            }
        }
    })
    export class Deployment<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        kind = api.apps_.v1_.Deployment
        template: PodTemplate<Ports>
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
