import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { doddle, seq, Seq } from "doddle"
import StackTracey from "stacktracey"
import { getMarkerForExternal, getMarkerForIndex } from "../_string"
import { displayers } from "../displayers"
import { KindMap } from "../kind-map"
import { RefKey } from "../ref-key"
import { TraceEmbedder } from "../tracing"
import { Trace } from "../tracing/trace"
import { BaseEntity, BaseNode } from "./base-node"
import { ResourceNode } from "./resource-node"
@displayers({
    simple: s => `[${s.shortFqn}]`,
    prefix: s => {
        if (s.name === "EXTERNAL") {
            return getMarkerForExternal()
        }
        return getMarkerForIndex(s.index)
    },
    pretty(origin, format) {
        const kindName = chalk.greenBright.bold(origin.kind.name)
        const resourceName = chalk.cyan(origin.name)
        const pref = this.prefix!()

        return chalk.underline(`${pref}${kindName}:${resourceName}`)
    }
})
export class Origin extends BaseNode<Origin, OriginEntity> implements Iterable<ResourceNode> {
    private _kids = [] as Origin[]
    get kids() {
        return seq(this._kids)
    }
    get meta() {
        return this._entity.meta
    }
    readonly index: number
    private readonly _getIndex = doddle(() => {
        let index = 1
        return () => index++
    }).pull()
    constructor(
        readonly parent: Origin | null,
        entity: OriginEntity,
        readonly key: RefKey
    ) {
        super(entity)
        this.index = parent?._getIndex() ?? 0
        this._kindMap = new KindMap(undefined, parent?._kindMap)
    }
    get resourceKinds() {
        return this._kindMap
    }
    private _kindMap: KindMap
    private _attached = [] as ResourceNode[]

    get relations() {
        return seq.empty()
    }
    [Symbol.iterator]() {
        return this.resources[Symbol.iterator]()
    }
    readonly attachedTree: Seq<ResourceNode> = seq(() => {
        const self = this
        const desc = self.descendants.prepend(this).concatMap(function* (x) {
            yield* self.resources
            for (const kid of self.kids) {
                yield* kid.resources
            }
        })
        return desc
    }).cache()

    get resources() {
        return this._attached
    }

    static registerWithOrigin<F extends Function>(ctor: F) {
        const prototype = ctor.prototype
        for (const key of Object.getOwnPropertyNames(prototype)) {
            const value = prototype[key]
            if (!key.match(/^[A-Z]/) || typeof value !== "function") {
                continue
            }
            const orig = prototype[key]
            prototype[key] = {
                [key](this: any, ...args: any[]) {
                    const result = orig.apply(this, args) as BaseEntity<any>
                    if (
                        typeof result === "object" &&
                        "node" in result &&
                        result.node instanceof ResourceNode
                    ) {
                        result.node.origin.__attach_resource__([result.node])
                        TraceEmbedder.set(result.node, new Trace(new StackTracey().slice(1)))
                    }
                    return result
                }
            }[key]
        }
    }

    private __attach_child__(child: Origin) {
        this._kids.push(child)
    }

    private __attach_resource__(resources: ResourceNode | Iterable<ResourceNode>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._attached.push(resource)
        }
    }
}
export interface OriginEntity extends BaseEntity<Origin> {
    alias?: string
    meta: Meta
}

export const auto_register = Origin.registerWithOrigin
