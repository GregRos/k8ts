import { Image_Namespace, type ImageNamespace } from "./2-namespace"
import type { JoinIfNotEmpty } from "./types"

class Image_Registry<Text extends string = string> {
    constructor(private _registry: Text) {}

    toString() {
        return this._registry
    }

    get isEmpty() {
        return this._registry === ""
    }

    namespace<Ns extends string = "">(
        namespace?: Ns
    ): ImageNamespace<JoinIfNotEmpty<Text, "/", Ns>> {
        return new Image_Namespace(this._registry, namespace ?? "")
    }
}
export type ImageRegistry<Text extends string = string> = Image_Registry<Text>
export function ImageRegistry<Text extends string = string>(registry: Text): ImageRegistry<Text> {
    return new Image_Registry<Text>(registry)
}
