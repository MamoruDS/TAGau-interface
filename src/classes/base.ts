import { zip } from '../utils'
import { Request } from '../request'

type ClassInterface = {
    [key in string]: {
        t: any
        fa: boolean
    }
}

type SData<T> = {
    [key in keyof T | 'id']: key extends keyof T ? T[key] : string
}

type DataOf<T extends ClassInterface> = {
    [k in keyof T]: T[k]['t']
}

type Pattern<T> = string extends T ? (number extends T ? never : T) : T

type NonPattern<T> = string extends T ? T : number extends T ? T : never

type Repeatable<T> = NonPattern<T> extends never ? never : T[]

type NPRepeat<T> = NonPattern<T> extends never ? T : T[]

type CFilter<T extends object> = {
    allow: {
        [key in keyof T]: NPRepeat<T[key]>
    }
    deny: {
        [key in keyof T]: NPRepeat<T[key]>
    }
}

class Base<T extends object> {
    private _request: Request
    protected _resource: string
    protected _apiVersion: string
    constructor(request: Request, apiVersion: string, resource: string) {
        this._request = request
        this._resource = resource
        this._apiVersion = apiVersion
    }
    protected async _query(method: string, data?: object[], target?: string[]) {
        try {
            return await this._request.open(
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

export { CFilter, ClassInterface, DataOf, SData }
