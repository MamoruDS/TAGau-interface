type SData<T> = Partial<T> & {
    id: string
}

type ResponseData<T> = CoreResponse<SData<T>>

type Pattern<T> = string extends T ? (number extends T ? never : T) : T

type NonPattern<T> = string extends T ? T : number extends T ? T : never

type Repeatable<T> = NonPattern<T> extends never ? never : T[]

type NPRepeat<T> = NonPattern<T> extends never ? T : T[]

type CFilter<T extends object> = {
    allow: {
        [key in keyof T]: NPRepeat<T[key]>
    }
    deny: {
        [key in keyof T]: NPRepeat<T[key]>
    }
}

class NotImplementedError extends Error {
    constructor(message: string) {
        super(message)
    }
}

class ITFBase<T extends object> {
    constructor() {}
    list(servers: string[]): Promise<CoreResponse<SData<T>>[]> {
        throw new NotImplementedError('')
    }
    filter(
        servers: string[],
        filter: CFilter<T>[],
        depth: number[]
    ): Promise<CoreResponse<SData<T>>[]> {
        throw new NotImplementedError('')
    }
    add(server: string, data: T[]): Promise<CoreResponse<SData<T>>[]> {
        throw new NotImplementedError('')
    }
    get(servers: string[], id: string[]): Promise<CoreResponse<SData<T>>[]> {
        throw new NotImplementedError('')
    }
    mod(
        server: string,
        id: string[],
        data: T[]
    ): Promise<CoreResponse<SData<T>>[]> {
        throw new NotImplementedError('')
    }
    del(server: string, id: string[]): Promise<CoreResponse<SData<T>>[]> {
        throw new NotImplementedError('')
    }
    raw(server: string, id: string, length?: number): Promise<any> {
        throw new NotImplementedError('')
    }
}

import { TagCtl } from './tag'
import { TargetCtl } from './target'
import { BindCtl } from './bind'
import { ServerCtl, ServerITF } from './server'
import { CoreResponse } from '../connect'

type Server = SData<ServerITF>

const Resource = {
    bind: BindCtl,
    tag: TagCtl,
    target: TargetCtl,
    server: ServerCtl,
}

export { ITFBase, CFilter, SData, ResponseData, NotImplementedError }

export { Connect } from '../connect'
export { ERR_CODE } from '../constant'

export { TagCtl, TargetCtl, BindCtl, ServerCtl, Server, Resource, CoreResponse }
export { Special } from './specials'
