import type { Metadata_Input } from "@k8ts/metadata"
import { Metadata } from "@k8ts/metadata"
import type { Gvk_Base } from "./gvk"
import { ResourcePart } from "./part"
import type { Resource_Props } from "./props"
import { cleanBody } from "./util"

export interface ResourceTemplate_Props<ResultType extends object = object>
    extends Resource_Props<ResultType> {
    $metadata?: Metadata_Input
}

export abstract class ResourceTemplate<
    Props extends ResourceTemplate_Props = ResourceTemplate_Props
> extends ResourcePart<Props> {
    abstract get kind(): Gvk_Base

    readonly metadata = new Metadata(this.props.$metadata ?? {})

    protected __metadata__() {
        return {
            name: this.ident.name,
            labels: this.metadata.labels,
            annotations: this.metadata.annotations
        }
    }

    protected abstract __body__(): object

    protected override __submanifest__(): object {
        return {
            metadata: this.__metadata__(),
            ...cleanBody(this.__body__())
        }
    }
}
