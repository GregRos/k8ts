import { CDK } from "@imports"
import { connections, manifest } from "@k8ts/instruments"
import { omit } from "lodash"
import { apps_v1 } from "../../api-versions"
import { k8ts } from "../../kind-map"
import { ManifestResource } from "../../node/manifest-resource"
import type { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export type Props<Ports extends string> = Omit<CDK.DeploymentSpec, "selector" | "template"> & {
        template: PodTemplate.PodTemplate<Ports>
    }

    const ident = apps_v1.kind("Deployment")
    @k8ts(ident)
    @connections({
        kids: s => [s.props.template]
    })
    @manifest({
        body(self): CDK.KubeDeploymentProps {
            self.props.template.meta.add("%app", self.name)
            return {
                spec: {
                    ...omit(self.props, "template"),
                    selector: {
                        matchLabels: {
                            app: self.name
                        }
                    },
                    template: self.props.template["manifest"]()
                }
            }
        }
    })
    export class Deployment<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        kind = ident
        get ports() {
            return this.props.template.ports
        }
    }
}
