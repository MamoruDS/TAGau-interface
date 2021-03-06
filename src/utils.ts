import * as fs from 'fs'
import * as process from 'process'

const _IDF = {
    ts_radix: 16,
    prefix_length_min: 1,
    prefix_length_max: 4,
    suffix_length_min: 10,
    suffix_length_max: 10,
    phrase_1_length: 6,
    phrase_2_length: 6,
}

const randChar = (length: number, radix?: number): string => {
    return new Array(length)
        .fill(undefined)
        .map((_) => Math.floor(Math.random() * radix).toString(radix))
        .join('')
}

const genID = (prefix?: string, suffix?: string) => {
    return `${prefix ? `${prefix}-` : ''}${randChar(
        _IDF.phrase_1_length,
        _IDF.ts_radix
    )}-${Date.now().toString(_IDF.ts_radix)}-${randChar(
        _IDF.phrase_2_length,
        _IDF.ts_radix
    )}${suffix ? `-${suffix}` : ''}`.toUpperCase()
}

function zip<T>(L1: T[]): [T][]
function zip<T, U>(L1: T[], L2: U[]): [T, U][]
function zip<T, U, V>(L1: T[], L2: U[], L3: V[]): [T, U, V][]
function zip<T>(...L: T[][]): any[][] {
    const len = L[0].length
    const z: any[][] = new Array(len).fill(undefined).map((_) => [])
    for (const l of L) {
        if (l.length != len) {
            // TODO:
            throw new Error('panic on method zip')
        }
        for (const i in l) {
            z[i].push(l[i])
        }
    }
    return z
}

class Config<C extends object> {
    readonly path: string
    private _data: C
    constructor(path: string, df: C) {
        this.path = path
        this._data = this._read(df)
    }
    get data(): C {
        return this._data
    }
    private _read(df: C = {} as C): C {
        if (!fs.existsSync(this.path)) {
            this._write(df)
            return df
        }
        if (!fs.lstatSync(this.path).isFile) {
            // panic
            process.exit(1)
        }
        return Object.assign(
            df,
            JSON.parse(fs.readFileSync(this.path, { encoding: 'utf-8' }))
        )
    }
    private _write(data?: C): void {
        fs.writeFileSync(
            this.path,
            JSON.stringify(data ?? this._data, null, 4),
            {
                encoding: 'utf-8',
            }
        )
    }
    update(data: C): void {
        this._data = Object.assign(this._data, data)
        this._write()
    }
}

export { genID, zip, Config }
