var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task('remap-istanbul', function () {
    return gulp.src('test/coverage-final.json')
        .pipe(remapIstanbul())
        .pipe(gulp.dest('coverage-remapped.json'));
});