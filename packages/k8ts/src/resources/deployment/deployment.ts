import { CDK } from "@imports"
import { ManifestResource } from "../../node/base"
import { apps_v1 } from "../api-version"
import { K8tsResources } from "../kind-map"
import type { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export type Props<Ports extends string> = Omit<CDK.DeploymentSpec, "selector" | "template"> & {
        template: PodTemplate<Ports>
    }

    @K8tsResources.register("Deployment")
    export class Deployment<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        api = apps_v1.kind("Deployment")
        get ports() {
            return this.props.template.ports
        }
        manifest(): CDK.KubeDeploymentProps {
            return {
                metadata: this.meta.expand(),
                spec: {
                    ...this.props,
                    selector: {
                        matchLabels: {
                            app: this.name
                        }
                    },
                    template: this.props.template.setMeta(m => m.add("%app", this.name)).manifest()
                }
            }
        }
    }
}
