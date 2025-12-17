import { BaseOriginEntity, Origin, OriginEntityProps, Refable } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { v1 } from "../../kinds/default"
import { build } from "../k8ts-sys-kind"
export type FileOrigin<FScope extends FileOrigin.Scope = FileOrigin.Scope> =
    FileOrigin.FileEntity<FScope>
export namespace FileOrigin {
    export type Scope = Refable<v1.Namespace._> | "cluster"

    export interface SmallerProps extends OriginEntityProps {
        meta?: Meta.Input
    }
    export interface Props<FScope extends Scope = Scope> extends OriginEntityProps {
        meta?: Meta.Input
        scope: FScope
    }

    export class FileEntity<FScope extends Scope> extends BaseOriginEntity<Props<FScope>> {
        kind = build.current.File._

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
