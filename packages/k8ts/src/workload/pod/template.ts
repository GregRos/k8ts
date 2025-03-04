import { PodSpec as CDK_PodSpec, PodTemplateSpec as CDK_PodTemplateSpec } from "@imports"
import type { Meta } from "@k8ts/metadata"
import type { Container } from "../container/container"
import { PodScope } from "./scope"
export type PodTemplateProps<Ports extends string> = Omit<
    CDK_PodSpec,
    "containers" | "initContainers" | "volumes"
> & {
    containers(scope: PodScope): Iterable<Container<Ports>>
}

export class PodTemplate<Ports extends string> {
    constructor(
        readonly meta: Meta,
        readonly props: PodTemplateProps<Ports>
    ) {}

    manifest(): CDK_PodTemplateSpec {
        const { meta, props } = this
        const containers = [...props.containers(new PodScope())]
        const initContainers = containers.filter(c => c.subtype === "init").map(x => x.manifest())
        const mainContainers = containers.filter(c => c.subtype === "main").map(x => x.manifest())
        const volumes = containers
            .flatMap(x => Object.values(x.props.mounts ?? {}))
            .map(x => x.parent)
            .map(x => x.manifest())
        return {
            metadata: meta.expand(),
            spec: {
                ...props,
                containers: mainContainers,
                initContainers,
                volumes
            }
        }
    }
}
