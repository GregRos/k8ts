import { displayers, Origin, OriginEntity, RefKey } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { k8tsBuildKind } from "../k8ts-sys-kind"
import type { Namespace } from "../resources"
export type FileOrigin<FScope extends FileOrigin.Scope = FileOrigin.Scope> =
    FileOrigin.FileEntity<FScope>
export namespace FileOrigin {
    export type Scope = Namespace | "cluster"

    export interface Props<FScope extends Scope = Scope> {
        meta?: Meta.Input
        scope: FScope
    }
    @displayers({
        default: s => s.shortFqn,
        pretty: s => s.node
    })
    export class FileEntity<FScope extends Scope> implements OriginEntity {
        kind = k8tsBuildKind.kind("File")
        readonly node: Origin
        get shortFqn() {
            return this.kind.name
        }
        get meta() {
            return Meta.make(this.props.meta)
        }

        constructor(
            readonly name: string,
            readonly props: Props<FScope>,
            parent: Origin
        ) {
            this.node = new Origin(parent, this, RefKey.make(this.kind, name))
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
