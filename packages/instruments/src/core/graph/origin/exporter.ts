import { doddlify, seq } from "doddle"
import { K8tsGraphError } from "../error"
import { ForwardExports, K8sResource, ResourceRef } from "../resource"
import { ForwardRef } from "../resource/forward/ref"
import { OriginEntity } from "./origin"
import type { Origin_Props } from "./props"
export interface OriginExporter_Props extends Origin_Props {}

/** Base class for Origins that export resources via the {@link ForwardExports} mechanism. */
export abstract class ExporterOrigin<
    Props extends OriginExporter_Props = OriginExporter_Props
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

    protected get __parent__() {
        return this._parent
    }

    @doddlify
    get resources(): Iterable<ResourceRef> {
        const self = this
        const boundExports = self.__binder__.bind(self.__exports__.bind(self))
        const allEmitted = new Set<ResourceRef>()
        const attachedResources = seq(() => super.resources).cache()
        return seq(function* () {
            for (const resource of boundExports() as K8sResource[]) {
                if (ForwardRef.is(resource)) {
                    throw new K8tsGraphError(
                        `FwRef ${resource} cannot be directly exported from ChildOrigin ${self.name}`
                    )
                }
                if (resource instanceof OriginEntity || ForwardExports.is(resource)) {
                    // Skip Origin entities. Later we go over attachedResources and after evaluating
                    // these exports, any resources attached to child Origins will be included.
                    continue
                }

                allEmitted.add(resource)
                if (resource["__origin__"].equals(self)) {
                    // Means it's being exported for the first time
                    resource.metadata.add("#k8ts.org/exported", "true")
                    self.__emit__("resource/exported", {
                        origin: self,
                        resource: resource
                    })
                }
                yield resource
            }
            for (const resource of attachedResources) {
                if (!allEmitted.has(resource)) {
                    yield resource
                }
            }
        }).cache()
    }
}
