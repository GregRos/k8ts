import { doddlify, seq } from "doddle"
import { memoize } from "lodash"
import { FwReference, type Refable } from "../../reference"
import type { ManifestResource } from "../resource"
import { Origin_Entity } from "./origin-entity"
import type { Origin_Props } from "./origin-node"

export interface Origin_Exporter_Props extends Origin_Props {
    exports(): Iterable<Refable>
}

export abstract class Origin_Exporter<
    Props extends Origin_Exporter_Props = Origin_Exporter_Props
> extends Origin_Entity<Props> {
    constructor(
        private readonly _parent: Origin_Entity,
        name: string,
        props: Props
    ) {
        super(name, props)
        const origExports = this._props.exports
        this._props.exports = memoize(() => seq(origExports).cache())
        this._parent["__attach_kid__"](this)
    }

    protected __parent__() {
        return this._parent
    }

    @doddlify
    get resources(): Iterable<Refable> {
        const self = this
        const boundExports = self.__binder__().bind(self._props.exports)
        const allEmitted = new Set<Refable>()
        const normalResources = seq(() => super.resources).cache()
        return seq(function* () {
            for (const em of boundExports() as ManifestResource[]) {
                if (FwReference.is(em)) {
                    throw new Error(
                        `FwReference ${em} cannot be directly exported from ChildOrigin ${self.name}`
                    )
                }
                if (em instanceof Origin_Entity) {
                    continue
                }

                allEmitted.add(em)
                if (em._origin.equals(self)) {
                    // Means it's being exported for the first time
                    self.__emit__("resource/exported", {
                        origin: self,
                        resource: em
                    })
                }
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
