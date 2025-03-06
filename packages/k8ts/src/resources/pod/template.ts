import { CDK } from "@imports"
import { seq } from "doddle"
import { Base } from "../../node/base"
import { apps_v1 } from "../api-version"
import { K8tsResources } from "../kind-map"
import type { Container } from "./container"
import { PodScope } from "./scope"
export type PodTemplateProps<Ports extends string> = Omit<
    CDK.PodSpec,
    "containers" | "initContainers" | "volumes"
> & {
    scope(scope: PodScope): Iterable<Container<Ports>>
}
@K8tsResources.register("PodTemplate")
export class PodTemplate<Ports extends string = string> extends Base<PodTemplateProps<Ports>> {
    api = apps_v1.kind("PodTemplate")
    readonly containers = seq(() => this.props.scope(new PodScope())).cache()
    readonly mounts = seq(() => this.containers.map(x => x.mounts)).cache()
    readonly ports = seq(() => this.containers.map(x => x.ports)).reduce((a, b) => a.union(b))

    manifest(): CDK.PodTemplateSpec {
        const { meta, props } = this
        const containers = this.containers
        const initContainers = containers
            .filter(c => c.subtype === "init")
            .map(x => x.manifest())
            .toArray()
        const mainContainers = containers
            .filter(c => c.subtype === "main")
            .map(x => x.manifest())
            .toArray()

        const volumes = containers
            .concatMap(x => x.volumes)
            .map(x => x.manifest())
            .toArray()
        return {
            metadata: meta.expand(),
            spec: {
                ...props,
                containers: mainContainers.pull(),
                initContainers: initContainers.pull(),
                volumes: volumes.pull()
            }
        }
    }
}
