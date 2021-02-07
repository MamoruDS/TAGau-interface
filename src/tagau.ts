import { ID, QueryerID } from './main'
import { preset } from './res'
import { Queryer, QueryerLocal } from './queryer'

class TAGau {
    readonly server: preset.ServerItemCtl<ID, QueryerID>
    readonly bind: preset.BindItemCtl<ID, QueryerID>
    readonly tag: preset.TagItemCtl<ID, QueryerID>
    readonly target: preset.TargetItemCtl<ID, QueryerID>
    private _query: Queryer<Record<string, unknown>>
    private _queryLocal: QueryerLocal<Record<string, unknown>>
    constructor() {
        this._query = new Queryer()
        this._queryLocal = new QueryerLocal({
            path: 'profile.json',
        }) // TODO:
        this.server = new preset.ServerItemCtl<ID, QueryerID>(
            this._queryLocal,
            'server'
        )
        this.bind = new preset.BindItemCtl<ID, QueryerID>(this._query, 'bind')
        this.tag = new preset.TagItemCtl<ID, QueryerID>(this._query, 'tag')
        this.target = new preset.TargetItemCtl<ID, QueryerID>(
            this._query,
            'target'
        )
    }
}

export { TAGau }
