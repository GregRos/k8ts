export type AccessMode = "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany"

type InputAccessMode = AccessMode | "RWX" | "ROX" | "RWO"
export type InputAccessModes = InputAccessMode | InputAccessMode[]

export type VolumeReclaimPolicy = "Retain" | "Delete" | "Recycle"

export type VolumeMode = "Block" | "Filesystem"

function _parseAccessMode(mode: InputAccessMode): AccessMode {
    switch (mode) {
        case "RWX":
        case "ReadWriteMany":
            return "ReadWriteMany"
        case "ROX":
        case "ReadOnlyMany":
            return "ReadOnlyMany"
        case "RWO":
        case "ReadWriteOnce":
            return "ReadWriteOnce"
    }
}

export function parseAccessModes(modes: InputAccessModes): AccessMode[] {
    if (Array.isArray(modes)) {
        return modes.map(_parseAccessMode)
    } else {
        return [_parseAccessMode(modes)]
    }
}
