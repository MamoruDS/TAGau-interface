import { Request } from '../request'
import { Base } from './base'

type TargetITF = {
    path: string
    host: string
    metadata: {
        [key in string]: string | number | boolean
    }
    properties: {
        [key in string]: string | number | boolean
    }
}

class TargetCtl extends Base<TargetITF> {
    constructor(request: Request, apiVersion: string) {
        super(request, apiVersion, 'file')
    }
    async list(servers: string[]) {
        return this._list(servers)
    }
    async add(server: string, inf: TargetITF[]) {
        return this._add(server, inf)
    }
    async get(servers: string[], id: string[]) {
        return this._get(servers, id)
    }
    async mod(server: string, id: string[], inf: TargetITF[]) {
        return this._mod(server, id, inf)
    }
    async raw(server: string, id: string, length?: number) {
        return this._query('raw', [{ id }], [server])
    }
}

class Target {}

export { TargetCtl, Target }
