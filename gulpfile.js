const { src, dest, series, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const csso = require("gulp-csso");
const include = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
//add in package.json "broserslist"[last 3 versions]
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin"); // npm i -D gulp-imagemin@7
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify-es").default;
//var rigger = require("gulp-rigger");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const size = require("gulp-size");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const cssimport = require("gulp-cssimport");

function imgmin() {
    return src("src/img/**.*")
        .pipe(
            imagemin({
                verbose: true,
            })
        )
        .pipe(dest("dist/img"));
}

function js() {
    return src("src/js/**/*.js")
        .pipe(
            plumber({
                errorHandler: notify.onError((error) => ({
                    title: "JavaScript",
                    message: error.message,
                })),
            })
        )
        .pipe(uglify())
        .pipe(dest("dist/js"));
}

function html() {
    return src("src/**/[^_]*.html")
        .pipe(
            plumber({
                errorHandler: notify.onError((error) => ({
                    title: "HTML",
                    message: error.message,
                })),
            })
        )
        .pipe(plumber())
        .pipe(
            include({
                prefix: "@@",
            })
        )

        .pipe(size({ title: "before min" }))
        .pipe(
            htmlmin({
                collapseWhitespace: true,
            })
        )
        .pipe(size({ title: "after min" }))
        .pipe(dest("dist"));
}

function scss() {
    return src("src/scss/**/*.scss")
        .pipe(
            plumber({
                errorHandler: notify.onError((error) => ({
                    title: "SCSS",
                    message: error.message,
                })),
            })
        )
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(cssimport())
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(size({ title: "size css before min" }))
        .pipe(dest("dist/css/max_css"))
        .pipe(rename({ suffix: ".min" }))
        .pipe(csso())
        .pipe(concat("style.css"))
        .pipe(cleanCSS({ compatibility: "ie8" }))
        .pipe(sourcemaps.write())
        .pipe(size({ title: "after min" }))
        .pipe(dest("dist/css"));
}

function clear() {
    return del("dist");
}

function serve() {
    sync.init({
        server: "./dist",
    });

    watch("src/**/*.html", series(html)).on("change", sync.reload);
    watch("src/**/*.scss", series(scss)).on("change", sync.reload);
    watch("src/js/**/*.js", series(js)).on("change", sync.reload);
}

exports.build = series(clear, scss, html, imgmin);
exports.dev = series(clear, scss, html, imgmin, js, serve);
exports.clear = clear;
exports.imgmin = imgmin;
