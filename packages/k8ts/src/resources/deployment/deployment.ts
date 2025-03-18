import { CDK } from "@imports"
import { connections, manifest, Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { omit } from "lodash"
import { apps_v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node/manifest-resource"
import { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export type Props<Ports extends string> = Omit<CDK.DeploymentSpec, "selector" | "template"> & {
        template: PodTemplate.Props<Ports>
    }

    const ident = apps_v1.kind("Deployment")
    @k8ts(ident)
    @connections({
        kids: s => [s.template]
    })
    @manifest({
        body(self): CDK.KubeDeploymentProps {
            return {
                spec: {
                    ...omit(self.props, "template"),
                    selector: {
                        matchLabels: {
                            app: self.name
                        }
                    },
                    template: self.template["manifest"]()
                }
            }
        }
    })
    export class Deployment<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        kind = ident
        template: PodTemplate<Ports>
        constructor(origin: Origin, meta: Meta, props: Props<Ports>) {
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
