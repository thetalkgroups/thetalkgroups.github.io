const HOST = "http://localhost:4001"

function setCache<a>(key: string, item: a) {
    localStorage.setItem(key, JSON.stringify(item));
}
function getCache<a>(key: string): a {
    return JSON.parse(localStorage.getItem(key));
}

class CachedList<a extends { _id: string}> {
    constructor(private prefix: string, private isNew: (item: a) => boolean) {}

    private fetchAll(ids: string[]): Promise<a[]> {
        return fetch(HOST + this.prefix, {
            method: "POST",
            body: JSON.stringify(ids),
            headers: { "Content-Type": "application/json" }
        }).then(res => res.json());
    }

    private fetchList(page: number): Promise<string[]> {
        return fetch(`${HOST}${this.prefix}/list/${page}`)
            .then(res => res.json());
    }

    private fetch(id: string): Promise<a> {
        return fetch(`${HOST}${this.prefix}/${id}`).then(res => res.json());
    }

    public get(page: number): Promise<a[]> {
        return this.fetchList(page)
            .then(ids => ids.map(id => getCache<a>(`${this.prefix}-${id}`) || id))
            .then(items => {
                const newIds = items
                    .map((id, i) => {
                        if (typeof id === "string") {
                            delete items[i];

                            return id;
                        }
                    })
                    .filter(Boolean) as string[];

                if (newIds.length === 0) return items;

                return this.fetchAll(newIds)
                    .then(newItems => {
                        newItems.forEach(newItem => 
                            setCache<a>(`${this.prefix}-${newItem._id}`, newItem));

                        return items.concat(newItems);
                    })
            });
    }

    public getOne(id: string): Promise<a> {
        return Promise.resolve(getCache<a>(`${this.prefix}-${id}`))
            .then(item => {
                if (this.isNew(item)) 
                    return this.fetch(id).then(item => {
                        setCache<a>(`${this.prefix}-${item._id}`, item);

                        return item;
                    });

                return item;
            });
    }
}

class Api {
    public list: CachedList<Item>;
    public replys: CachedList<Reply>;

    constructor(private prefix: string, private itemId?: string, isNew?: (item: Item) => boolean) {
        this.list = new CachedList<Item>(prefix, isNew);

        if (itemId) {
            this.replys = new CachedList<Reply>(`${prefix}/${itemId}/replys`, null);
        }
    }

    public add<b>(data: b, reply: boolean = false): Promise<void> {
        return fetch(HOST + this.prefix + (reply ? `/${this.itemId}/replys` : ""), {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        }).then(_ => {});
    }

    public delete(id: string): Promise<void> {
        return fetch(`${HOST}${this.prefix}/${id}`, { method: "DELETE" }).then(_ => {});
    }
}