import {
    Queryer as _Queryer,
    QueryMethods,
    QueryResp,
    IDBaseProp,
} from 'tagau-res'

import { ID, QueryerID, ResTypes } from './main'
import { ItemNotExist } from './main'
import { ERR_CODE } from './constant'

import { genID, zip } from './utils'
import { Profile } from './profile'

type Response<T extends Record<string, unknown> = Record<string, unknown>> = {
    data: {
        server_id: QueryerID
        ok: boolean
        status: number
        // good: (Partial<T> & { id: ID })[] // TODO:
        good: any[]
        bad: { id: ID; err_code: number }[]
    }[]
    ok: boolean
    status: number
}

type QueryTarget = IDBaseProp<QueryerID> &
    Partial<{
        host: string
        port: string
        token: string | number
    }>

type QueryerConfig = {
    apiVersion: 'alpha' | 'v0'
}

const defaultQueryerConfig = {
    apiVersion: 'alpha',
} as QueryerConfig

class QueryerRemote<T extends Record<string, unknown>>
    implements _Queryer<ID, QueryerID, T, ResTypes, QueryTarget> {
    private _targets: QueryTarget[]
    private _config: QueryerConfig
    constructor(config: QueryerConfig = defaultQueryerConfig) {
        this._targets = []
        this._config = config
        this._init()
    }
    get targets(): QueryTarget[] {
        return this._targets
    }
    get default(): QueryTarget {
        return this._targets[0]
    }
    get defaultID(): QueryerID {
        return this._targets[0].id
    }
    private _findOne(id: QueryerID): QueryTarget {
        return this._targets[parseInt(this._findOneIdx(id))]
    }
    private _findOneIdx(id: QueryerID): QueryerID {
        let idx: QueryerID | undefined
        for (const i in this._targets) {
            if (this._targets[i].id == id) {
                idx = i
                break
            }
        }
        if (typeof idx == 'undefined') throw new ItemNotExist()
        return idx
    }
    async _init(): Promise<void> {
        // TODO:
        return
    }
    async _query(
        target: QueryTarget,
        path: string[],
        method: QueryMethods,
        params: Record<string, string> = {},
        data?: unknown
    ): Promise<QueryResp<ID, QueryerID, T>> {
        const param = new URLSearchParams(params)
        path.unshift(this._config.apiVersion)
        const url = `${target.host}:${target.port}/${path.join('/')}${
            Object.keys(params).length ? '?' + param.toString() : ''
        }`
        const r = {
            target_id: target.id,
            ok: false,
            status: 200,
            good: [],
            bad: [],
        } as QueryResp<ID, QueryerID, T>
        const resp = await fetch(url, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            body:
                method == 'GET'
                    ? undefined
                    : data
                    ? JSON.stringify(data)
                    : undefined,
            credentials: 'include',
            keepalive: true,
        })
        if (resp.ok) {
            const _resp = (await resp.json()) as Response
            r.ok = true
            r.good = _resp.data[0].good
            r.bad = _resp.data[0].bad
        }
        return r
    }
    async query(
        targets: QueryerID[],
        rt: ResTypes,
        method: QueryMethods,
        data?: Record<string, unknown>[]
    ): Promise<QueryResp<ID, QueryerID, T>[]> {
        targets = targets ?? []
        const res: QueryResp<ID, QueryerID, T>[] = []
        for (const t of targets) {
            res.push(
                await this._query(this._findOne(t), [rt], method, {}, data)
            )
        }
        return res
    }
    add(target: Partial<QueryTarget>): QueryerID {
        const id = genID()
        this._targets.push({ ...target, id })
        return id
    }
    del(id: QueryerID): QueryerID {
        return this._targets.splice(parseInt(this._findOneIdx(id)), 1)[0].id
    }
    async test(
        target?: QueryerID
    ): Promise<{
        ok: boolean
        err_code?: number
        info?: Record<string, unknown>
    }> {
        const resp = await this._query(
            this._findOne(target ?? this.defaultID),
            ['server'],
            'GET'
        )
        if (resp.ok) {
            // TODO: using try { } catch { }
        }
        return {
            ok: resp.ok,
        }
    }
}

type QueryTargetLocal = IDBaseProp<QueryerID> &
    Partial<{
        path: string
        readonly: boolean
    }>

type ProfileResIDBasedFields = 'server'

type ProfileRes = {
    server: {
        [key: string]: {
            port: number
        }
    }
    preference: {
        theme: 'dark' | 'light' // TODO: remove example
    }
}
type QueryerConfigLocal = {
    path: string
    readonly: boolean
}

const defaultQueryerConfigLocal = {
    path: 'profile.json',
    readonly: false,
} as QueryerConfigLocal

class QueryerLocal<T extends Record<string, unknown>>
    implements _Queryer<ID, QueryerID, T, keyof ProfileRes, QueryTargetLocal> {
    private _targets: QueryTargetLocal[]
    private _config: QueryerConfigLocal
    private _profiles: {
        [key in string]: Profile<ProfileResIDBasedFields, ProfileRes>
    }
    constructor(config: Partial<QueryerConfigLocal> = {}) {
        this._targets = []
        this._config = { ...defaultQueryerConfigLocal, ...config }
        this._profiles = {}
        this._init()
    }
    get targets(): QueryTargetLocal[] {
        return this._targets
    }
    get default(): QueryTargetLocal {
        return this._targets[0]
    }
    get defaultID(): QueryerID {
        return this._targets[0].id
    }
    private _findOne(id: QueryerID): QueryTargetLocal {
        return this._targets[parseInt(this._findOneIdx(id))]
    }
    private _findOneIdx(id: QueryerID): QueryerID {
        let idx: QueryerID | undefined
        for (const i in this._targets) {
            if (this._targets[i].id == id) {
                idx = i
                break
            }
        }
        if (typeof idx == 'undefined') throw new ItemNotExist()
        return idx
    }
    private _convertProfile<R extends keyof ProfileRes>(
        data: Record<string, unknown>
    ): (Partial<T> & { id: ID })[] {
        const arr = []
        for (const id of Object.keys(data)) {
            const d = (data[id] as {}) ?? {}
            arr.push({
                id,
                ...d,
            })
        }
        return arr
    }
    private _promisedProfileMan<U extends Partial<T> & { id: ID }>(
        data: U[],
        fn: (data: U) => U[],
        fb: (data: U) => { id: ID }[] = ({ id }) => [{ id }],
        good: U[] = [],
        bad: { id: ID; err_code: number }[] = []
    ): { good: U[]; bad: { id: ID; err_code: number }[] } {
        for (const d of data) {
            try {
                fn({ ...d }).map((r) => good.push(r))
            } catch (e) {
                if (e instanceof ItemNotExist) {
                    fb({ ...d }).map(({ id }) =>
                        bad.push({ id, err_code: ERR_CODE.NOT_FOUND })
                    )
                } else {
                    // TODO: other error
                    // throw e
                    fb({ ...d }).map(({ id }) =>
                        bad.push({ id, err_code: ERR_CODE.UNKNOWN })
                    )
                }
            }
        }
        return { good, bad }
    }
    private _init(): void {
        this.add({ path: this._config.path, readonly: this._config.readonly })
    }
    async _query(
        target: QueryTargetLocal,
        rt: keyof ProfileRes,
        method: QueryMethods,
        data?: unknown
    ): Promise<QueryResp<ID, QueryerID, T>> {
        const r = {
            target_id: target.id,
            ok: false,
            status: 200,
            good: [],
            bad: [],
        } as QueryResp<ID, QueryerID, T>
        const profile = this._profiles[target.id]
        if (Array.isArray(data)) {
            if (method == 'GET') {
                if (data.length) {
                    this._promisedProfileMan(
                        data,
                        ({ id }) => {
                            return this._convertProfile(profile._get(rt, id))
                        },
                        ({ id }) => {
                            return [{ id }]
                        },
                        r.good,
                        r.bad
                    )
                } else {
                    r.good = this._convertProfile(profile._list(rt))
                }
            }
            if (method == 'POST') {
                if (data.length) {
                    this._promisedProfileMan(
                        data,
                        (d) => {
                            delete d['id'] // TODO:
                            return this._convertProfile(profile._add(rt, d))
                        },
                        ({ id }) => {
                            return [{ id }]
                        },
                        r.good,
                        r.bad
                    )
                }
            }
            if (method == 'PUT') {
                if (data.length) {
                    this._promisedProfileMan(
                        data,
                        (d) => {
                            const id = d['id']
                            delete d['id']
                            return this._convertProfile(
                                profile._update(rt, id, d)
                            )
                        },
                        ({ id }) => [{ id }],
                        r.good,
                        r.bad
                    )
                }
            }
            if (method == 'DELETE') {
                if (data.length) {
                    this._promisedProfileMan(
                        data,
                        ({ id }) => {
                            profile._remove(rt, id)
                            return this._convertProfile({ id })
                        },
                        ({ id }) => {
                            return [{ id }]
                        },
                        r.good,
                        r.bad
                    )
                }
            }
        } else {
            // TODO: throw new error
        }
        r.ok = true
        return r
    }
    async query(
        targets: QueryerID[],
        rt: keyof ProfileRes,
        method: QueryMethods,
        data?: Record<string, unknown>[]
    ): Promise<QueryResp<ID, QueryerID, T>[]> {
        targets = [this.defaultID] // TODO: local only
        const res: QueryResp<ID, QueryerID, T>[] = []
        for (const t of targets) {
            res.push(await this._query(this._findOne(t), rt, method, data))
        }
        return res
    }
    add(target: Partial<QueryTargetLocal>) {
        const id = genID()
        this._targets.push({ ...target, id })
        this._profiles[id] = new Profile<ProfileResIDBasedFields, ProfileRes>(
            ['server'],
            {
                path: target.path,
                readonly: target.readonly,
            }
        )
        return id
    }
    del(id: QueryerID) {
        delete this._profiles[id]
        return this._targets.splice(parseInt(this._findOneIdx(id)), 1)[0].id
    }
    async test(): Promise<{
        ok: boolean
    }> {
        return
    }
}

export { QueryerRemote as Queryer, QueryerLocal }
