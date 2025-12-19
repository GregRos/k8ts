import { OriginEntityProps, Refable } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { v1 } from "../../kinds/default"
import { ChildOriginEntity } from "../child-origin"
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

    export class FileEntity<FScope extends Scope> extends ChildOriginEntity<Props<FScope>> {
        kind = build.current.File._
        get scope() {
            return this.props.scope
        }

        protected __post_construct__(): void {
            this.meta = this.meta.add({
                namespace: this.props.scope === "cluster" ? undefined : this.props.scope.name
            })
        }
    }

    export const File = FileEntity
}
