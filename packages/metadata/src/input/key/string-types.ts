export type Metadata_Prefix_Label = "%"
export type Metadata_Prefix_Annotation = "^"
export type Metadata_Prefix_Comment = "#"
export type Metadata_Prefix_Any =
    | Metadata_Prefix_Label
    | Metadata_Prefix_Annotation
    | Metadata_Prefix_Comment
export type Metadata_Suffix_Domain = "/"

export type Metadata_Key_Domain = `${string}${Metadata_Suffix_Domain}`
export type Metadata_Key_Core = "name" | "namespace"
export type Metadata_Key_Prefixed = `${Metadata_Prefix_Any}${string}`
export type Metadata_Key_OfValue = Metadata_Key_Prefixed | Metadata_Key_Core
