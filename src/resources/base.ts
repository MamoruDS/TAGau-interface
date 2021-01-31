import { zip } from '../utils'
import { ITFBase, CFilter, SData, Connect, CoreResponse } from '.'

class Base<T extends object> extends ITFBase<T> {
    private _connect: Connect
    protected _resource: string
    protected _apiVersion: string
    constructor(conn: Connect, apiVersion: string, resource: string) {
        super()
        this._connect = conn
        this._resource = resource
        this._apiVersion = apiVersion
    }
    protected async _query(method: string, data?: object[], server?: string[]) {
        try {
            return await this._connect.open<T>(
                'POST',
                {
                    url: [this._apiVersion, this._resource, method]
                        .filter((r) => r)
                        .join('/'),
                    data: {
                        input: data,
                    },
                },
                server
            )
        } catch (e) {
            throw e // TODO:
        }
    }
    protected async _list(server: string[]): Promise<CoreResponse<SData<T>>[]> {
        return await this._query('list', [], server)
    }
    protected async _filter(
        server: string[],
        filters: CFilter<T>[],
        depths: number[]
    ): Promise<CoreResponse<SData<T>>[]> {
        // TODO:
        return await this._query(
            'filter',
            zip(filters, depths).map((e) =>
                Object.assign({}, { ...e[0], depth: e[1] })
            ),
            server
        )
    }
    protected async _add(
        server: string,
        data: T[]
    ): Promise<CoreResponse<SData<T>>[]> {
        return await this._query('add', data, [server])
    }
    protected async _get(
        server: string[],
        id: string[]
    ): Promise<CoreResponse<SData<T>>[]> {
        return await this._query(
            'list',
            id.map((i) => Object.assign({}, { id: i })),
            server
        )
    }
    protected async _mod(
        server: string,
        id: string[],
        data: T[]
    ): Promise<CoreResponse<SData<T>>[]> {
        return await this._query(
            'mod',
            zip(id, data).map((e) => Object.assign({}, { ...e[1], id: e[0] })),
            [server]
        )
    }
    protected async _del(
        server: string,
        id: string[]
    ): Promise<CoreResponse<SData<T>>[]> {
        return await this._query(
            'del',
            id.map((i) => Object.assign({}, { id: i })),
            [server]
        )
    }
}

export { Base }
