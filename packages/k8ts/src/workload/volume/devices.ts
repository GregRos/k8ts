import type { Volume as CDK_Volume } from "@imports"
import type { Pvc } from "../../resources/persistent/pvc"

interface PvcBackend {
    backend: Pvc<"Block">
    readOnly?: boolean
}

export type AnyDeviceBackend = PvcBackend
export class Device {
    constructor(
        readonly name: string,
        readonly backend: PvcBackend
    ) {}

    manifest(): CDK_Volume {
        return {
            name: this.name,
            persistentVolumeClaim: {
                claimName: this.backend.backend.name,
                readOnly: this.backend.readOnly
            }
        }
    }

    static make(name: string, input: AnyDeviceBackend) {
        return new Device(name, input)
    }
}
