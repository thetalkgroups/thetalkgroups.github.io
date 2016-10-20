// 1

importScripts('sw-toolbox.js');

toolbox.precache([
    "/sign-in.html",
    "/admin.html",

    "/thc/forum/questions/add-item.html",
    "/thc/forum/questions/index.html",
    "/thc/forum/questions/item.html",
    "/thc/forum/tips-and-tricks/add-item.html",
    "/thc/forum/tips-and-tricks/index.html",
    "/thc/forum/tips-and-tricks/item.html",
    
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

toolbox.router.get("*", toolbox.cacheFirst);

toolbox.router.get("/", toolbox.networkOnly)
toolbox.router.get("/index.html", toolbox.networkOnly)
toolbox.router.get("/*/index.html", toolbox.networkOnly)
toolbox.router.get("/*/general-hr.html", toolbox.networkOnly)
toolbox.router.get("/*/test-kits.html", toolbox.networkOnly)
toolbox.router.get("/*/forum/index.html", toolbox.networkOnly)
toolbox.router.get("/*/forum/harm-reduction.html", toolbox.networkOnly)
toolbox.router.get("/*/forum/read-first.html", toolbox.networkOnly)

toolbox.router.any("*", toolbox.networkOnly, { origin: "http://83.93.98.21:8000" });

toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://cdnjs.cloudflare.com" });
toolbox.router.get("*", toolbox.cacheFirst, { origin: "https://www.gstatic.com" });
toolbox.router.get("https://www.google-analytics.com/analytics.js", toolbox.cacheFirst);