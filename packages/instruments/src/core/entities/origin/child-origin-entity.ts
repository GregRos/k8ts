import { doddlify, seq } from "doddle"
import { memoize } from "lodash"
import { FwReference, type Refable } from "../../reference"
import { OriginEntity } from "./origin-entity"
import type { Origin_Props } from "./origin-node"

export interface ChildOrigin_Props extends Origin_Props {
    exports(): Iterable<Refable>
}

export abstract class ChildOriginEntity<
    Props extends ChildOrigin_Props = ChildOrigin_Props
> extends OriginEntity<Props> {
    constructor(
        private readonly _parent: OriginEntity,
        name: string,
        props: Props
    ) {
        super(name, props)
        const origExports = this._props.exports
        this._props.exports = memoize(() => seq(origExports).cache())
        this._parent.__attach_kid__(this)
    }

    protected __parent__() {
        return this._parent
    }

    @doddlify
    get resources(): Iterable<Refable> {
        const self = this
        const boundExports = self.__bind__(self._props.exports)
        const allEmitted = new Set<Refable>()
        const normalResources = seq(() => super.resources).cache()
        return seq(function* () {
            for (const em of boundExports()) {
                if (FwReference.is(em)) {
                    throw new Error(
                        `FwReference ${em} cannot be directly exported from ChildOrigin ${self.name}`
                    )
                }
                if (em instanceof OriginEntity) {
                    continue
                }

                allEmitted.add(em)
                yield em
            }
            for (const resource of normalResources) {
                if (!allEmitted.has(resource)) {
                    yield resource
                }
            }
        }).cache()
    }
}
