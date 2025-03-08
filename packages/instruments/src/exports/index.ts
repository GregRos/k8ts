import { seq, type Seq } from "doddle"
import { InstrumentsError } from "../error"
import type { Origin } from "../origin"
import type { LiveRefable } from "../reference"
import { Reference } from "../reference"
import { ReferenceKey } from "../reference/key"
import type { Traced } from "../tracing"

export type DynamicExports<Exps extends LiveRefable> = DynamicExports.DynamicExports<Exps>
export namespace DynamicExports {
    export type DynamicExports<Exps extends LiveRefable> = _ExportsByKey<Exps> & Iterable<Exps>
    export type _ExportsByKey<Exports extends LiveRefable = LiveRefable> = {
        [E in Exports as `${E["api"]["kind"]}/${E["key"]["name"]}`]: Reference<E>
    }

    class ProxyBackend implements ProxyHandler<Iterable<LiveRefable> & Traced> {
        readonly _cached: Seq<LiveRefable>
        constructor(
            readonly $origin: Origin,
            readonly $actual: Iterable<LiveRefable>
        ) {
            this._cached = seq($actual).cache()
        }

        get(target: Iterable<LiveRefable>, prop: string | symbol) {
            if (prop in this.$actual || typeof prop === "symbol") {
                const result = Reflect.get(this.$actual, prop)
                if (typeof result === "function") {
                    return result.bind(this.$actual)
                }
                return result
            }
            const refKey = ReferenceKey.tryParse(prop)
            if (refKey) {
                return Reference.create({
                    key: refKey,
                    class: this.$origin.registered.get(refKey.kind),
                    origin: this.$origin,
                    resolver: this._cached
                        .find(e => e.key.equals(refKey))
                        .map(x => {
                            if (!x) {
                                throw new InstrumentsError(
                                    `Forward reference ${refKey} failed as ${this.$origin} did not produce it.`
                                )
                            }
                            return x
                        })
                })
            }
            return undefined
        }

        get proxy() {
            return new Proxy(this.$actual, {
                get: (target, prop) => {
                    return new Proxy(this.$actual, {
                        get: (target, prop) => {},
                        has: () => {},
                        ownKeys: () =>
                            this._cached
                                .map(e => e.key.toString())
                                .toArray()
                                .pull()
                    }) as any
                }
            })
        }
    }
    export function make<X extends Iterable<Manifests>, Manifests extends LiveRefable>(
        origin: Origin,
        iterable: X
    ): DynamicExports<Manifests> & X {
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
        return new Proxy(this.$actual, {
            get: (target, prop) => {
                return new Proxy(this.$actual, {
                    get: (target, prop) => {
                        if (prop in $actual || typeof prop === "symbol") {
                            const result = Reflect.get($actual, prop)
                            if (typeof result === "function") {
                                return result.bind($actual)
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
