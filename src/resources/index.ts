type SData<T> = {
    [key in keyof T | 'id']: key extends keyof T ? T[key] : string
}

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
    list(servers: string[]): Promise<SData<T>[]> {
        throw new NotImplementedError('')
    }
    filter(
        servers: string[],
        filter: CFilter<T>[],
        depth: number[]
    ): Promise<SData<T>[]> {
        throw new NotImplementedError('')
    }
    add(server: string, data: T[]): Promise<SData<T>[]> {
        throw new NotImplementedError('')
    }
    get(servers: string[], id: string[]): Promise<SData<T>[]> {
        throw new NotImplementedError('')
    }
    mod(server: string, id: string[], data: T[]): Promise<SData<T>[]> {
        throw new NotImplementedError('')
    }
    del(server: string, id: string[]): Promise<void> {
        throw new NotImplementedError('')
    }
    raw(server: string, id: string, length?: number): Promise<any> {
        throw new NotImplementedError('')
    }
}

import { TagCtl } from './tag'
import { TargetCtl } from './target'
import { BindCtl } from './bind'
import { ServerCtl } from './server'

const Resource = {
    bind: BindCtl,
    tag: TagCtl,
    target: TargetCtl,
    server: ServerCtl,
}

export { ITFBase, CFilter, SData, NotImplementedError }

export { Connect } from '../connect'

export { TagCtl, TargetCtl, BindCtl, ServerCtl, Resource }
export { Special } from './specials'
