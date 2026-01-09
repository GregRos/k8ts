import { Metadata } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { display } from "../../../utils/mixin/display"
import { Vertex } from "../node"
import type { ResourceRef } from "../resource"
import { Origin } from "./origin"

@display({
    simple: s => `[${s.shortFqn}]`,
    prefix: s => {
        return ""
    },
    pretty(origin, format) {
        const kindName = chalk.greenBright.bold(origin.kind)
        const resourceName = chalk.cyan(origin.name)
        const pref = this.prefix!()

        return chalk.underline(`${pref}${kindName}:${resourceName}`)
    }
})
export class OriginVertex extends Vertex<OriginVertex, Origin> {
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.cast(Origin).__vertex__)
    }
    get noEmit() {
        return this.entity.noEmit
    }
    get hasInheritedNoEmit() {
        return this.noEmit || this.ancestors.some(x => x.noEmit).pull()
    }
    get name() {
        return this.entity.name
    }
    get metadata() {
        return this.entity.metadata
    }
    get kind() {
        return this.entity.kind
    }
    get shortFqn() {
        return `${this.kind}/${this.name}`
    }
    get inheritedMeta(): Metadata {
        const self = this
        return [this, ...this.ancestors]
            .map(x => x.metadata.clone())
            .reduce((acc, meta) => acc.add(meta), new Metadata())
    }
    constructor(entity: Origin) {
        super(entity)
    }

    get resourceKinds() {
        return this.entity["__resource_kinds__"]
    }

    get relations() {
        return seq([])
    }

    get resources() {
        return this.entity.resources
    }
    readonly attachedTree: Seq<ResourceRef> = seq(() => {
        const self = this
        const desc = self.descendants
            .concatTo([this])
            .map(x => x)
            .concatMap(function* (x) {
                yield* self.resources
                for (const kid of self.kids) {
                    yield* kid.resources
                }
            })
        return desc
    }).cache()
}
