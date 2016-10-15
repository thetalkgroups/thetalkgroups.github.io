import { HOST, getItemFromCache, setItemToCache } from "./api-globals"

export class List<a extends { _id: string }> {
    public constructor(private prefix: string) {}

    public getItems(page: number, offset: number = 0, userId?: string): Promise<a[]> {
        return this.listItems(page, offset).then(ids => {
            const cachedItems: a[] = [];
            const newIds: string[] = [];

            ids.forEach(id => {
                const cachedItem = getItemFromCache(this.prefix, id);

                if (cachedItem)
                    cachedItems.push(cachedItem);
                else
                    newIds.push(id);
            })

            return this.fetchItems(newIds, userId).then(newItems => {
                newItems.forEach(newItem => setItemToCache(this.prefix, newItem));

                return cachedItems.concat(newItems);
            })
        })
    }

    private listItems(page: number, offset: number): Promise<string[]> {
        return fetch(HOST + this.prefix + "/list/" + page + "-" + offset).then(res => res.json());
    }

    private fetchItems(ids: string[], userId?: string): Promise<a[]> {
        return fetch(HOST + this.prefix + "/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": userId 
            }, 
            body: JSON.stringify(ids)
        }).then(res => res.json());
    }
}