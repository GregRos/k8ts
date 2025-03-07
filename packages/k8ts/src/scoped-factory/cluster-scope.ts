import { type LiveRefable } from "@k8ts/instruments"
import { Namespace } from "../resources/namespace"

import { Persistent } from "../resources"
import { BaseFactory } from "./k8ts-scope"

export class Cluster extends BaseFactory {
    PersistentVolume<Name extends string, Mode extends Persistent.DataMode = "Filesystem">(
        name: Name,
        props: Persistent.Volume.Props<Mode>
    ) {
        return new Persistent.Volume.Volume(
            this.origin,
            this._metaWithName(name),
            props
        ) as LiveRefable<Persistent.Volume<Mode>, Name>
    }
    Namespace<Name extends string>(name: Name, props?: Namespace.Props) {
        return new Namespace.Namespace(this.origin, this._metaWithName(name), props) as LiveRefable<
            Namespace,
            Name
        >
    }
}
