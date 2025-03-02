import { type ServicePort, IntOrString } from "@k8s"
import type { MapOf } from "immutable"
import type { Data_PortBaseRecord } from "./types"


export class PortMap<Names extends string> {
    constructor(private readonly _entries: MapOf<Data_PortBaseRecord<Names>>) {}

    private _withMap(f: (entries: MapOf<Data_PortBaseRecord<Names>>) => )

    map(mapping: {
        [K in Names]: number
    }) {
        return new PortMap<Names>(
            this._entries.map(entry => {
                return {
                    ...entry,
                    targetPort: entry.port,
                    port: mapping[entry.name]
                }
            })
        )
    }

    get service(): ServicePort[] {
        return this._entries.map(entry => {
            return {
                name: entry.name,
                port: entry.port,
                targetPort: IntOrString.fromNumber(entry.targetPort),
                protocol: entry.protocol
            }
        })
    }
}
