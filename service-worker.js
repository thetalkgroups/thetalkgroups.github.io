// 3

importScripts('sw-toolbox.js');

toolbox.precache([
    "/",
    "/index.html", 
    "/sign-in.html",

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

    "/js/add-item.roll.min.js",
    "/js/common.roll.min.js",
    "/js/item.roll.min.js",
    "/js/list.roll.min.js",
    "/js/sign-in.roll.min.js"
])

toolbox.router.get("/", toolbox.cacheOnly);
toolbox.router.get("/index.html", toolbox.cacheOnly);
toolbox.router.get("/sign-in.html", toolbox.cacheOnly);
toolbox.router.get("/assets/(.*)", toolbox.cacheOnly);
toolbox.router.get("/(css|js)/(.*)", toolbox.cacheOnly);
toolbox.router.get("*", toolbox.cacheFirst);

toolbox.router.any("*", toolbox.networkOnly, { origin: "http://83.93.98.21:8000" });

toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://cdnjs.cloudflare.com" });
toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://www.gstatic.com" });
toolbox.router.get("https://www.google-analytics.com/analytics.js", toolbox.cacheFirst);