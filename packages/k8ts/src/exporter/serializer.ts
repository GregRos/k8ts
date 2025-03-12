import Emittery from "emittery"
import { dump, type DumpOptions } from "js-yaml"

export interface YamlSerializerOptions {
    jsYamlOptions: DumpOptions
}
export interface SerializingEvent {
    manifest: object
}
export interface YamlSerializerEvents {
    serializing: SerializingEvent
}
export class YamlSerializer extends Emittery<YamlSerializerEvents> {
    constructor(private readonly _options: Partial<YamlSerializerOptions>) {
        super()
    }

    async serialize(input: object) {
        await this.emit("serializing", { manifest: input })

        const result = dump(input, {
            lineWidth: 800,
            noArrayIndent: true,
            indent: 2,
            ...this._options.jsYamlOptions,
            noRefs: true
        })
        return result
    }
}
