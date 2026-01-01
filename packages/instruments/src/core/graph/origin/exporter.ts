import { doddlify, seq } from "doddle"
import { ForwardExports, ResourceRef, ResourceTop } from "../resource"
import { FwRef } from "../resource/reference/fw-ref"
import { OriginEntity } from "./entity"
import type { OriginProps } from "./node"
export interface OriginExporterProps extends OriginProps {}

/** Base class for Origins that export resources via the {@link ForwardExports} mechanism. */
export abstract class OriginExporter<
    Props extends OriginExporterProps = OriginExporterProps
> extends OriginEntity<Props> {
    constructor(
        private readonly _parent: OriginEntity,
        name: string,
        props: Props
    ) {
        super(name, props)

        this._parent["__attach_kid__"](this)
    }

    protected abstract __exports__(): Iterable<ResourceRef>

    protected __parent__() {
        return this._parent
    }

    @doddlify
    get resources(): Iterable<ResourceRef> {
        const self = this
        const boundExports = self.__binder__().bind(self.__exports__.bind(self))
        const allEmitted = new Set<ResourceRef>()
        const attachedResources = seq(() => super.resources).cache()
        return seq(function* () {
            for (const em of boundExports() as ResourceTop[]) {
                if (FwRef.is(em)) {
                    throw new Error(
                        `FwRef ${em} cannot be directly exported from ChildOrigin ${self.name}`
                    )
                }
                if (em instanceof OriginEntity || ForwardExports.is(em)) {
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
