import { seq, type Seq } from "doddle"
import { InstrumentsError } from "../error"
import type { Origin } from "../origin"
import type { LiveRefable } from "../reference"
import { Reference } from "../reference"
import { ReferenceKey } from "../reference/key"

export type _K8ts_Thing2<Exports extends LiveRefable = LiveRefable> = {
    [E in Exports as `${E["api"]["kind"]}/${E["key"]["name"]}`]: Reference<E>
}

export type _K8tsByKind<Exports extends LiveRefable = LiveRefable> = {
    [Kind in Exports["api"]["kind"]]: _K8tsByName<Kind, Exports>
}
export type _K8tsByName<Kind extends string, Exports extends LiveRefable = LiveRefable> = {
    [Name in Exports["key"]["name"]]: _K8ts_Thing2<Exports>[`${Kind}/${Name}`]
}
export type _K8tsRefRecord2<Exports extends LiveRefable = LiveRefable> = _K8ts_Thing2<Exports> &
    Iterable<Exports>

export type _K8tsReferenceRecord<Exports extends LiveRefable = LiveRefable> =
    _K8tsRefRecord2<Exports> & Iterable<Exports>

export type Exports_Ref = {
    readonly origin: Origin
}

export type Exports<Exps extends LiveRefable> = Exports_Ref & _K8tsReferenceRecord<Exps>
export namespace Exports {
    export function make<X extends Iterable<Manifests>, Manifests extends LiveRefable>(
        origin: Origin,
        iterable: X
    ): Exports<Manifests> & X {
        const impl = new Exports_Impl(origin, iterable)
        return impl.getKindedProxy() as any
    }
}

class ExportsOfKind {
    constructor(
        readonly $origin: Origin,
        readonly $kind: string
    ) {}
}

class Exports_Impl {
    private _exports: Seq<LiveRefable>
    constructor(
        readonly $origin: Origin,
        readonly $actual: Iterable<LiveRefable>
    ) {
        this._exports = seq($actual).cache()
    }

    getKindedProxy() {
        const { $actual, $origin } = this
        return new Proxy(this, {
            get: (target, prop) => {
                return new Proxy(this.$actual, {
                    get: (target, prop) => {
                        if (prop in $actual || typeof prop === "symbol") {
                            const result = Reflect.get(target, prop)
                            if (typeof result === "function") {
                                return result.bind(target)
                            }
                            return result
                        }
                        if (typeof prop === "string") {
                            return this.#getNameProxy(prop)
                        }
                    }
                }) as any
            }
        })
    }

    #getNameProxy(kind: string) {
        if (!this.$origin.registered.has(kind)) {
            throw new InstrumentsError(`This ${this.$origin.name} doesn't know the kind ${kind}`)
        }
        const thing = new ExportsOfKind(this.$origin, kind)
        return new Proxy(thing, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    return this.#ref(ReferenceKey.make(kind, prop))
                }
                return Reflect.get(target, prop)
            }
        })
    }

    #ref(spec: ReferenceKey) {
        const parsed = ReferenceKey.parse(spec)
        return Reference.create({
            key: parsed,
            class: this.$origin.registered.get(parsed.kind),
            origin: this.$origin,
            resolver: this._exports
                .find(e => e.key.equals(spec))
                .map(x => {
                    if (!x) {
                        throw new InstrumentsError(`Could not find resource ${spec}`)
                    }
                    return x
                })
        })
    }
}
