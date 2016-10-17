export const HOST = "http://localhost:8000"
export const itemSinglar = location.pathname.match(/\/(\w+)\/(?=([\w-]+\.html.*?)?$)/)[1].replace(/s$/, "");
export const formToJson = (form: HTMLFormElement): { [key: string]: any} => {
    const formData = new FormData(form);
    const json: { [key: string]: any } = {};

    (formData as any)["forEach"]((data: any, key: string) => {
        json[key] = data;
    })

    return json;
}

export const setItemToCache = (prefix: string, item: { _id: string }) => localStorage.setItem("/item" + prefix.replace("/sticky", "") + "/" + item._id, JSON.stringify(item));
export const getItemFromCache = (prefix: string, id: string) => JSON.parse(localStorage.getItem("/item" + prefix.replace("/sticky", "") + "/" + id));

export const getPage = () => {
    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;

    return page;
}
export const getId = (handleError: (error: any) => void): string | void  => {
    const idMatch = location.search.match(/id=(\w+)/);

    if (!idMatch) {
        return handleError(new Error("id missing"));
    }

    return idMatch[1];
}