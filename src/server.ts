import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { ITFBase, NotImplementedError, Special, Resource } from './resources'
import { CoreConnError } from './connect'
import { TAGau, Conf } from './tagau'
import { Cap } from '@mamoruds/cap'
import { argv } from 'process'
import { Config } from './utils'

type ITFResponse = {
    data: any[]
    ok: boolean
    status: number
    err_msg: string
}

const API = {
    alpha: {},
} as {
    [v in string]: {
        [key in
            | keyof typeof Resource
            | keyof Special]?: key extends keyof typeof Resource
            ? ITFBase<object>
            : key extends keyof Special
            ? Special[key]
            : never
    }
}
API.v1 = API.alpha

const server = async () => {
    const args = new Cap({
        port: {
            type: 'number',
            alias: 'p',
            default: 31980,
            optional: true,
        },
        config: {
            type: 'string',
            alias: 'c',
            default: 'profile.json',
            optional: true,
        },
    })
        .name('tagau-interface')
        .version('0.1.0')
        .parse(argv.slice(2))

    const conf = new Config<Conf>(args.config, {
        servers: [],
    })
    const tagau = new TAGau('alpha', conf)
    await tagau.init()

    API['alpha'].bind = tagau.bind
    API['alpha'].server = tagau.server
    API['alpha'].tag = tagau.tag
    API['alpha'].target = tagau.target

    const app = new Koa()
    app.use(bodyParser())
    app.use(async (ctx, next)=>{
        // TODO: do auth stuff
        return next()
    })
    app.use(async (ctx, next) => {
        const r = ctx.path.split('/')
        r.shift()
        const v = r.shift()
        const c = r.shift()
        const i = (r.shift() ?? ctx.query['id'] + '' ?? '')
            .split(',')
            .filter((_) => _)
        const d = ctx.request['body']
        const m = ctx.method
        const s = (ctx.query['server'] ?? '').split(',').filter((_) => _)
        const body: ITFResponse = {
            data: [],
            ok: true,
            status: 200,
            err_msg: undefined,
        }
        try {
            if (typeof API[v][c] == 'undefined') throw new TypeError()
            let data: any[] = []
            if (Object.keys(Resource).indexOf(c) != -1) {
                const _c = c as keyof typeof Resource
                if (false) {
                } else if (m == 'GET') {
                    if (i.length) {
                        data = await API[v][_c].get(s, i)
                    } else {
                        data = await API[v][_c].list(s)
                    }
                } else if (m == 'POST') {
                    data = await API[v][_c].add(s[0], d?.data)
                } else if (m == 'PUT') {
                    data = await API[v][_c].mod(s[0], i, d?.data)
                } else if (m == 'DELETE') {
                    data = await API[v][_c].del(s[0], i)
                }
            } else {
                // TODO:
            }
            body.data = data
            ctx.status = 200
        } catch (e) {
            body.ok = false
            if (false) {
            } else if (e instanceof TypeError) {
                body.status = 404
            } else if (e instanceof NotImplementedError) {
                body.status = 501
            } else if (e instanceof CoreConnError) {
                body.status = 503
            } else {
                body.status = 500
                body.err_msg = JSON.stringify(e)
            }
        }
        ctx.body = body
        ctx.status = body.status
        return next()
    })
    app.use((ctx, next) => {
        const getNum = (input: string, dflt: number): number => {
            const n = parseInt(input)
            return Number.isNaN(n) ? dflt : n
        }
        const limit = getNum(ctx.query['limit'], 50)
        const page = getNum(ctx.query['page'], 0)
        ctx.body.data = ctx.body.data.splice(page * limit, limit)
    })

    const PORT = process.env['PROT'] ?? 31980
    app.listen(PORT)
    console.log(`server start at ${PORT}`) // TODO: remove this
}

server()
