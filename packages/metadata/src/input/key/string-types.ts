export type Metadata_Key_sPrefix_Label = "%"
export type Metadata_Key_sPrefix_Annotation = "^"
export type Metadata_Key_sPrefix_Comment = "#"
export type Metadata_Key_sPrefix =
    | Metadata_Key_sPrefix_Label
    | Metadata_Key_sPrefix_Annotation
    | Metadata_Key_sPrefix_Comment
export type Metadata_Key_sSuffix_Domain = "/"

export type Metadata_Key_sDomain = `${string}${Metadata_Key_sSuffix_Domain}`
export type Metadata_Key_sCore = "name" | "namespace"
export type Metadata_Key_sPrefixed = `${Metadata_Key_sPrefix}${string}`
export type Metadata_Key_sValue = Metadata_Key_sPrefixed | Metadata_Key_sCore
