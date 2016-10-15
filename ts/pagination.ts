export const initPagination = (page: number, numberOfPages: number) => {
    const prev = document.querySelector(".pagination__prev") as HTMLAnchorElement;
    const next = document.querySelector(".pagination__next") as HTMLAnchorElement;
    const pageEl = document.querySelector(".pagination__page");

    if (page !== 1) {
        prev.href = getUrlWithPage(page - 1);
    }
    if (page < numberOfPages) {
        next.href = getUrlWithPage(page + 1);
    }

    pageEl.innerHTML = page + " of " + numberOfPages;
}
const getUrlWithPage = (page: number) => {
    const url = new URL(location.href);

    if (!url.search.match("page=")) {
        url.search += (url.search ? "&" : "") + "page=" + page;
    }
    else {
        url.search = url.search.replace(/page=\d+/, "page=" + page);
    }
    
    return url.toString();
}