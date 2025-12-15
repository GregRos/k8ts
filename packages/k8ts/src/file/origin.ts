import { BaseOriginEntity, Origin, OriginEntityProps, Refable } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { K8tsKinds } from "../k8ts-sys-kind"
import { api_ } from "../kinds"
export type FileOrigin<FScope extends FileOrigin.Scope = FileOrigin.Scope> =
    FileOrigin.FileEntity<FScope>
export namespace FileOrigin {
    export type Scope = Refable<api_.v1_.Namespace> | "cluster"

    export interface SmallerProps extends OriginEntityProps {
        meta?: Meta.Input
    }
    export interface Props<FScope extends Scope = Scope> extends OriginEntityProps {
        meta?: Meta.Input
        scope: FScope
    }

    export class FileEntity<FScope extends Scope> extends BaseOriginEntity<Props<FScope>> {
        kind = K8tsKinds.build_.current_.File

        constructor(name: string, props: Props<FScope>, parent: Origin) {
            super(name, props, parent)
            this.meta = this.meta.add({
                namespace: props.scope === "cluster" ? undefined : props.scope.name
            })
        }

        get scope() {
            return this.props.scope
        }
    }

    export function make<FScope extends Scope>(
        name: string,
        props: Props<FScope>,
        parent: Origin
    ): FileEntity<FScope> {
        return new FileEntity(name, props, parent)
    }
}
