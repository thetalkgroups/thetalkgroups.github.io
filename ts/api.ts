const HOST = "http://localhost:4001"
const itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");

const _clearItemsFromCahce = () => Object.keys(localStorage)
    .filter(k => k.startsWith("/group"))
    .forEach(k => localStorage.removeItem(k));

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

function setCache(key: string, item: any) {
    localStorage.setItem(key, JSON.stringify(item));
}
function getCache<a>(key: string): a {
    return JSON.parse(localStorage.getItem(key));
}

class CachedList<a extends { _id: string}> {
    constructor(private prefix: string, private isNew: (item: a) => boolean) {}

    private fetchAll(ids: string[], userId?: string): Promise<a[]> {
        return fetch(HOST + this.prefix, {
            method: "POST",
            body: JSON.stringify(ids),
            headers: Object.assign({ "Content-Type": "application/json" }, userId ? { "Authorization": userId } : undefined)
        }).then(res => res.json());
    }

    private fetchList(page: number): Promise<string[]> {
        return fetch(`${HOST}${this.prefix}/list/${page}`)
            .then(res => res.json());
    }

    private fetch(id: string, userId?: string): Promise<a> {
        return fetch(
            `${HOST}${this.prefix}/${id}`,
            userId ? { headers: { "Authorization": userId }} : undefined)
            .then(res => res.json());
    }

    public get(page: number, userId?: string): Promise<a[]> {
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

                return this.fetchAll(newIds, userId)
                    .then(newItems => {
                        newItems.forEach(newItem => 
                            setCache(`${this.prefix}-${newItem._id}`, newItem));

                        return items.concat(newItems);
                    })
            });
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
}