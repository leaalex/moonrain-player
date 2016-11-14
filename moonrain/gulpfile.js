var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger');

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'app/js/moonrain',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    app: { //Пути откуда брать исходники
        html: 'app/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'app/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'app/css/main.scss',
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

    gulp.task('sass', function(){ // Создаем таск "sass"
        return gulp.src('app/sass/main.scss') // Берем источник
            .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
            .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
    });
    gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('script.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('js:build', function () {
    gulp.src(path.app.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
//        .pipe(sourcemaps.init()) //Инициализируем sourcemap
//        .pipe(sourcemaps.write())//Пропишем карты
        .pipe(gulp.dest(path.build.js)); //Выплюнем готовый файл в build
});

gulp.task('watch', function() {
    gulp.watch('app/sass/*.scss', ['sass']); // Наблюдение за sass файлами
    gulp.watch('app/js/lib/*.js', ['js:build'])
    // Наблюдение за другими типами файлов
});
