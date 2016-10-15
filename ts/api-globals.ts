export const HOST = "http://localhost:4001"
export const itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");
export const formToJson = (form: HTMLFormElement): { [key: string]: any} => {
    const formData = new FormData(form);
    const json: { [key: string]: any } = {};

    (formData as any)["forEach"]((data: any, key: string) => {
        json[key] = data;
    })

    return json;
}

export const setItemToCache = (prefix: string, item: { _id: string }) => localStorage.setItem(prefix.replace("/sticky", "") + "/" + item._id, JSON.stringify(item));
export const getItemFromCache = (prefix: string, id: string) => JSON.parse(localStorage.getItem(prefix.replace("/sticky", "") + "/" + id));