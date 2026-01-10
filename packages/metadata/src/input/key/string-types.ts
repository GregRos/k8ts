export type Metadata_Key_sPrefix_Label = "%"
export type Metadata_Key_sPrefix_Annotation = "^"
export type Metadata_Key_sPrefix_Comment = "#"
export type Metadata_Key_sPrefix =
    | Metadata_Key_sPrefix_Label
    | Metadata_Key_sPrefix_Annotation
    | Metadata_Key_sPrefix_Comment
export type Metadata_Key_sSuffix_Domain = "/"

export type Metadata_Key_sDomain = `${string}${Metadata_Key_sSuffix_Domain}`
export type Metadata_Key_sPrefixed = `${Metadata_Key_sPrefix}${string}`
export type Metadata_Key_sValue = Metadata_Key_sPrefixed
export type NotPrefixed<T extends string> = [T] extends [Metadata_Key_sPrefixed]
    ? `𝗣𝗿𝗲𝗳𝗶𝘅𝗲𝘀 𝗮𝗿𝗲 𝗶𝗹𝗹𝗲𝗴𝗮𝗹 𝗶𝗻 𝘁𝗵𝗲 𝗱𝗼𝗺𝗮𝗶𝗻 𝘀𝗲𝗰𝘁𝗶𝗼𝗻`
    : Metadata_Key_sDomain
