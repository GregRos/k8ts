import { doddlify, seq } from "doddle"
import { FwRef_Exports, Resource_Top, Rsc_Ref } from "../resource"
import { FwRef } from "../resource/reference/fw-ref"
import { Origin_Entity } from "./entity"
import type { Origin_Props } from "./node"
export interface Origin_Exporter_Props extends Origin_Props {}

/** Base class for Origins that export resources via the {@link FwRef_Exports} mechanism. */
export abstract class Origin_Exporter<
    Props extends Origin_Exporter_Props = Origin_Exporter_Props
> extends Origin_Entity<Props> {
    constructor(
        private readonly _parent: Origin_Entity,
        name: string,
        props: Props
    ) {
        super(name, props)

        this._parent["__attach_kid__"](this)
    }

    protected abstract __exports__(): Iterable<Rsc_Ref>

    protected __parent__() {
        return this._parent
    }

    @doddlify
    get resources(): Iterable<Rsc_Ref> {
        const self = this
        const boundExports = self.__binder__().bind(self.__exports__.bind(self))
        const allEmitted = new Set<Rsc_Ref>()
        const attachedResources = seq(() => super.resources).cache()
        return seq(function* () {
            for (const em of boundExports() as Resource_Top[]) {
                if (FwRef.is(em)) {
                    throw new Error(
                        `FwRef ${em} cannot be directly exported from ChildOrigin ${self.name}`
                    )
                }
                if (em instanceof Origin_Entity || FwRef_Exports.is(em)) {
                    // Skip Origin entities. Later we go over attachedResources and after evaluating
                    // these exports, any resources attached to child Origins will be included.
                    continue
                }

                allEmitted.add(em)
                if (em["__origin__"]().equals(self)) {
                    // Means it's being exported for the first time
                    self.__emit__("resource/exported", {
                        origin: self,
                        resource: em
                    })
                }
                yield em
            }
            for (const resource of attachedResources) {
                if (!allEmitted.has(resource)) {
                    yield resource
                }
            }
        }).cache()
    }
}
