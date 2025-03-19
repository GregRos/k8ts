import {
    Displayers,
    NeedsEdge,
    Origin,
    pretty,
    ResourceNode,
    TextPostProcessor
} from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { List, Map } from "immutable"
import { dump } from "js-yaml"
import { AssembledResult } from "./exporter"
export interface SummarizerOptions {
    printOptions?: boolean
}
export class Summarizer {
    private _post = new TextPostProcessor()
    constructor(private readonly _options: SummarizerOptions) {}
    _formatRefFromTo(node: ResourceNode, edge: NeedsEdge<ResourceNode>) {
        return this._token(pretty`${edge}`)
    }

    private _token(text: string | object) {
        if (typeof text === "object") {
            text = pretty`${text}`
        }
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
            noRefs: true,
            replacer(key, value) {
                if (value instanceof Meta.Meta) {
                    return value.values
                }
                return value
            }
        })
        return result
    }

    private _serialize(input: object) {
        const tree = this._yaml(input)
        const rendered = this._post.render(tree)
        return rendered.replaceAll("- SPACE", "")
    }

    private _getOptions(result: AssembledResult) {
        const obj = {
            options: result.options,
            output: result.files.map(x => {
                return {
                    path: x.path,
                    name: x.filename,
                    saved: x.bytes,
                    manifested: x.artifacts.length
                }
            })
        }
        return this._serialize(obj)
    }

    result(result: AssembledResult) {
        const outputs = [] as string[]
        if (this._options.printOptions) {
            outputs.push(this._getOptions(result))
        }
        outputs.push(
            this.files(
                result.files.map(x => ({
                    origin: x.file,
                    resources: x.artifacts.map(x => x.k8ts)
                }))
            )
        )
        return outputs.join("\n")
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
