import { HOST, getItemFromCache, setItemToCache } from "./api-globals"

export class List<a extends { _id: string }> {
    private userId = "UNSET"

    public constructor(private prefix: string) {}

    setUserId(userId: string) { this.userId = userId }

    public getItems(page: number, offset: number = 0): Promise<{ items: a[], numberOfPages: number }> {
        return this.listItems(page, offset).then(({ ids, numberOfPages }) => {
            const cachedItems: a[] = [];
            const newIds: string[] = [];

            ids.forEach(id => {
                const cachedItem = getItemFromCache(this.prefix, id);

                if (cachedItem)
                    cachedItems.push(cachedItem);
                else
                    newIds.push(id);
            })

            if (newIds.length === 0) return { items: cachedItems, numberOfPages };

            return this.fetchItems(newIds).then(newItems => {
                newItems.forEach(newItem => setItemToCache(this.prefix, newItem));

                return { items: cachedItems.concat(newItems), numberOfPages };
            })
        })
    }

    private listItems(page: number, offset: number): Promise<{ ids: string[], numberOfPages: number }> {
        return fetch(HOST + this.prefix + "/list/" + page + "-" + offset, {
            headers: { "Authorization": this.userId }
        }).then(res => {
            if (!res.ok) return res.text().then(text => {throw text});

            return res.json();
        });
    }

    private fetchItems(ids: string[]): Promise<a[]> {
        return fetch(HOST + this.prefix + "/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": this.userId 
            }, 
            body: JSON.stringify(ids)
        }).then(res => {
            if (!res.ok) return res.text().then(text => {throw text});

            return res.json();
        });
    }
}