export interface PortBase<Name extends string> extends PortSpecObj {
    name: Name
}

export type PortBaseInput = PortSpecObj | Port | PortSpec

export type PortBaseInputs<Names extends string> = {
    [K in Names]: PortBaseInput
}

export function parsePortEntry(key: string, value: PortBaseInput) {}
