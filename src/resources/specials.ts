import { Connect } from '.'

class Special {
    private _connect: Connect
    constructor(conn: Connect) {
        this._connect = conn
    }
    protected async _query(path: string[], data?: object[], target?: string[]) {
        try {
            return await this._connect.open(
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
