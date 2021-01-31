import { EventEmitter } from 'events'

import { ITFBase, SData, CoreResponse, ERR_CODE } from '.'
import { genID, zip } from '../utils'
import { CoreResponseBad } from '../connect'

type ServerITF = {
    addr: string
    token: string
    pin: string
}

class _CRDataCtor {
    good: SData<ServerITF>[]
    bad: CoreResponseBad[]
    constructor() {
        this.good = []
        this.bad = []
    }
    done(): CoreResponse<SData<ServerITF>>[] {
        return [
            {
                server_id: '_',
                ok: true,
                status: 200,
                good: this.good,
                bad: this.bad,
            },
        ]
    }
    _arr<T extends object>(input: T | T[]): T[] {
        return Array.isArray(input) ? input : [input]
    }
    pushG(input: SData<ServerITF> | SData<ServerITF>[]): _CRDataCtor {
        this.good = [...this.good, ...this._arr(input)]
        return this
    }
    pushB(input: CoreResponseBad | CoreResponseBad[]): _CRDataCtor {
        this.bad = [...this.bad, ...this._arr(input)]
        return this
    }
}

class ServerCtl extends ITFBase<ServerITF> {
    private _servers: SData<ServerITF>[]
    _event: EventEmitter
    constructor() {
        super()
        this._servers = []
        this._event = new EventEmitter()
    }
    _apply(servers: SData<ServerITF>[]): SData<ServerITF>[] {
        const p: SData<ServerITF>[] = []
        for (const s of servers) {
            this._servers.push(s)
            p.push(s)
        }
        return p
    }
    _findOne(id: string): [SData<ServerITF>, number] {
        let i: number = -1
        for (const si in this._servers) {
            if (this._servers[si].id == id) {
                i = parseInt(si)
                break
            }
        }
        return [this._servers[i], i]
    }
    async list(_: string[]) {
        return new _CRDataCtor().pushG(this._servers).done()
    }
    async add(_: string, data: ServerITF[]) {
        const res = new _CRDataCtor()
        for (const i of data) {
            const s = { ...i, id: genID('server') }
            this._servers.push(s)
            res.pushG(s)
        }
        if (res.good.length) this._event.emit('modified')
        return res.done()
    }
    async get(_: string[], id: string[]) {
        const res = new _CRDataCtor()
        for (const i of id) {
            const [s, idx] = this._findOne(i)
            if (idx == -1) {
                res.pushB({
                    id: i,
                    err_code: ERR_CODE.NOT_FOUND,
                })
            } else {
                res.pushG(s)
            }
        }
        return res.done()
    }
    async mod(_: string, id: string[], data: ServerITF[]) {
        const res = new _CRDataCtor()
        zip(id, data).map(([i, d]) => {
            const [s, idx] = this._findOne(i)
            if (idx == -1) {
                res.pushB({
                    id: i,
                    err_code: ERR_CODE.NOT_FOUND,
                })
            } else {
                res.pushG(Object.assign(this._servers[idx], d))
            }
        })
        if (res.good.length) this._event.emit('modified')
        return res.done()
    }
    async del(_: string, id: string[]) {
        const res = new _CRDataCtor()
        for (const i of id) {
            const [_, idx] = this._findOne(i)
            if (idx == -1) {
                res.pushB({
                    id: i,
                    err_code: ERR_CODE.NOT_FOUND,
                })
            } else {
                res.pushG(this._servers.splice(idx, 1)[0])
            }
        }
        if (res.good.length) this._event.emit('modified')
        return res.done()
    }
}

class Server {}

export { ServerCtl, ServerITF, Server }
