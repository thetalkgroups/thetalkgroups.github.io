export const initPagination = (page: number, numberOfPages: number, refreshList: (page:number) => any) => {
    const prev = document.querySelector(".pagination__prev") as HTMLAnchorElement;
    const next = document.querySelector(".pagination__next") as HTMLAnchorElement;
    const pageEl = document.querySelector(".pagination__page");
    const updatePage = () => {
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

    prev.onclick = () => {
        if (prev.classList.contains("disabled")) return;

        page -= 1;
        updatePage();
        refreshList(page);
    }
    next.onclick = () => {
        if (next.classList.contains("disabled")) return;

        page += 1;
        updatePage();
        refreshList(page);
    };

    updatePage()
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