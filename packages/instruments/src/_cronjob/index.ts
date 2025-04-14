import { displayers } from "../displayers"

export type _SetObjectKey<Obj extends object, K extends keyof Obj, V> = {
    [P in keyof Obj]: P extends K ? V : Obj[P]
}

declare const CRON_STRING: unique symbol

function _convertStanzaElement(X: Cron.Element): string {
    if (X === true) {
        return "*"
    }
    if (X === false) {
        return "0"
    }
    return `${X}`
}
@displayers({
    simple(self) {
        return self.string
    }
})
export class CronStanza<R extends Cron.Record> {
    constructor(private readonly record: R) {}

    get tuple(): Cron.ToTuple<R> {
        return [
            this.record.minute,
            this.record.hour,
            this.record.dayOfMonth,
            this.record.month,
            this.record.dayOfWeek
        ] as Cron.ToTuple<R>
    }

    get string() {
        return this.tuple.map(_convertStanzaElement).join(" ") as Cron.String
    }

    minute<Minute extends Cron.Element>(
        minute: Minute
    ): CronStanza<_SetObjectKey<R, "minute", Minute>> {
        return new CronStanza<_SetObjectKey<R, "minute", Minute>>({
            ...this.record,
            minute
        } as any)
    }

    hour<Hour extends Cron.Element>(hour: Hour): CronStanza<_SetObjectKey<R, "hour", Hour>> {
        return new CronStanza<_SetObjectKey<R, "hour", Hour>>({
            ...this.record,
            hour
        } as any)
    }

    dayOfMonth<DayOfMonth extends Cron.Element>(
        dayOfMonth: DayOfMonth
    ): CronStanza<_SetObjectKey<R, "dayOfMonth", DayOfMonth>> {
        return new CronStanza<_SetObjectKey<R, "dayOfMonth", DayOfMonth>>({
            ...this.record,
            dayOfMonth
        } as any)
    }

    month<Month extends Cron.Element>(month: Month): CronStanza<_SetObjectKey<R, "month", Month>> {
        return new CronStanza<_SetObjectKey<R, "month", Month>>({
            ...this.record,
            month
        } as any)
    }

    dayOfWeek<DayOfWeek extends Cron.Element>(
        dayOfWeek: DayOfWeek
    ): CronStanza<_SetObjectKey<R, "dayOfWeek", DayOfWeek>> {
        return new CronStanza<_SetObjectKey<R, "dayOfWeek", DayOfWeek>>({
            ...this.record,
            dayOfWeek
        } as any)
    }
}

export namespace Cron {
    export type String = string & {
        [CRON_STRING]: true
    }
    export type _CronDivisor = number
    export type _CronBaseElement = `${number}` | `*`
    export type _CronStep = `${_CronBaseElement}/${number}`
    type _RangeElement = _CronBaseElement | _CronStep
    export type _CronRange = `${_RangeElement}-${string}` & `${string}-${_RangeElement}`
    type _ListElement = _CronBaseElement | _CronStep | _CronRange
    export type List<Es extends _ListElement[] = _ListElement[]> = Es extends []
        ? ""
        : Es extends [infer E extends _ListElement, ...infer Rest extends _ListElement[]]
          ? `${E},${List<Rest>}`
          : never
    export type Element = _CronBaseElement | _CronStep | _CronRange | List | true | number | false
    export type Tuple<
        Minute extends Element = Element,
        Hour extends Element = Element,
        DayOfMonth extends Element = Element,
        Month extends Element = Element,
        DayOfWeek extends Element = Element
    > = [minute: Minute, hour: Hour, dayOfMonth: DayOfMonth, month: Month, dayOfWeek: DayOfWeek]

    export type Record<
        Minute extends Element = Element,
        Hour extends Element = Element,
        DayOfMonth extends Element = Element,
        Month extends Element = Element,
        DayOfWeek extends Element = Element
    > = {
        minute: Minute
        hour: Hour
        dayOfMonth: DayOfMonth
        month: Month
        dayOfWeek: DayOfWeek
    }
    export type ToTuple<T extends Record> = Tuple<
        T["minute"],
        T["hour"],
        T["dayOfMonth"],
        T["month"],
        T["dayOfWeek"]
    >
    export type FromTuple<T extends Tuple> = {
        minute: T[0]
        hour: T[1]
        dayOfMonth: T[2]
        month: T[3]
        dayOfWeek: T[4]
    }

    export function of<Tpl extends Tuple>(...items: Tpl): CronStanza<FromTuple<Tpl>> {
        return new CronStanza<FromTuple<Tpl>>({
            minute: items[0],
            hour: items[1],
            dayOfMonth: items[2],
            month: items[3],
            dayOfWeek: items[4]
        })
    }

    export function from<R extends Record>(record: R): CronStanza<R> {
        return new CronStanza<R>(record)
    }

    export const minutely = of(true, true, true, true, true)
    export const hourly = of(0, true, true, true, true)
    export const daily = of(0, 0, true, true, true)
    export const weekly = of(0, 0, true, true, 0)
    export const monthly = of(0, 0, 1, true, true)
    export const yearly = of(0, 0, 1, 1, true)

    export function parse(cron: string): CronStanza<Record> {
        const parts = cron.split(" ")
        if (parts.length !== 5) {
            throw new Error(`Invalid cron string: ${cron}`)
        }
        return of as any
    }

    export function record<R extends Record>(record: R): CronStanza<R> {
        return new CronStanza<R>(record)
    }
}
