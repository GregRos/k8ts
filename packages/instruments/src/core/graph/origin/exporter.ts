import { doddlify, seq } from "doddle"
import type { Resource_Top } from "../resource"
import { FwReference, type Ref2_Of } from "../resource"
import { Origin_Entity } from "./entity"
import type { Origin_Props } from "./node"

export interface Origin_Exporter_Props extends Origin_Props {}

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

    protected abstract __exports__(): Iterable<Ref2_Of>

    protected __parent__() {
        return this._parent
    }

    @doddlify
    get resources(): Iterable<Ref2_Of> {
        const self = this
        const boundExports = self.__binder__().bind(self.__exports__.bind(self))
        const allEmitted = new Set<Ref2_Of>()
        const normalResources = seq(() => super.resources).cache()
        return seq(function* () {
            for (const em of boundExports() as Resource_Top[]) {
                if (FwReference.is(em)) {
                    throw new Error(
                        `FwReference ${em} cannot be directly exported from ChildOrigin ${self.name}`
                    )
                }
                if (em instanceof Origin_Entity) {
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
            for (const resource of normalResources) {
                if (!allEmitted.has(resource)) {
                    yield resource
                }
            }
        }).cache()
    }
}
