import { Origin_Entity, OriginContextTracker } from "@k8ts/instruments"
import { build } from "../k8ts-sys-kind"

export interface ModifierOrigin_Props {}

export class ModifierOrigin extends Origin_Entity<ModifierOrigin_Props> {
    get kind() {
        return build.current.Modifier._
    }

    #currentRunnerState = (() => {
        return OriginContextTracker.disposableOriginModifier(this)
    })();

    [Symbol.dispose]() {
        this.#currentRunnerState[Symbol.dispose]()
    }
}

export function Modifier(name: string, props: ModifierOrigin_Props = {}) {
    return new ModifierOrigin(name, props)
}
