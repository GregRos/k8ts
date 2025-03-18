import { Displayers, NeedsEdge, Origin, ResourceNode, TextPostProcessor } from "@k8ts/instruments"
import { attr, quantity } from "@k8ts/instruments/src/_string/pretty-objects"
import { pretty } from "@k8ts/instruments/src/_string/pretty-print"
import { List, Map } from "immutable"
import { dump } from "js-yaml"
import { AssembledResult } from "./exporter"
export interface SummarizerOptions {}
export class Summarizer {
    private _post = new TextPostProcessor()
    constructor(readonly options: SummarizerOptions) {}
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
            noRefs: true
        })
        return result
    }

    private _serialize(input: object) {
        const tree = this._yaml(input)
        const rendered = this._post.render(tree)
        return rendered.replaceAll("- SPACE", "")
    }

    result(result: AssembledResult) {
        const obj = {
            options: result.options,
            files: result.files.map(x => {
                const o = Map([
                    [attr("path"), x.path as any],
                    [attr("name"), x.filename as any],
                    [attr("saved"), quantity(x.bytes, "byte")],
                    [attr("manifested"), quantity(x.artifacts.length, "resources")]
                ])
                    .mapEntries(([k, v]) => {
                        return [this._token(k), this._token(v)]
                    })
                    .toJS()

                return o
            })
        }
        return [
            this._serialize(obj),
            this.files(
                result.files.map(x => ({
                    origin: x.file,
                    resources: x.artifacts.map(x => x.k8ts)
                }))
            )
        ].join("\n")
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
