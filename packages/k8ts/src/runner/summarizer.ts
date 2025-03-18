import { NeedsEdge, ResourceNode, TextPostProcessor } from "@k8ts/instruments"
import { List, Map } from "immutable"
import { dump } from "js-yaml"
import { pretty } from "./exporter/pretty-print"

export interface SummarizerOptions {}
export class Summarizer {
    private _post = new TextPostProcessor()
    constructor(readonly options: SummarizerOptions) {}
    _formatRefFromTo(node: ResourceNode, edge: NeedsEdge<ResourceNode>) {
        const target = edge.needed
        let fqn = pretty`${target}`

        return `${edge.why} -> ${this._token(fqn)}`
    }

    private _token(text: string) {
        const token = this._post.token(text)
        return token
    }

    private _resource(resource: ResourceNode): any {
        const subs = resource.kids
            .map(sub => {
                const heading = sub.localName
                const description = this._resource(sub)
                return { [this._token(heading)]: description }
            })
            .toArray()
            .pull()
        const depends = resource.needs
            .map(x => this._formatRefFromTo(resource, x))
            .toArray()
            .pull()
        if (depends.length === 0 && subs.length === 0) {
            return null
        }
        return [...subs, ...depends]
    }

    private _resources(resources: ResourceNode[]): object {
        const resourceContainer = List(resources)
            .map(resource => {
                const text = pretty`${resource}`
                const token = this._token(text)
                const objForm = this._resource(resource)
                return {
                    [token]: objForm
                }
            })
            .reduce((a, b) => {
                return [...a, b]
            }, [] as any)

        return resourceContainer
    }

    private _serialize(input: object) {
        const result = dump(input, {
            lineWidth: 800,
            noArrayIndent: true,
            indent: 2,
            noRefs: true
        })
        return this._post.render(result)
    }

    files(obj: { filename: string; resources: ResourceNode[] }[]) {
        let pairs = obj.map(({ filename, resources }) => {
            return [filename, this._resources(resources)] as [string, object]
        })

        const x = Map(pairs).toJS()
        return this._serialize(x)
    }
}
