import { ITFBase, CFilter } from '.'
import { Request } from '../request'
import { Base } from './base'

type TagITF = {
    name: string
    properties: {
        [key in string]: string | number | boolean
    }
}

class TagCtl extends Base<TagITF> {
    constructor(request: Request, apiVersion: string) {
        super(request, apiVersion, 'tag')
    }
    async list(servers: string[]) {
        return this._list(servers)
    }
    async filter(
        servers: string[],
        filters: CFilter<TagITF>[] = [],
        depths?: number[]
    ) {
        depths = depths ?? new Array(filters.length).fill(1)
        return this._filter(servers, filters, depths)
    }
    async add(server: string, inf: TagITF[]) {
        return this._add(server, inf)
    }
    async get(servers: string[], id: string[]) {
        return this._get(servers, id)
    }
    async mod(server: string, id: string[], inf: TagITF[]) {
        return this._mod(server, id, inf)
    }
    async del(server: string, id: string[]) {
        this._del(server, id)
    }
}

class Tag {}

export { TagCtl, Tag }
