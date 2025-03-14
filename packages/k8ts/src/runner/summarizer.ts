import { List, Map } from "immutable"
import { dump } from "js-yaml"
import type { AbsResource, DependsOn } from "../node/abs-resource"

export interface SummarizerOptions {}
function _formatRefFromTo(node: AbsResource, edge: DependsOn) {
    const target = edge.resource
    let fqn = target.shortFqn
    if (node.origin.isParentOf(target.origin)) {
        fqn = `./${fqn}`
    } else {
        fqn = `${target.origin.name}:${fqn}`
    }

    return `${edge.text} -> ${fqn}`
}
export class Summarizer {
    constructor(readonly options: SummarizerOptions) {}

    private _resource(resource: AbsResource): any {
        const subs = resource.subResources.map(sub => {
            const heading = sub.shortFqn
            const description = this._resource(sub)
            return { [heading]: description }
        })
        const depends = resource.dependencies.map(x => _formatRefFromTo(resource, x))
        if (depends.length === 0 && subs.length === 0) {
            return null
        }
        return [...subs, ...depends]
    }

    private _resources(resources: AbsResource[]): object {
        const resourceContainer = List(resources)
            .map(resource => {
                return {
                    [resource.shortFqn]: this._resource(resource)
                }
            })
            .reduce((a, b) => {
                return { ...a, ...b }
            }, {})

        return resourceContainer
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

    files(obj: { filename: string; resources: AbsResource[] }[]) {
        const x = Map(
            obj.map(({ filename, resources }) => {
                return [filename, this._resources(resources)]
            })
        ).toJS()
        return this._serialize(x)
    }
}
