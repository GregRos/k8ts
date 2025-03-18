import { Displayers, NeedsEdge, Origin, ResourceNode, TextPostProcessor } from "@k8ts/instruments"
import { List, Map } from "immutable"
import { dump } from "js-yaml"
import { pretty } from "./exporter/pretty-print"
export interface SummarizerOptions {}
export class Summarizer {
    private _post = new TextPostProcessor()
    constructor(readonly options: SummarizerOptions) {}
    _formatRefFromTo(node: ResourceNode, edge: NeedsEdge<ResourceNode>) {
        return this._token(pretty`${edge}`)
    }

    private _token(text: string) {
        const token = this._post.token(text)
        return token
    }

    private _resource(resource: ResourceNode): any[] | null {
        const subs = resource.kids
            .map(sub => {
                const heading = Displayers.get(sub).pretty("local")
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
                if (!objForm) {
                    return token
                }
                return {
                    [token]: [...objForm, ...(resource.isRoot ? ["SPACE"] : [])]
                }
            })
            .reduce((a, b) => {
                return [...a, b]
            }, [] as any)

        return resourceContainer
    }

    private _yaml(input: object) {
        const result = dump(input, {
            lineWidth: 800,
            noArrayIndent: true,
            indent: 2,
            noRefs: true
        })
        return result
    }

    private _serialize(input: object) {
        const tree = this._yaml(input)
        const rendered = this._post.render(tree)
        return rendered.replaceAll("- SPACE", "")
    }

    files(obj: { origin: Origin; resources: ResourceNode[] }[]) {
        let pairs = obj.flatMap(({ origin, resources }) => {
            return [
                [this._token(pretty`\n${origin}`), this._resources(resources)] as [string, object]
            ]
        })

        const x = Map(pairs).toJS()
        return this._serialize(x)
    }
}
