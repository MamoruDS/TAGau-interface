import { genID, zip } from '../utils'
import { SData } from './base'

type ServerITF = {
    addr: string
    token: string
    pin: string
}

class ServerCtl {
    private _servers: SData<ServerITF>[]
    constructor() {
        this._servers = []
    }
    async list(_: string[]): Promise<SData<ServerITF>[]> {
        return this._servers
    }
    async add(_: string[], data: ServerITF[]): Promise<SData<ServerITF>[]> {
        const p: SData<ServerITF>[] = []
        for (const i of data) {
            p.push({ ...i, id: genID('server') })
        }
        for (const s of p) {
            this._servers.push(s)
        }
        return p
    }
    async get(_: string[], id: string[]): Promise<SData<ServerITF>[]> {
        const p: SData<ServerITF>[] = []
        for (const i of id) {
            p.push(this._servers.filter((s) => s.id == i)[0])
        }
        return p
    }
    async mod(
        _: string[],
        id: string[],
        data: ServerITF[]
    ): Promise<SData<ServerITF>[]> {
        const p: SData<ServerITF>[] = []
        zip(id, data).map((e) => {
            p.push(
                Object.assign(
                    this._servers.filter((s) => s.id == e[0])[0],
                    e[1]
                )
            )
        })
        return p
    }
}

class Server {}

export { ServerCtl, Server }
