import { Request } from '../request'
import { Base, CFilter } from './base'

interface BandITF {
    lhs: string
    lhsType: 'file' | 'tag'
    rhs: string
    rhsType: 'file' | 'tag'
    direction: boolean
}

class BindCtl extends Base<BandITF> {
    constructor(request: Request, apiVersion: string) {
        super(request, apiVersion, 'bind')
    }
    async list(servers: string[]) {
        return this._list(servers)
    }
    async filter(
        servers: string[],
        filters: CFilter<BandITF>[] = [],
        depths?: number[]
    ) {
        depths = depths ?? new Array(filters.length).fill(1)
        return this._filter(servers, filters, depths)
    }
    async add(server: string, inf: BandITF[]) {
        return this._add(server, inf)
    }
    async get(servers: string[], id: string[]) {
        return this._get(servers, id)
    }
    async mod(server: string, id: string[], inf: BandITF[]) {
        return this._mod(server, id, inf)
    }
    async del(server: string, id: string[]) {
        return this._del(server, id)
    }
}

class Bind {}

export { BindCtl, Bind }
