const HOST = "http://localhost:4001"
const itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");

const formToJson = (form: HTMLFormElement): { [key: string]: any} => {
    const formData = new FormData(form);
    const json: { [key: string]: any } = {};

    (formData as any)["forEach"]((data: any, key: string) => {
        json[key] = data;
    })

    return json;
}

const escapeHtml = (content: any) => {
    if (typeof content === "string")
        return content.replace(/</g, "&lt;");

    return content;
}

const setCache = (key: string, item: any) => 
    localStorage.setItem(key, JSON.stringify(item));
function getCache<a>(key: string): a {
    return JSON.parse(localStorage.getItem(key));
}
const updateCache = (key: string, newProperties: { [key: string]: any}) => {
    const oldItem = getCache(key);

    setCache(key, Object.assign(oldItem, newProperties))
}


class CachedList<a extends { _id: string }> {
    constructor(private prefix: string, private isNew: (item: a) => boolean) {}

    private fetchAll(ids: string[], userId?: string): Promise<a[]> {
        return fetch(HOST + this.prefix, {
            method: "POST",
            body: JSON.stringify(ids),
            headers: Object.assign({ "Content-Type": "application/json" }, userId ? { "Authorization": userId } : undefined)
        }).then(res => res.json());
    }

    private fetchList(page: number): Promise<{ sticky: string[], normal: string[] } | string[]> {
        return fetch(`${HOST}${this.prefix}/list/${page}`)
            .then(res => res.json());
    }

    private fetch(id: string, userId?: string): Promise<a> {
        return fetch(
            `${HOST}${this.prefix}/${id}`,
            userId ? { headers: { "Authorization": userId }} : undefined)
            .then(res => res.json());
    }

    private _get(id: string ) {
        return getCache<a>(`${this.prefix}-${id}`) || id
    }

    private _getNewItems(items: (string | a)[], userId: string): Promise<a[]> {
        const newIds = items
            .map((id, i) => {
                if (typeof id === "string") {
                    delete items[i];

                    return id;
                }
            })
            .filter(Boolean) as string[];

        if (newIds.length === 0) return Promise.resolve(items);

        return this.fetchAll(newIds, userId)
            .then(newItems => {
                newItems.forEach(newItem => 
                    setCache(`${this.prefix}-${newItem._id}`, newItem));

                return items.concat(newItems);
            })
    }

    public getReplyList(page: number, userId?: string): Promise<a[]> {
        return this.fetchList(page)
            .then((ids: string[]) => ids.map(id => this._get(id)))
            .then(items => this._getNewItems(items, userId));
    }
    public getItemList(page: number, userId?: string): Promise<{ normal: a[], sticky: a[]}> {
        return this.fetchList(page)
            .then((ids: { normal: string[], sticky: string[] }) => ({
                normal: ids.normal.map(id => this._get(id)),
                sticky: ids.sticky.map(id => this._get(id))
            }))
            .then(items => 
                this._getNewItems(items.normal, userId).then(normal => 
                this._getNewItems(items.sticky, userId).then(sticky => {
                    console.log(this.prefix, normal, sticky)
                    normal.forEach(item => updateCache(`${this.prefix}-${item._id}`, { sticky: false }))
                    sticky.forEach(item => updateCache(`${this.prefix}-${item._id}`, { sticky: true }))

                    return { normal, sticky }
                })));
    }

    public getOne(id: string, userId?: string): Promise<a> {
        return Promise.resolve(getCache<a>(`${this.prefix}-${id}`))
            .then(item => {
                if (this.isNew(item)) 
                    return this.fetch(id, userId)
                        .then(item => {
                            setCache(`${this.prefix}-${item._id}`, item);

                            return item;
                        });

                return item;
            });
    }

    public delete(id: string, userId: string) {
        return fetch(`${HOST}${this.prefix}/${id}`, { method: "DELETE", headers: { "Authorization": userId } });
    }

    public add<b>(data: b, onProgress?: (percent: number) => void) {
        const image = (data as any)["image"] as File;
        let next = Promise.resolve();

        if (onProgress && image.size) {
            const fd = new FormData();
            const xhr = new XMLHttpRequest();

            fd.append("image", image);

            next = new Promise<void>((resolve, reject) => {
                xhr.onload = () => {
                    (data as any)["image"] = xhr.responseText;

                    resolve();
                };
                xhr.onerror = reject;
                xhr.onprogress = ({ lengthComputable, total, loaded }) => {
                    if (!lengthComputable) return onProgress(-1);

                    onProgress(loaded / total);
                };

                xhr.open("POST", HOST + "/files", true);
                xhr.send(fd);
            })
        }
        else {
            delete (data as any)["image"]
        }

        return next.then(() => 
            fetch(HOST + this.prefix, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            }))
    }
}

class Api {
    public items: CachedList<Item>;
    public replys: CachedList<Reply>;

    constructor(private prefix: string, private itemId?: string, isNew?: (item: Item) => boolean) {
        this.items = new CachedList<Item>(prefix, isNew);

        if (itemId) {
            this.replys = new CachedList<Reply>(`${prefix}/${itemId}/replys`, null);
        }
    }

    public getImageUrl(image: string): string {
        return HOST + "/files/" + image;
    }

    public setSticky(userId: string, sticky: boolean = false) {
        localStorage.removeItem(`${this.prefix}-${this.itemId}`)

        return fetch(`${HOST}${this.prefix}/${this.itemId}/sticky`, {
            method: "POST",
            body: JSON.stringify({ value: sticky }),
            headers: { "Content-Type": "application/json", "Authorization": userId }
        })
    }
}