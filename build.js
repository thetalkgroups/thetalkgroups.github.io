const { rollup } = require("rollup")
const { minify }= require("uglify-js")
const { watchTree } = require("watch")
const fs = require("fs")

let cache = {};
const filesToBuild = [
    "common",
    "sign-in",
    "item",
    "list",
    "add-item",
    "admin-list"
];

const buildFile = name =>
    rollup({ entry: `${__dirname}/js/${name}.js`, cache: cache[name] })
        .then(bundle => {
            const result = bundle.generate({ format: "es" });

            cache[name] = bundle;

            return result.code;
        })
        .then(rolled => {
            const minified = minify(rolled, { fromString: true }).code;

            fs.writeFileSync(`${__dirname}/js/${name}.min.js`, minified);

            console.log("[build end] " + name);
        })

watchTree(`${__dirname}/js/`, {
    filter: path => filesToBuild
        .map(name => path === `${__dirname}/js/${name}.js`)
        .find(r => r === true)
}, f => {
    if (typeof f !== "string" || !f.endsWith(".js")) return;

    const name = f.replace(__dirname + "/js/", "").replace(".js", "");

    console.log("[build start] " + name);

    buildFile(name);
})
