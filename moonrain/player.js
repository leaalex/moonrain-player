
function MoonrainPlayer(selector) {
// TODO: this.default = {};
    // Переменные
    var key = genID("key");
    var mediaObject = [];
    var timeOut;
    var selectorDefault = ".moonrainplayer";
    

    // Препроверки
    if(selector === undefined){
        selector = selectorDefault;
    }

    // Вспомогательные методы

    // Методы расширения возможностей стандартных DOM обектов
    Element.prototype.appendChildren = function(){
        for (var key in arguments){
            this.appendChild(arguments[key]);
        }
    };

    // Вспомогательные функции:

    //Генерация ID
    function genID(value) {
        value = value || "id";
        return value +"_" + Math.random().toString(16).substr(2, 8).toUpperCase();
    }

    //Создание элемента html
    function createElement(tagName, id, classList, attributes, properties){
        var element = document.createElement(tagName);
        if (classList){
            element.classList.add(classList);
        }
        if (id){
            element.id = id;
        }
        if (attributes){
            for(var attribute in attributes){
                element.setAttribite(attribute, attributes[attribute]);
            }
        }
        if (properties){
            for (var propertiy in properties){
                element[propertiy] =  properties[propertiy];
            }
        }
        return element;
    }

    //Создание медиа-элемента
    function createMediaElement(tagName, name, src, type){
        var element = createElement(type, genID(type), 'class_' + type, false, {controls: true, preload: "auto"});
        var source = createElement("source", false, false, false, {src: src + name, type: type});
        element.appendChild(source);
        return element;
    }
    // Функция получение JSON'а по URL и преобрзование его в объект
    function getObjectJSON(urlJSON){
        var objectJSON = {};
        var request = new XMLHttpRequest();
        request.open('GET', urlJSON, false);
        request.onreadystatechange = function(e) {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    console.log("Загрузка успешно завершена: " , urlJSON);
                    objectJSON = JSON.parse(this.responseText);
                }
                else {
                    console.log("Ошибка загрузки: " + urlJSON);
                }
            }
        };
        request.send(null);
        return objectJSON;
    }


    // +++++++++++++++++
    // Временные функции
    // +++++++++++++++++
    function jsonTest(element){
        var objectJSON = getObjectJSON("https://crossorigin.me/" + element.dataset.src + "metadata.json");
        return objectJSON;
    }




    // Основные функции

    // Функция проверки запущен ли другой экзкмнляр библиотеки
    function check(){
        if(Array.prototype.filter.call(document.querySelectorAll(selector), function(element){
            return element.dataset.status !== undefined;
        }).length){
            console.info("Работает другая библиотека!");
        }
        else{
            start();
        }
    }

    // Функция перебора элементов подходящих под требования
    function start(){
        console.log('старт запстился, селектор '+ selector, this);
        Array.prototype.filter.call(document.querySelectorAll(selector), function(element){
            return element.dataset.status === undefined;
        }).forEach(function(element, i, array){
          //  console.log(element);

            element.dataset.status = key;
            constructor(element);
        });

        function checkStop(){
            var dataActiveCount = 0;
            document.querySelectorAll(selector).forEach(function(elem, index){
                if (elem.dataset.status == key){
                    dataActiveCount = index;
                }
            });
            console.log("Сравнение: ", document.querySelectorAll(selector).length - 1, dataActiveCount);
            if (document.querySelectorAll(selector).length - 1 == dataActiveCount){
                clearTimeout(timeOut);
            }
        }

        timeOut = setTimeout(function(){
            start();
           /*checkStop();*/
        }, 1000);
    }
//TODO: Функция проверки не запушена ли библиотека уже!






    // Основные методы

    // Инициализация библиотеки и возращене медиаобъектов
    this.init = function(){
        check();
        /*start();*/
        return mediaObject;
    };










    function constructor(HTMLElement){

        var element = {};
        element.html = HTMLElement;

        element.html.appendChild(createPlayer());

        mediaObject.push(element);

        videoObjects = [];
        audioObjects = [];
        mediaObjects = {};

        var jsonObject = jsonTest(HTMLElement);

        for (var i in jsonObject.video){
            if(jsonObject.video[i].filename !== undefined){
                /*console.log("https://crossorigin.me/" + element.dataset.src + "metadata.json");*/
                var video = createMediaElement("video", jsonObject.video[i].filename, HTMLElement.dataset.src);
                HTMLElement.appendChild(video);
                videoObjects[i] = video;
                var id  = genID();
                mediaObjects[id] = video;
                mediaObjects[id].type = "video";
            }
        }
        videoObjects.forEach(function(element){
            element.addEventListener("loadedmetadata", function(){
                console.log("video: ", element.duration);
            });
        });
        for (var i in jsonObject.audio){
            if(jsonObject.audio[i].filename !== undefined){
                var audio = createMediaElement("audio", jsonObject.audio[i].filename, element.dataset.src);
                element.appendChild(audio);
                audioObjects[i] = audio;
            }
        }
        audioObjects.forEach(function(element, index, object){

            element.addEventListener("loadedmetadata", function(){
            //console.log("audio: ", element.readyState);
            console.log("audio: "); //, element.duration);
            console.log(index);
            //object.splice(index, 1);
            });
       	});
    }





    function createPlayer(){

        var temp_elements = [1, 1, 1, 1, 1];

        var blockMedia = createElement("div", false, "player", false, false);
        var video = createElement("div", false, false, false, false);

        var blockControls = createElement("div", false, "bottom", false, false);
        var progress = createElement("div", false, "progress", false, false);

        for (var element in temp_elements){
            var timeline = createElement("div", false, false, false, false);
            var timelineVideo = createElement("div", false, "progress-video", false, false);
            var progressViewed = createElement("div", false, "progress-viewed", false, false);
            progressViewed.classList.add("progress-inactive");
    		timelineVideo.appendChild(progressViewed);
            var timelineAudio = createElement("div", false, "progress-audio", false, false);
            timeline.appendChildren(timelineVideo, timelineAudio);
            progress.appendChild(timeline);
        }

        var scrubber = createElement("div", false, "scrubber", false, false);
        scrubber.innerHTML = '<div class="scrubber-circle"></div>';
        progress.appendChild(scrubber);


        var controls = createElement("div", false, "controls", false, false);
        var leftControls = createElement("div", false, "controls-left", false, false);
        var rightControls = createElement("div", false, "controls-right", false, false);

        var buttonPlayPause = createElement("div", false, "control-button", false, false);
        buttonPlayPause.classList.add("play-pause");

        buttonPlayPause.innerHTML = '<svg class="play-image active" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path></svg><svg class="pause-image" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg>';

        var buttonStop = createElement("div", false,  "control-button", false, false);
        buttonStop.innerHTML = '';

        var buttonPrev = createElement("div", false, "control-button", false, false);
        buttonPrev.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="m 12,12 h 2 v 12 h -2 z m 3.5,6 8.5,6 V 12 z"></path></svg>';

        var buttonNext = createElement("div", false, "control-button", false, false);
        buttonNext.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z"></path></svg>';

        var buttonVolume = createElement("div", false, "control-volume", false, false);
        buttonVolume.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36"><path fill="white" d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z M19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"></path></svg>';

        var timer = createElement("div", false, "control-timer", false, false);
        timer.innerHTML = '<span>23:12</span> <span>/</span> <span>10:56:02</span>';

        var buttonSettings = createElement("div", false, "control-settings", false, false);
        buttonSettings.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36"><path d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z" fill="#fff"></path></svg>';

        var buttonFullscreen = createElement("div", false, "control-button", false, false);
        buttonFullscreen.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><g><path fill="white" class="ytp-svg-fill" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path></g><g><path fill="white" class="ytp-svg-fill" d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path></g><g><path fill="white" class="ytp-svg-fill" d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path></g><g><path fill="white" class="ytp-svg-fill" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path></g></svg>';

    	leftControls.appendChildren(buttonPlayPause, buttonStop, buttonPrev, buttonNext, buttonVolume, timer);
    	rightControls.appendChildren(buttonSettings, buttonFullscreen);

        controls.appendChildren(leftControls, rightControls);
        blockControls.appendChildren(progress, controls);

        var blockHide = createElement("div", false, "hide-videos", false, false);

        blockMedia.appendChildren(video, blockControls, blockHide);

        return blockMedia;
    }









 // Запуск компонентов библиотеки
    this.init();
}
