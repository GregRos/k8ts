export type Cron_Divisor = number
export type Cron_Element_Simple = `${number}` | `*`
export type Cron_Element_Divided = `${Cron_Element_Simple}/${Cron_Divisor}`
type Cron_Element_RangeItem = Cron_Element_Simple | Cron_Element_Divided
export type Cron_Element_Range = `${Cron_Element_RangeItem}-${string}` &
    `${string}-${Cron_Element_RangeItem}`
type Cron_Element_ListItem = Cron_Element_Simple | Cron_Element_Divided | Cron_Element_Range
export type Cron_Element_List<Es extends Cron_Element_ListItem[] = Cron_Element_ListItem[]> =
    Es extends []
        ? ""
        : Es extends [
                infer E extends Cron_Element_ListItem,
                ...infer Rest extends Cron_Element_ListItem[]
            ]
          ? `${E},${Cron_Element_List<Rest>}`
          : never

export type Cron_Element_Real =
    | Cron_Element_Simple
    | Cron_Element_Divided
    | Cron_Element_Range
    | Cron_Element_List
export type Cron_Element = Cron_Element_Real | true | number | false
export type Cron_Tuple<
    Minute extends Cron_Element = Cron_Element,
    Hour extends Cron_Element = Cron_Element,
    DayOfMonth extends Cron_Element = Cron_Element,
    Month extends Cron_Element = Cron_Element,
    DayOfWeek extends Cron_Element = Cron_Element
> = [minute: Minute, hour: Hour, dayOfMonth: DayOfMonth, month: Month, dayOfWeek: DayOfWeek]

export type Cron_Record<
    Minute extends Cron_Element = Cron_Element,
    Hour extends Cron_Element = Cron_Element,
    DayOfMonth extends Cron_Element = Cron_Element,
    Month extends Cron_Element = Cron_Element,
    DayOfWeek extends Cron_Element = Cron_Element
> = {
    minute: Minute
    hour: Hour
    dayOfMonth: DayOfMonth
    month: Month
    dayOfWeek: DayOfWeek
}
export type Cron_RecordToTuple<T extends Cron_Record> = Cron_Tuple<
    T["minute"],
    T["hour"],
    T["dayOfMonth"],
    T["month"],
    T["dayOfWeek"]
>
export type Cron_RecordFromTuple<T extends Cron_Tuple> = {
    minute: T[0]
    hour: T[1]
    dayOfMonth: T[2]
    month: T[3]
    dayOfWeek: T[4]
}
