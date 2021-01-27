import * as http from 'http'
import * as https from 'https'
import axios from 'axios'

import { genID } from './utils'

const source = axios.CancelToken.source()
const instance = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
})

class Server {
    readonly id: string
    readonly addr: string
    token: string
    constructor(addr: string, token?: string) {
        this.id = genID('server')
        this.addr = addr
        this.token = token
    }
}

class Request {
    private _servers: Server[]
    private _timeout: number
    constructor() {
        this._servers = []
    }
    get servers(): Server[] {
        return this._servers
    }
    addServer(addr: string, token?: string): Server {
        const s = new Server(addr, token)
        this._servers.unshift(s)
        return s
    }
    timeout(v: number): Request {
        this._timeout = v
        return this
    }
    async open(
        method: 'DELETE' | 'GET' | 'POST' | 'PUT',
        options: {
            url?: string
            data: { [key in string]: any }
        },
        targets: string[] = [],
        headers: {} = {}
    ) {
        const res = []
        for (const s of this._servers) {
            if (targets.length != 0 && targets.indexOf(s.id) == -1) continue
            res.push(
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
                    data:
                        method == 'GET' || method == 'DELETE'
                            ? undefined
                            : options.data,
                    params:
                        method == 'GET' || method == 'DELETE'
                            ? options.data
                            : undefined,
                })
            )
        }
        return res
    }
    _open(
        method: 'DELETE' | 'GET' | 'POST' | 'PUT',
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

export { Request, Server }
