import { BaseOriginEntity, Origin, OriginEntityProps } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { k8tsBuildKind } from "../k8ts-sys-kind"
import type { Namespace } from "../resources"
export type FileOrigin<FScope extends FileOrigin.Scope = FileOrigin.Scope> =
    FileOrigin.FileEntity<FScope>
export namespace FileOrigin {
    export type Scope = Namespace | "cluster"

    export interface SmallerProps extends OriginEntityProps {
        meta?: Meta.Input
    }
    export interface Props<FScope extends Scope = Scope> extends OriginEntityProps {
        meta?: Meta.Input
        scope: FScope
    }

    const ident = k8tsBuildKind.kind("File")
    export class FileEntity<FScope extends Scope> extends BaseOriginEntity<Props<FScope>> {
        kind = k8tsBuildKind.kind("File")

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
