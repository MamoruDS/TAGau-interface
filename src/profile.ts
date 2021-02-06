import * as fs from 'fs'

import { genID } from './utils'

type _RI<I, C> = C extends I ? never : C
type IDType = string

type ProfileConfig = {
    path: string
    readonly: boolean
}

const defaultProfileConfig: Required<ProfileConfig> = {
    path: 'profile.json',
    readonly: false,
}

const NO_ID = '_' // TODO:

class Profile<
    I extends string,
    T extends {
        [key in string]: key extends I
            ? { [id in IDType]: any }
            : Record<string, unknown>
    },
    U extends Record<string, unknown> = {
        [res in keyof T]: {
            [id in IDType]: res extends I ? T[res][keyof T[res]] : T[res]
        }
    }
> {
    readonly _config: ProfileConfig
    private _data: U
    private _IBFields: I[]

    constructor(IBFields: I[] = [], config: Partial<ProfileConfig> = {}) {
        this._config = { ...defaultProfileConfig, ...config }
        this._data = {} as U
        this._IBFields = IBFields
        this._init()
    }
    get path(): string {
        return this._config.path
    }
    get data(): U {
        return this._data
    }
    private _init() {
        this._data = this._read()
    }
    private _read(df = {} as U): U {
        if (!fs.existsSync(this.path)) {
            this._write(df)
            return df
        }
        if (!fs.lstatSync(this.path).isFile) {
            // TODO:
            process.exit(1)
        }
        const _data = JSON.parse(
            fs.readFileSync(this.path, { encoding: 'utf-8' })
        )
        for (const res of Object.keys(_data)) {
            if (!this._isIDBasedField(res)) {
                const temp = JSON.parse(JSON.stringify(_data[res] ?? {}))
                delete _data[res]
                _data[res] = { [NO_ID]: temp }
            }
        }
        return Object.assign(df, _data)
    }
    private _write(data?: U): void {
        if (this._config.readonly) return
        data = data ?? this._data
        const _data = { ...data } as Record<string, unknown>
        for (const res of Object.keys(_data)) {
            if (!this._isIDBasedField(res)) {
                _data[res] = JSON.parse(JSON.stringify(data[res] ?? {}))
                const temp = _data[res][NO_ID]
                delete _data[res][NO_ID]
                _data[res] = temp
            }
        }
        fs.writeFileSync(this.path, JSON.stringify(_data, null, 4), {
            encoding: 'utf-8',
        })
    }
    private _isIDBasedField<R extends keyof T>(res: R): boolean {
        const _r = res as string // ?
        for (const r of this._IBFields) {
            if (r == _r) {
                return true
            }
        }
        return false
    }
    _get(res: any, id?: IDType, raw?: boolean): Record<string, unknown> {
        let e = {}
        if (!this._isIDBasedField(res)) {
            id = NO_ID
            e = { [id]: {} }
        }
        if (typeof this._data[res] == 'undefined') {
            Object.assign(this._data, { [res]: e })
        }
        if (!id) {
            throw new Error() // TODO:
        }
        const data = this._data[res][id]
        return raw ? data : { [id]: data }
    }
    _list(res: any, filters?: unknown[]): Record<string, unknown> {
        // TODO: filter
        if (typeof this._data[res] == 'undefined') {
            Object.assign(this._data, { [res]: {} })
        }
        return this._data[res] as {} // ?
    }
    _add(res: any, data: any): Record<string, unknown> {
        const id = genID()
        delete data['id']
        Object.assign(this._list(res), { [id]: data })
        this._write()
        return this._get(res, id)
    }
    _update(
        res: any,
        id: any,
        data: any,
        path: string[] = []
    ): Record<string, unknown> {
        while (path.length) {
            const p = path.pop()
            if (typeof p != 'undefined') data = { [p]: data }
        }
        Object.assign(this._get(res, id, true), data)
        this._write()
        return this._get(res, id)
    }
    _remove(res: any, id: string): IDType {
        delete this._data[res][id]
        this._write()
        return id
    }
}


export { Profile }
