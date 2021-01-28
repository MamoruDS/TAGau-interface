import { Request } from '../request'

class Special {
    private _request: Request
    constructor(request: Request) {
        this._request = request
    }
    protected async _query(path: string[], data?: object[], target?: string[]) {
        try {
            return await this._request.open(
                'POST',
                {
                    url: path.join('/'),
                    data: {
                        input: data,
                    },
                },
                target
            )
        } catch (e) {}
    }
    async health(server: string) {
        return await this._query(['health'], undefined, [server])
    }
}
export { Special }
