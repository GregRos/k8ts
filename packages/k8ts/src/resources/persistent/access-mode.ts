export type PvAccessMode_Explicit = "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany"
export type PvAccessMode = PvAccessMode_Explicit | "RWX" | "ROX" | "RWO"
export type PvAccessModes = PvAccessMode | PvAccessMode[]

function parseOne(mode: PvAccessMode): PvAccessMode_Explicit {
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

export function parsePvAccessMode(modes: PvAccessModes): PvAccessMode_Explicit[] {
    if (Array.isArray(modes)) {
        return modes.map(parseOne)
    } else {
        return [parseOne(modes)]
    }
}
