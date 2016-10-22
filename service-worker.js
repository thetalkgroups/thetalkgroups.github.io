// 0

importScripts('sw-toolbox.js');

toolbox.options.debug = true;

self.addEventListener("install", event => {
    self.skipWaiting();
});

toolbox.precache([
    "/sign-in.html",
    "/admin/",
    "/admin/index.html",

    "/thc/forum/",
    "/thc/forum/index.html",
    "/thc/forum/questions/add-item.html",
    "/thc/forum/questions/index.html",
    "/thc/forum/questions/item.html",
    "/thc/forum/tips-&-tricks/add-item.html",
    "/thc/forum/tips-&-tricks/index.html",
    "/thc/forum/tips-&-tricks/item.html",
    "/thc/forum/trip-reports/add-item.html",
    "/thc/forum/trip-reports/index.html",
    "/thc/forum/trip-reports/item.html",
    
    "/assets/static/facebook-logo.svg",
    "/assets/static/google-logo.svg",
    "/assets/static/ic_camera_alt_black_24px.svg",
    "/assets/static/ic_menu_black_24px.svg",
    "/assets/static/spinner.png",
    "/assets/static/twitter-logo.svg",
    "/assets/static/user-photo-placeholder.svg",
    "/assets/content/tg-logo.jpg",
    "/assets/content/thc.jpg",

    "/css/add-item.css",
    "/css/forum.css",
    "/css/group.css",
    "/css/home.css",
    "/css/item.css",
    "/css/list.css",
    "/css/sign-in.css",

    "/js/add-item.min.js",
    "/js/common.min.js",
    "/js/item.min.js",
    "/js/list.min.js",
    "/js/sign-in.min.js"
])

const limitedCache = (request, values, options) => {
    if (toolbox.options.debug) console.log("[custom] limitedCache", request.url);

    return toolbox.cacheFirst(request, values, { maxAgeSecound: 1800 });
}

const networkOnlyPaths = [
    "/",
    "/index.html",

    "/(thc)",
    "/(thc)/index.html",
    "/(thc)/general-hr.html",
    "/(thc)/test-kits.html",
    "/(thc)/forum/harm-reduction.html",
    "/(thc)/forum/read-first.html"
]

networkOnlyPaths.forEach(path => toolbox.router.get(path, limitedCache, { origin: "https://thetalkgroups.github.io" }));
networkOnlyPaths.forEach(path => toolbox.router.get(path, limitedCache, { origin: "http://localhost:4000" }));

toolbox.router.any("*", toolbox.networkOnly, { origin: "http://83.93.98.21:8000" });

toolbox.router.get("*", toolbox.cacheFirst);
toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://www.gstatic.com" });
toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://cdnjs.cloudflare.com" });
toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://lh4.googleusercontent.com" });
toolbox.router.get("https://www.google-analytics.com/analytics.js", toolbox.cacheFirst);