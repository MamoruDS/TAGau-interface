import { zip } from '../utils'
import { ITFBase, CFilter, SData, Connect } from '.'

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
    protected async _query(method: string, data?: object[], target?: string[]) {
        try {
            return await this._connect.open(
                'POST',
                {
                    // url: `${this._resource}/${method}`,
                    url: [this._apiVersion, this._resource, method]
                        .filter((r) => r)
                        .join('/'),
                    data: {
                        input: data,
                    },
                },
                target
            )
        } catch (e) {
            console.log('error happened during open')
            // console.error(e)
        }
    }
    protected async _list(targets: string[]): Promise<SData<T>[]> {
        return await this._query('list', [], targets)
    }
    protected async _filter(
        targets: string[],
        filters: CFilter<T>[],
        depths: number[]
    ): Promise<SData<T>[]> {
        // TODO:
        return await this._query(
            'filter',
            zip(filters, depths).map((e) =>
                Object.assign({}, { ...e[0], depth: e[1] })
            ),
            targets
        )
    }
    protected async _add(target: string, data: T[]): Promise<SData<T>[]> {
        return await this._query('add', data, [target])
    }
    protected async _get(targets: string[], id: string[]): Promise<SData<T>[]> {
        return await this._query(
            'list',
            id.map((i) => Object.assign({}, { id: i })),
            targets
        )
    }
    protected async _mod(
        target: string,
        id: string[],
        data: T[]
    ): Promise<SData<T>[]> {
        return await this._query(
            'mod',
            zip(id, data).map((e) => Object.assign({}, { ...e[1], id: e[0] })),
            [target]
        )
    }
    protected async _del(target: string, id: string[]): Promise<void> {
        await this._query(
            'del',
            id.map((i) => Object.assign({}, { id: i })),
            [target]
        )
    }
}

export { Base }
