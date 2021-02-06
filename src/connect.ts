import * as http from 'http'
import * as https from 'https'
import axios from 'axios'

import { SData, ServerCtl } from './resources'

const _ = axios.CancelToken.source()
const instance = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
})

type CoreResponseBad = {
    id: string
    err_code: number
}

type CoreResponseGood = {
    [key: string]: any
}

type CoreResponse<T extends CoreResponseGood = {}> = {
    server_id: string
    ok: boolean
    status: number
    good: T[]
    bad: CoreResponseBad[]
}

type AllowedMethods = 'DELETE' | 'POST' | 'PUT' | 'PATCH'

class CoreConnError extends Error {
    constructor() {
        super()
    }
}

class Connect {
    private _server: ServerCtl
    private _timeout: number
    constructor() {
        this._server = new ServerCtl()
    }
    get server(): ServerCtl {
        return this._server
    }
    timeout(v: number): Connect {
        this._timeout = v
        return this
    }
    async open<T>(
        method: AllowedMethods,
        options: {
            url?: string
            data: { [key in string]: any }
        },
        targets: string[] = [],
        headers: {} = {}
    ): Promise<CoreResponse<SData<T>>[]> {
        const res: CoreResponse<SData<T>>[] = []
        for (const s of (await this._server.list([]))[0].good) {
            if (targets.length != 0 && targets.indexOf(s.id) == -1) continue
            const cr = {
                server_id: s.id,
                ok: true,
                status: undefined,
                good: [],
                bad: [],
            } as CoreResponse<SData<T>>
            try {
                await this._open(method, {
                    ...options,
                    baseURL: s.addr,
                    headers: {
                        Accept: 'application/json',
                        'API-Token': s.token,
                        'Content-Type': 'application/json',
                        'User-Agent': 'TAGau-interface',
                        ...headers,
                    },
                    data: options.data,
                })
            } catch (e) {
                if (e.toJSON()?.code == 'ECONNREFUSED') {
                    cr.ok = false
                    cr.status = 404
                } else {
                    throw e // TODO:
                }
            }
            res.push(cr)
        }
        return res
    }
    _open(
        method: AllowedMethods,
        options: {
            baseURL: string
            headers: { [key in string]: string }
            url?: string
            data?: { [key in string]: any }
            params?: { [key in string]: any }
        }
    ) {
        return new Promise((resolve, reject) => {
            instance({
                baseURL: options.baseURL,
                url: options.url,
                method: method,
                headers: options.headers,
                timeout: this._timeout,
                data: options.data,
                params: options.params,
            })
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }
}

export { Connect, CoreResponseBad, CoreResponse, CoreConnError }
