import { BaseProp, StdProp, IDType, Queryer } from '.'

import { ExtRes, ItemCtl as _ItemCtl } from '.'
import { BaseItem, BaseItemCtor } from '.'

interface LocalProp<ID extends IDType> extends BaseProp<ID> {}

type StdLocalProp<ID extends IDType> = StdProp<ID, LocalProp<ID>>

class Res<
    ID extends IDType,
    QueryerID extends IDType,
    R extends string
> extends ExtRes<ID, QueryerID, LocalProp<ID>, R> {
    constructor(queryer: Queryer<ID, QueryerID, StdLocalProp<ID>, R>, res: R) {
        super(queryer, res, ['list', 'mod'])
    }
}

interface ResCtor<
    ID extends IDType,
    QueryerID extends IDType,
    R extends string
> {
    new (queryer: Queryer<ID, QueryerID, StdLocalProp<ID>, R>, res: R): Res<
        ID,
        QueryerID,
        R
    >
}

class Item<ID extends IDType, QueryerID extends IDType, R extends string>
    implements BaseItem<ID> {
    readonly id: ID
    readonly ctl: _ItemCtl<
        ID,
        QueryerID,
        LocalProp<ID>,
        R,
        Res<ID, QueryerID, R>,
        ResCtor<ID, QueryerID, R>
    >
    private _prop: LocalProp<ID>
    constructor(
        ctl: _ItemCtl<
            ID,
            QueryerID,
            LocalProp<ID>,
            R,
            Res<ID, QueryerID, R>,
            ResCtor<ID, QueryerID, R>
        >,
        id: ID,
        prop?: LocalProp<ID>
    ) {
        this.id = id
        this._prop = prop
        this.ctl = ctl
    }
    get prop(): LocalProp<ID> {
        return this._prop
    }
}

interface ItemCtor<
    ID extends IDType,
    QueryerID extends IDType,
    R extends string
> extends BaseItemCtor<ID, Item<ID, QueryerID, R>> {
    new (
        ctl: _ItemCtl<
            ID,
            QueryerID,
            LocalProp<ID>,
            R,
            Res<ID, QueryerID, R>,
            ResCtor<ID, QueryerID, R>
        >,
        id: ID,
        prop?: LocalProp<ID>
    ): Item<ID, QueryerID, R>
}

class ItemCtl<
    ID extends IDType,
    QueryerID extends IDType,
    R extends string
> extends _ItemCtl<
    ID,
    QueryerID,
    LocalProp<ID>,
    R,
    Res<ID, QueryerID, R>,
    ResCtor<ID, QueryerID, R>,
    Item<ID, QueryerID, R>,
    ItemCtor<ID, QueryerID, R>
> {
    constructor(
        queryer: Queryer<ID, QueryerID, StdLocalProp<ID>, R>,
        resType: R
    ) {
        super(queryer, resType, Res, Item)
    }
}

export { Res, Item }

export { LocalProp, ResCtor, ItemCtor, ItemCtl }

export {}
