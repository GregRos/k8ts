import { NeedsEdge, Origin, ResourceEntity, ResourceNode } from "@k8ts/instruments"
import { seq } from "doddle"
import { List, Map } from "immutable"
import { dump } from "js-yaml"
import { AbsResource } from "../node/abs-resource"

export interface SummarizerOptions {}
function _formatRefFromTo(node: ResourceNode, edge: NeedsEdge<ResourceNode>) {
    const target = edge.needed
    let fqn = target.shortFqn
    if (node.origin.isParentOf(target.origin)) {
        fqn = `./${fqn}`
    } else {
        fqn = `${target.origin.name}:${fqn}`
    }

    return `${edge.why} -> ${fqn}`
}
export class Summarizer {
    constructor(readonly options: SummarizerOptions) {}

    private _resource(resource: ResourceNode): any {
        const subs = resource.kids
            .map(sub => {
                const heading = sub.shortFqn
                const description = this._resource(sub)
                return { [heading]: description }
            })
            .toArray()
            .pull()
        const depends = resource.needs
            .map(x => _formatRefFromTo(resource, x))
            .toArray()
            .pull()
        if (depends.length === 0 && subs.length === 0) {
            return null
        }
        return [...subs, ...depends]
    }

    private _resources(resources: ResourceEntity[]): object {
        const resourceContainer = List(resources)
            .map(resource => {
                return {
                    [resource.shortFqn]: this._resource(resource.node)
                }
            })
            .reduce((a, b) => {
                return { ...a, ...b }
            }, {})

        return resourceContainer
    }

    private _origin(origin: Origin): object {
        return {
            [origin.shortFqn]: null
        }
    }

    private _serialize(input: object) {
        const result = dump(input, {
            lineWidth: 800,
            noArrayIndent: true,
            indent: 2,
            noRefs: true
        })
        return result
    }

    files(
        obj: { filename: string; resources: AbsResource[] }[],
        dangling?: (AbsResource | Origin)[]
    ) {
        let pairs = obj.map(({ filename, resources }) => {
            return [filename, this._resources(resources)] as [string, object]
        })
        if (dangling) {
            const resources = seq(dangling)
                .filter(x => x instanceof AbsResource)
                .toArray()
                .pull()
            const r = this._resources(resources)
            const origins = seq(dangling)
                .filter(x => x instanceof Origin)
                .map(x => this._origin(x))
                .reduce(
                    (a, b) => ({
                        ...a,
                        ...b
                    }),
                    {}
                )
                .pull()
            Object.assign(r, origins)
            pairs = [...pairs, ["Dangling", r]]
        }
        const x = Map(pairs).toJS()
        return this._serialize(x)
    }
}
