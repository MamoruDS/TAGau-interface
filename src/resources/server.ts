import { genID, zip } from '../utils'
import { ITFBase, SData } from '.'

type ServerITF = {
    addr: string
    token: string
    pin: string
}

class ServerCtl extends ITFBase<ServerITF> {
    private _servers: SData<ServerITF>[]
    constructor() {
        super()
        this._servers = []
    }
    async list(_: string[]) {
        return this._servers
    }
    async add(_: string, data: ServerITF[]) {
        const p: SData<ServerITF>[] = []
        for (const i of data) {
            p.push({ ...i, id: genID('server') })
        }
        for (const s of p) {
            this._servers.push(s)
        }
        return p
    }
    async get(_: string[], id: string[]) {
        const p: SData<ServerITF>[] = []
        for (const i of id) {
            p.push(this._servers.filter((s) => s.id == i)[0])
        }
        return p
    }
    async mod(_: string, id: string[], data: ServerITF[]) {
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
    async del(_: string, id: string[]) {
        this._servers = this._servers.filter((s) => id.indexOf(s.id) == -1)
    }
}

class Server {}

export { ServerCtl, Server }
