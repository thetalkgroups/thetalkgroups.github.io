import { getPage } from "./api-globals"

export const initPagination = (page: number, numberOfPages: number, refreshList: (page:number) => Promise<any>, handleError: (error: any) => void) => {
    let numberOfNavigations = 0;
    const prev = document.querySelector(".pagination__prev") as HTMLAnchorElement;
    const next = document.querySelector(".pagination__next") as HTMLAnchorElement;
    const pageEl = document.querySelector(".pagination__page");
    const updatePageEl = () => {
        if (page === 1)
            prev.classList.add("disabled");
        else
            prev.classList.remove("disabled");

        if (page === numberOfPages)
            next.classList.add("disabled");
        else
            next.classList.remove("disabled");

        history.pushState(null, null, getUrlWithPage(page));

        pageEl.innerHTML = page + " of " + numberOfPages;
    };

    window.addEventListener("popstate", () => {
        if (numberOfNavigations === 0) {
            history.back();
        }
        else {
            numberOfNavigations -= 1;
            page = getPage();
            updatePageEl();
            refreshList(page).catch(handleError);
        }
    })

    prev.onclick = () => {
        if (prev.classList.contains("disabled")) return;

        page -= 1;
        updatePageEl();
        numberOfNavigations += 1;
        refreshList(page).catch(handleError);
    }
    
    next.onclick = () => {
        if (next.classList.contains("disabled")) return;

        page += 1;
        updatePageEl();
        numberOfNavigations += 1;
        refreshList(page).catch(handleError);
    };

    updatePageEl();
}

const getUrlWithPage = (page: number) => {
    const url = new URL(location.href);

    if (page === 1) {
        url.search = url.search.replace(/&?page=\d+/, "");
    }
    else if (!url.search.match("page=")) {
        url.search += (url.search ? "&" : "") + "page=" + page;
    }
    else {
        url.search = url.search.replace(/page=\d+/, "page=" + page);
    }
    
    return url.toString();
}