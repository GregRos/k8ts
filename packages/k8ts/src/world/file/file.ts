import {
    OriginStackRunner,
    type FutureExports,
    type LiveRefable,
    type OriginEntity
} from "@k8ts/instruments"
import { doddle } from "doddle"
import { FileExports as Exports_ } from "./exports"
import { Factory as Factory_ } from "./factory"
import { FileOrigin } from "./origin"
export type File<T extends LiveRefable = LiveRefable> = File.File<T>
export namespace File {
    export import Factory = Factory_

    export import Exports = Exports_

    export interface Props<
        Scope extends FileOrigin.Scope = FileOrigin.Scope,
        Produced extends LiveRefable = LiveRefable
    > extends FileOrigin.Props<Scope> {
        FILE: Exports.Producer<Scope, Produced>
    }

    export type Input = Exports.Core & Iterable<LiveRefable>
    export type File<T extends LiveRefable> = Exports.Core & FutureExports<T>

    export function make<Scope extends FileOrigin.Scope, Produced extends LiveRefable>(
        name: string,
        props: Props<Scope, Produced>,
        parent: OriginEntity
    ) {
        const origFILE = props.FILE
        const newFILE = OriginStackRunner.bindIter(
            doddle(() => origin),
            origFILE
        )
        props.FILE = newFILE
        const origin = new FileOrigin.FileEntity<Scope>(parent, name, props)
        const exports = Exports.make({
            origin,
            FILE: props.FILE
        })
        return exports as File<Produced>
    }
}
