export type DataSource_Type_Name = "string" | "binary"
export type DataSource_Value<Name extends DataSource_Type_Name> = Name extends "string"
    ? string
    : Name extends "binary"
      ? Uint8Array
      : DataSource_Type_Name
export interface DataSource_Object<TypeName extends DataSource_Type_Name = DataSource_Type_Name> {
    get(): DataSource_Value<TypeName> | Promise<DataSource_Value<TypeName>>
}

export type DataSource<Only extends DataSource_Type_Name = DataSource_Type_Name> =
    | DataSource_Object<Only>
    | DataSource_Value<Only>
