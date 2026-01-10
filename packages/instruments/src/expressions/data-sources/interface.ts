/** Supported data source type names for type-safe data source handling. */
export type DataSource_sFormatName = "text" | "binary"

/**
 * Maps a data source type name to its corresponding value type.
 *
 * @typeParam Name - The type name ("text" or "binary")
 * @returns String for "text" type, Uint8Array for "binary" type
 */
export type DataSource_Value<Name extends DataSource_sFormatName> = Name extends "text"
    ? string
    : Name extends "binary"
      ? Uint8Array
      : DataSource_sFormatName

export interface DataSource_Shape<T = any> {
    pull(): Promise<T> | T
}
export type DataSource_Object<TypeName extends DataSource_sFormatName = DataSource_sFormatName> =
    DataSource_Shape<DataSource_Value<TypeName>>
/**
 * A data source can be either a DataSource_Object or a direct value. This allows for flexible API
 * design where values can be passed directly or lazily loaded.
 */
export type DataSource<Only extends DataSource_sFormatName = DataSource_sFormatName> =
    | DataSource_Object<Only>
    | DataSource_Value<Only>
