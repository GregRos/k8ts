import { __impl, Origin, RefKey } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { k8tsBuildKind } from "../k8ts-sys-kind"
import type { Namespace } from "../resources"
export type FileOrigin<FScope extends FileOrigin.Scope = FileOrigin.Scope> =
    FileOrigin.FileEntity<FScope>
export namespace FileOrigin {
    export type Scope = Namespace | "cluster"

    export interface Props<FScope extends Scope = Scope> {
        name: string
        meta?: Meta.Input
        scope: FScope
    }
    export class FileEntity<FScope extends Scope> implements __impl {
        kind = k8tsBuildKind.kind("File")
        readonly node: Origin
        get meta() {
            return Meta.make(this.props.meta)
        }

        get name() {
            return this.props.name
        }
        constructor(
            readonly props: Props<FScope>,
            parent: Origin
        ) {
            this.node = new Origin(parent, this, RefKey.make(this.kind, props.name))
        }

        get scope() {
            return this.props.scope
        }
    }

    export function make<FScope extends Scope>(
        props: Props<FScope>,
        parent: Origin
    ): FileEntity<FScope> {
        return new FileEntity(props, parent)
    }
}
