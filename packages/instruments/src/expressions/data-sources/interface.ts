/** Supported data source type names for type-safe data source handling. */
export type DataSource_Type_Name = "string" | "binary"

/**
 * Maps a data source type name to its corresponding value type.
 *
 * @typeParam Name - The type name ("string" or "binary")
 * @returns String for "string" type, Uint8Array for "binary" type
 */
export type DataSource_Value<Name extends DataSource_Type_Name> = Name extends "string"
    ? string
    : Name extends "binary"
      ? Uint8Array
      : DataSource_Type_Name

/**
 * Interface for objects that provide data source values. Implementations can return values
 * synchronously or asynchronously.
 *
 * @example
 *     class MySource implements DataSource_Object<"string"> {
 *         get() {
 *             return "value"
 *         }
 *     }
 *
 * @typeParam TypeName - The type of data this source provides
 */
export interface DataSource_Object<TypeName extends DataSource_Type_Name = DataSource_Type_Name> {
    get(): DataSource_Value<TypeName> | Promise<DataSource_Value<TypeName>>
}

/**
 * A data source can be either a DataSource_Object or a direct value. This allows for flexible API
 * design where values can be passed directly or lazily loaded.
 *
 * @example
 *     const direct: DataSource<"string"> = "hello"
 *     const lazy: DataSource<"string"> = { get: () => "hello" }
 *
 * @typeParam Only - Constrains the data source to a specific type
 */
export type DataSource<Only extends DataSource_Type_Name = DataSource_Type_Name> =
    | DataSource_Object<Only>
    | DataSource_Value<Only>
