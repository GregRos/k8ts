import { ChildOrigin, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata/."
import type { Namespace } from "../resources"
export type FileOrigin<FScope extends FileOrigin.Scope = FileOrigin.Scope> =
    FileOrigin.FileOrigin<FScope>
export namespace FileOrigin {
    export type Scope = Namespace | "cluster"

    export interface Props<FScope extends Scope = Scope> {
        filename: string
        meta?: Meta.Input
        scope: FScope
    }

    export class FileOrigin<FScope extends Scope> extends ChildOrigin {
        constructor(
            private _props: Props<FScope>,
            parent: Origin
        ) {
            super(_props.filename, Meta.make(_props.meta), parent)
        }

        get scope() {
            return this._props.scope
        }
    }

    export function make<FScope extends Scope>(
        props: Props<FScope>,
        parent: Origin
    ): FileOrigin<FScope> {
        return new FileOrigin(props, parent)
    }
}
