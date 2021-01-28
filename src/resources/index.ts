type SData<T> = {
    [key in keyof T | 'id']: key extends keyof T ? T[key] : string
}

type NonPattern<T> = string extends T ? T : number extends T ? T : never

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

interface ITF<T extends object> {
    list(servers: string[]): Promise<SData<T>[]>
    filter(
        servers: string[],
        filter: CFilter<T>[],
        depth: number[]
    ): Promise<SData<T>[]>
    add(server: string, data: T[]): Promise<SData<T>[]>
    get(servers: string[], id: string[]): Promise<SData<T>[]>
    mod(server: string, id: string[], data: T[]): Promise<SData<T>[]>
    del(server: string, id: string[]): Promise<void>
}

class ITFBase<T extends object> implements ITF<T> {
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
}

export { ITF, ITFBase, CFilter, SData }

export { CoreCtl } from './core'
export { Tag, TagCtl } from './tag'
export { Target, TargetCtl } from './target'
export { Bind, BindCtl } from './bind'
export { Server, ServerCtl } from './server'
