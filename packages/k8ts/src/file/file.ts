import type { FutureExports, Origin } from "@k8ts/instruments"
import type { ManifestResource } from "../node"
import { FileExports as Exports_ } from "./exports"
import { Factory as Factory_ } from "./factory"
import { FileOrigin } from "./origin"
export type File<T extends ManifestResource = ManifestResource> = File.File<T>
export namespace File {
    export import Factory = Factory_

    export import Exports = Exports_

    export interface Props<
        Scope extends FileOrigin.Scope = FileOrigin.Scope,
        Produced extends ManifestResource = ManifestResource
    > extends FileOrigin.Props<Scope> {
        FILE: Exports.Producer<Scope, Produced>
    }

    export type Input = Exports.Core & Iterable<ManifestResource>
    export type File<T extends ManifestResource> = Exports.Core & FutureExports<T>

    export function make<Scope extends FileOrigin.Scope, Produced extends ManifestResource>(
        props: Props<Scope, Produced>,
        parent: Origin
    ) {
        const origin = FileOrigin.make(props, parent)
        parent.attach(origin)
        const exports = Exports.make({
            origin,
            FILE: props.FILE
        })
        return exports as File<Produced>
    }
}
