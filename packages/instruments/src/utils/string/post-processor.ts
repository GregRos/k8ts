type K8tsToken = `K8TS_TOK_${string}`
export class TextPostProcessor {
    private tokens = new Map<K8tsToken, string>()
    private _genToken(): K8tsToken {
        const randomKey = Math.random().toString(36).slice(2, 8)
        const token = `K8TS_TOK_${randomKey}` as K8tsToken
        if (this.tokens.has(token)) {
            return this._genToken()
        }
        return token
    }
    token(text: string) {
        const token = this._genToken()
        this.tokens.set(token, text)
        return token
    }

    render(text: string) {
        let result = text
        for (const [token, value] of this.tokens.entries()) {
            result = result.replaceAll(token, value)
        }
        return result
    }
}
