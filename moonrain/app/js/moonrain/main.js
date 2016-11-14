
console.log("model.js");
function MoonrainPlayer(selector) {

this.default = {};
var key = genID("key");
var mediaObject = [];
var selectorDefault = ".moonrainplayer";
var playerObjects = [];


// присвоения
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
    return value + "_" + Math.random().toString(16).substr(2, 8).toUpperCase();
}

//Создание элемента html
function createElement(tagName, id, classList, attributes, properties) {
    var element = document.createElement(tagName);
    if (id) {
        element.id = id;
    }
    //TODO: Написать функцию которая сможет при сождании элемента добовлять несколько классов
    if (classList) {
        element.classList.add(classList);
    }
    if (attributes) {
        for (var attribute in attributes) {
            element.setAttribite(attribute, attributes[attribute]);
        }
    }
    if (properties) {
        for (var propertiy in properties) {
            element[propertiy] = properties[propertiy];
        }
    }
    return element;
}

//Создание медиа-элемента
function createMediaElement(tagName, name, src, type) {
    var element = createElement(tagName, genID(tagName), 'class_' + tagName, false, {
        controls: true,
        preload: "auto"
    });
    var source = createElement("source", false, false, false, {
        src: src + name,
        type: type
    });
    element.appendChild(source);
    return element;
}
// Функция получение JSON'а по URL и преобрзование его в объект
function getObjectJSON(urlJSON) {
    var objectJSON = {};
    var request = new XMLHttpRequest();
    request.open('GET', urlJSON, false);
    request.onreadystatechange = function(e) {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.info("Загрузка успешно завершена: ", urlJSON);
                objectJSON = JSON.parse(this.responseText);
            } else {
                console.error("Ошибка загрузки: " + urlJSON);
            }
        }
    };
    request.send(null);
    return objectJSON;
}

// +++++++++++++++++
// Временные функции
// +++++++++++++++++
function checkStop(){
    var dataActiveCount = 0;
    document.querySelectorAll(selector).forEach(function(elem, index){
        if (elem.dataset.status == key){
            dataActiveCount = index;
        }
    });
    //console.info("Сравнение: ", document.querySelectorAll(selector).length - 1, dataActiveCount);
    if (document.querySelectorAll(selector).length - 1 == dataActiveCount){
        clearTimeout(timeOut);
    }
}
// lib/functions.js
// Основные внутренние функции MoonrainPlayer

// end

    // Основные функции

    // Функция проверки запущен ли другой экзкмнляр библиотеки
    // Если другого экземпляра не запущено то запускает функцию start()
    function check(selector){
        if(Array.prototype.filter.call(document.querySelectorAll(selector), function(element){
            return element.dataset.status !== undefined;
        }).length){
            console.warn("Работает другая библиотека!");
        }
        else{
            start(selector);
        }
    }

    // Функция перебора элементов подходящих под требования
    function start(selector){
       // console.info('старт запстился, селектор '+ selector, this);
        Array.prototype.filter.call(document.querySelectorAll(selector), function(HTMLElement){
            return HTMLElement.dataset.status === undefined;
        }).forEach(function(HTMLElement, i, array){
          //  console.log(element);
            HTMLElement.dataset.status = key;
            //playerConstructor(HTMLElement);
            mediaObject = removeElementWithoutDuration(getDuration(getData(HTMLElement)));
        });



        setTimeout(function(){
            start(selector);
        }, 1000);
    }




    function getData(HTMLElement){
        var element = HTMLElement;
        element.src = HTMLElement.dataset.src;

        element.speakers = getObjectJSON("https://crossorigin.me/" + HTMLElement.dataset.src + "endpoints.json");
        var JSONObject = getObjectJSON("https://crossorigin.me/" + HTMLElement.dataset.src + "metadata.json");

        element.speakers.forEach(function(speaker){
            speaker.audio = JSONObject.audio.filter(function(audio){
                return audio.endpointId == speaker.id;
            });
            speaker.video = JSONObject.video.filter(function(video){
                return video.endpointId == speaker.id && video.type == "RECORDING_STARTED";
            });
            speaker.change = JSONObject.video.filter(function(video){
                return video.endpointId == speaker.id && video.type == "SPEAKER_CHANGED";
            });
            speaker.audioDuration = 0;
            speaker.videoDuration = 0;
        });
        return element;
    }

    function getDuration(object){
        object.speakers.forEach(function(speaker){
            speaker.video.forEach(function(video){
                video.html = createMediaElement("video",video.filename, object.src, "video/webm");
                object.appendChild(video.html);
                addElementAfterLoadDuration(object, video);
                });

            speaker.audio.forEach(function(audio){
                audio.html = createMediaElement("audio",audio.filename, object.src, "audio/mp3");
                object.appendChild(audio.html);
                addElementAfterLoadDuration(object, audio);
            });
        });
        return object;
    }

    function addElementAfterLoadDuration(object, objectElement){
        objectElement.html.addEventListener("loadedmetadata", function(){
            objectElement.duration = this.duration;
            objectElement.timelineHtml = createElement("div",false ,false, false,false)
            console.log("add", objectElement);


            //object.appendChild(objectElement.html);
            timelineConstructor3(object, objectElement);
        });
    }




    function removeElementWithoutDuration(object){
        object.speakers.forEach(function(speaker){
            speaker.video.forEach(function(video){
                if(!video.duration) {
                    console.log("remove", video);
                    video.html.parentNode.removeChild(video.html);
                }
            });
            speaker.audio.forEach(function(audio){
                if(!audio.duration) {
                    console.log("remove", audio);
                    audio.html.parentNode.removeChild(audio.html);

                }
            });
        });
        return object;
    }



    function timelineConstructor3(object, objectElement){

        if(!object.querySelector(".timeline")) {var timeline = createElement("div", false, "timeline", false, false);
        object.appendChild(timeline)};
        var timeline = object.querySelector(".timeline")

        var arr = object.speakers.filter(function(speaker){
            return speaker.id == objectElement.endpointId
        });
        var x = arr[0][objectElement.mediaType].filter(function(element){
            return element.duration
        })
        arr[0][objectElement.mediaType+"Duration"] = (x[x.length - 1].instant - x[0].instant)/1000 + x[x.length - 1].duration;
        if (!timeline.querySelector("#speaker_"+objectElement.endpointId)){
            var line = createElement("div", "speaker_"+objectElement.endpointId, "item-timeline", false, false);
            timeline.appendChild(line);
        }
        var line = timeline.querySelector("#speaker_"+objectElement.endpointId);

        if(!line.querySelector(".video-timeline")){
            var videoLine =  createElement("div", false, "video-timeline", false, false);
            line.appendChild(videoLine);
        }
        var videoLine = line.querySelector(".video-timeline")
            if(!line.querySelector(".audio-timeline")){
                var audioLine =  createElement("div", false, "audio-timeline", false, false);
                line.appendChild(audioLine);
        }
        var audioLine = line.querySelector(".audio-timeline")


        //console.info(x[0][objectElement.mediaType]);
        console.info(object.speakers);
    }


    function timelineConstructor2(object){

        object.innerHTML = "";

        var timeline = createElement("div", false, "timeline", false, false);
        object.appendChild(timeline);

        object.speakers.forEach(function(speaker){



            var line = createElement("div", "speaker"+speaker.id, "item-timeline", false, false);
            var videoLine =  createElement("div", false, "video-timeline", false, false);
            var audioLine =  createElement("div", false, "audio-timeline", false, false);
            line.appendChildren(videoLine, audioLine);
            timeline.appendChild(line);

            speaker.video.forEach(function(video){
                if(video.duration){
                    var timeLineBlock = createElement("div", false, "video-block-timeline", false, false);
                    videoLine.appendChild(timeLineBlock);
                }
            });

            speaker.audio.forEach(function(audio){
                if(audio.duration){
                    var timeLineBlock = createElement("div", false, "audio-block-timeline", false, false);
                    audioLine.appendChild(timeLineBlock);
                }
            });

        });

    }

    function timelineConstructor(object, objectElement){


        var line = object.querySelector(".timeline").querySelector("#speaker" + objectElement.endpointId);
        if(line){
            if(objectElement.mediaType == "video"){
                    var timeLineBlock = createElement("div", false, "video-block-timeline", false, false);
                    line.querySelector(".video-timeline").appendChild(timeLineBlock);
            }
            else{
                    var timeLineBlock = createElement("div", false, "audio-block-timeline", false, false);
                    line.querySelector(".audio-timeline").appendChild(timeLineBlock);
            }
        }
        else{
            var newTimeline =  createElement("div", "speaker" + objectElement.endpointId, "item-timeline", false, false);
            var videoLine =  createElement("div", false, "video-timeline", false, false);
            var audioLine =  createElement("div", false, "audio-timeline", false, false);

            if(objectElement.mediaType == "video"){
                    var timeLineBlock = createElement("div", false, "video-block-timeline", false, false);
                    videoLine.appendChild(timeLineBlock);
            }
            else{
                    var timeLineBlock = createElement("div", false, "audio-block-timeline", false, false);
                    audioLine.appendChild(timeLineBlock);
            }

            newTimeline.appendChildren(videoLine, audioLine);
            object.querySelector(".timeline").appendChild(newTimeline);
        }
    }

    function playerConstructor(HTMLElement){

        var element = {};
        element.html = HTMLElement;
        element.media = [];
        element.users = [];
        element.speakerChange = [];

        mediaObject.push(element);
        var JSONObject = getObjectJSON("https://crossorigin.me/" + element.html.dataset.src + "metadata.json");
        var media = JSONObject.video.concat(JSONObject.audio);


        media.forEach(function(el){
            if(el.filename !== undefined){
                if(!element.users.includes(el.endpointId)) element.users.push(el.endpointId);
                var mediaElement = {};
                mediaElement.tagName = el.mediaType;
                mediaElement.filename = el.filename;
                mediaElement.src = element.html.dataset.src;
                if(el.mediaType == "audio") mediaElement.type = "audio/mp3";
                if(el.mediaType == "video") mediaElement.type = "video/webm";
                mediaElement.user = el.endpointId;
                mediaElement.instant = el.instant;
                element.media.push(mediaElement);
            }
            else{
                element.speakerChange.push(el)
            }
        });


        element.html.appendChild(createPlayer(element));
    }





    function createPlayer(el){
        var users = {};
        el.timelines = {};

        var blockMedia = createElement("div", false, "player", false, false);

        var video = createElement("video", false, "videoMoonrainPlayer", false, false);
        video.currentDuration = 0;
        video.first = 0;
        var sourceVideo = createElement("source", false, false, false, false);
        video.appendChild(sourceVideo);

        var audio = createElement("audio", false, "audioMoonrainPlayer", false, false);
        audio.currentDuration = 0;
        audio.first = 0;
        var sourceAudio = createElement("source", false, false, false, false);
        audio.appendChild(sourceAudio);

        var blockControls = createElement("div", false, "bottom", false, false);
        var progress = createElement("div", false, "progress", false, false);

        for (var user in el.users){
            var timeline = {};
            timeline.body = createElement("div", false, false, false, false);
            timeline.video = createElement("div", false, "progress-video", false, false);
            timeline.progressViewed = createElement("div", false, "progress-viewed", false, false);
            timeline.progressViewed.classList.add("progress-inactive");
            timeline.video.appendChild(timeline.progressViewed);
            timeline.audio = createElement("div", false, "progress-audio", false, false);
            timeline.body.appendChildren(timeline.video, timeline.audio);
            progress.appendChild(timeline.body);
            el.timelines[el.users[user]] = timeline;
            if(user == 0) {timeline.progressViewed.classList.add("progress-active");timeline.progressViewed.classList.remove("progress-inactive");}
        }



        var scrubber = createElement("div", false, "scrubber", false, false);
        scrubber.innerHTML = '<div class="scrubber-circle"></div>';
        progress.appendChild(scrubber);

        scrubber.ondragstart = function() {
            return false;
        };

        var controls = createElement("div", false, "controls", false, false);
        var leftControls = createElement("div", false, "controls-left", false, false);
        var rightControls = createElement("div", false, "controls-right", false, false);

        var buttonPlayPause = createElement("div", false, "control-button", false, false);
        buttonPlayPause.classList.add("play-pause");

        buttonPlayPause.innerHTML = '<svg class="play-image active" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path></svg><svg class="pause-image" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg>';


        buttonPlayPause.addEventListener('click', function(){

            this.querySelector(".play-image").classList.toggle('active');
            this.querySelector(".pause-image").classList.toggle('active');

            if(video.paused){
                video.play();
                audio.play()
            }
            else{
                video.pause();
                audio.pause();
            }

        });


       /* var buttonStop = createElement("div", false,  "control-button", false, false);
        buttonStop.innerHTML = '';*/

        var buttonPrev = createElement("div", false, "control-button", false,  {hidden: "hidden"});
        buttonPrev.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="m 12,12 h 2 v 12 h -2 z m 3.5,6 8.5,6 V 12 z"></path></svg>';

        var buttonNext = createElement("div", false, "control-button", false, {hidden: "hidden"});
        buttonNext.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path fill="white" d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z"></path></svg>';

        var buttonVolume = createElement("div", false, "control-volume", false, false);
        buttonVolume.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36"><path fill="white" d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z M19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"></path></svg>';

        buttonVolumeInput = createElement("input", false, "volume-value", false, {type: "range", min: "0", max: "1", step: "0.01"});
        buttonVolume.appendChild(buttonVolumeInput);

        var timer = createElement("div", false, "control-timer", false, false);
        timer.innerHTML = '<span>23:12</span> <span>/</span> <span>10:56:02</span>';

        var buttonSettings = createElement("div", false, "control-settings", false, false);
        buttonSettings.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36"><path d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z" fill="#fff"></path></svg>';

        var buttonFullscreen = createElement("div", false, "control-button", false, false);
        buttonFullscreen.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><g><path fill="white" class="ytp-svg-fill" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path></g><g><path fill="white" class="ytp-svg-fill" d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path></g><g><path fill="white" class="ytp-svg-fill" d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path></g><g><path fill="white" class="ytp-svg-fill" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path></g></svg>';

        leftControls.appendChildren(buttonPlayPause, /*buttonStop,*/ buttonPrev, buttonNext, buttonVolume, timer);
        rightControls.appendChildren(buttonSettings, buttonFullscreen);

        controls.appendChildren(leftControls, rightControls);
        blockControls.appendChildren(progress, controls);

        var blockHide = createElement("div", false, "hide-videos", false, false);

        el.users.forEach(function(element, index){
            users[element] = createElement("div", false, element, false, false);
            blockHide.appendChild(users[element]);
        });


        el.media.forEach(function(element, index){
            var HTMLElement = createMediaElement(element.tagName, element.filename, element.src, element.type);
            blockHide.appendChild(HTMLElement);

            HTMLElement.addEventListener("loadedmetadata", function(){
                users[element.user].appendChild(this);
                console.log(element.tagName, index, element.user, element.instant, HTMLElement.duration);
                element.duration = HTMLElement.duration;


            if(element.tagName == "video"){
                if(video.first == 0){
                    video.first = element.instant;
                    video.src = element.src + element.filename;
                    video.currentDuration = element.duration;
                }

                if (video.first > element.instant){
                    console.warn("video.src", video.src, element.instant);
                    video.src = element.src + element.filename;
                    video.currentDuration = element.duration;
                }
            }

            if(element.tagName == "audio"){
                if(audio.first == 0){
                    audio.first = element.instant;
                    audio.src = element.src + element.filename;
                    audio.currentDuration = element.duration;
                }
                if (audio.first > element.instant){
                    console.warn("audio.src", audio.src, element.instant);
                    audio.src = element.src + element.filename;
                    audio.currentDuration = element.duration;
                }
            }

            });


            el.timelines[element.user].body.addEventListener("mousedown", function(){
                if(element.tagName == "video"){
                    if(video.src !== element.src + element.filename){

                        if(video.paused){
                            video.src = element.src + element.filename;
                            video.currentDuration = element.duration;
                            video.pause();
                        }
                        else{
                            video.src = element.src + element.filename;
                            video.currentDuration = element.duration;
                            video.play();
                        }

                    }
                }
                if(element.tagName == "audio"){
                    if(audio.src !== element.src + element.filename){
                        if(audio.paused){
                            audio.src = element.src + element.filename;
                            audio.currentDuration = element.duration;
                            audio.pause();
                        }
                        else{
                            audio.src = element.src + element.filename;
                            audio.currentDuration = element.duration;
                            audio.play();
                        }
                    }
                }
            });




        });


        blockMedia.appendChildren(video, audio, blockControls, blockHide);


        //Постоянное отслеживанение состояний видео и аудио (play или pause)
        /*
        (function time(){
            console.log("video.paused: ", video.paused);
             console.log("audio.paused: ", audio.paused);
            setTimeout( time , 1000);

        })();
        */


        //+++++++++++++++++++++++++++++++++++++++++++++++++++++

        var moveListener = function(e){
            document.body.style.cursor = "pointer";
            var mouseX;
            (e.clientX - 19 < 0) ? mouseX = 0: (e.clientX - 19 > 830) ? mouseX = 830: mouseX = e.clientX - 19;

            scrubber.style.transform = "translateX(" + mouseX + "px)";

            for(var name in el.timelines){
                el.timelines[name].progressViewed.style.width = mouseX + "px";
            }

           // console.log("video.currentTime", video.currentDuration * (mouseX/830));
           // console.log("audio.currentTime", audio.currentDuration * (mouseX/830));

            video.currentTime = audio.currentDuration * (mouseX / 830);
            audio.currentTime = audio.currentDuration * (mouseX / 830);

        };


        video.addEventListener("timeupdate", function() {
            for(var name in el.timelines){
                el.timelines[name].progressViewed.style.width = (video.currentTime / video.currentDuration) * 830  + "px";
            }

            scrubber.style.transform = "translateX(" + (video.currentTime / video.currentDuration) * 830 + "px)";
        });


        video.addEventListener("onseeked", function(e) {
            alert("Seek operation completed!");
        });


        progress.addEventListener('mousedown', function(e) {
            moveListener(e);
            document.addEventListener('mousemove', moveListener,  false);
        }, false);


        scrubber.addEventListener('mousedown', function(e) {
            moveListener(e);
            document.addEventListener('mousemove', moveListener,  false);
        }, false);


        document.addEventListener('mouseup', function(e) {
            document.body.style.cursor = "auto";
            document.removeEventListener('mousemove', moveListener,  false);
            //console.log("UP!");
        }, false);


        buttonVolumeInput.addEventListener('input', function(e) {
            audio.volume = this.value;
            console.log(audio.volume);
        });


        buttonFullscreen.addEventListener('click', function(e) {
            console.log("OK!", video);
        });


        for(var name in el.timelines){
            (function(name){
                el.timelines[name].video.addEventListener('mousedown', function() {
                var i = [].slice.call(progress.childNodes).indexOf(el.timelines[name].body);
                    el.timelines[name].progressViewed.classList.remove("progress-inactive");
                    el.timelines[name].progressViewed.classList.add("progress-active");
                    for(var anothername in el.timelines){
                        if(anothername !==name){
                            el.timelines[anothername].progressViewed.classList.remove("progress-active");
                            el.timelines[anothername].progressViewed.classList.add("progress-inactive");
                        }
                    }
                    progress.querySelector(".scrubber-circle").style.top = i * 14 - 2 + "px";

                });
            })(name);
        }

        return blockMedia;
    }

    // Запуск компонентов библиотеки
// Основные методы

// Инициализация библиотеки и возращене медиаобъектов
this.init = function(){
    check(selector);
    /*start();*/
    return mediaObject;
};
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuY29uc29sZS5sb2coXCJtb2RlbC5qc1wiKTtcbmZ1bmN0aW9uIE1vb25yYWluUGxheWVyKHNlbGVjdG9yKSB7XG5cbnRoaXMuZGVmYXVsdCA9IHt9O1xudmFyIGtleSA9IGdlbklEKFwia2V5XCIpO1xudmFyIG1lZGlhT2JqZWN0ID0gW107XG52YXIgc2VsZWN0b3JEZWZhdWx0ID0gXCIubW9vbnJhaW5wbGF5ZXJcIjtcbnZhciBwbGF5ZXJPYmplY3RzID0gW107XG5cblxuLy8g0L/RgNC40YHQstC+0LXQvdC40Y9cbmlmKHNlbGVjdG9yID09PSB1bmRlZmluZWQpe1xuICAgIHNlbGVjdG9yID0gc2VsZWN0b3JEZWZhdWx0O1xufVxuLy8g0JLRgdC/0L7QvNC+0LPQsNGC0LXQu9GM0L3Ri9C1INC80LXRgtC+0LTRi1xuXG4vLyDQnNC10YLQvtC00Ysg0YDQsNGB0YjQuNGA0LXQvdC40Y8g0LLQvtC30LzQvtC20L3QvtGB0YLQtdC5INGB0YLQsNC90LTQsNGA0YLQvdGL0YUgRE9NINC+0LHQtdC60YLQvtCyXG5FbGVtZW50LnByb3RvdHlwZS5hcHBlbmRDaGlsZHJlbiA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50cyl7XG4gICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYXJndW1lbnRzW2tleV0pO1xuICAgIH1cbn07XG4vLyDQktGB0L/QvtC80L7Qs9Cw0YLQtdC70YzQvdGL0LUg0YTRg9C90LrRhtC40Lg6XG5cbi8v0JPQtdC90LXRgNCw0YbQuNGPIElEXG5mdW5jdGlvbiBnZW5JRCh2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgfHwgXCJpZFwiO1xuICAgIHJldHVybiB2YWx1ZSArIFwiX1wiICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc3Vic3RyKDIsIDgpLnRvVXBwZXJDYXNlKCk7XG59XG5cbi8v0KHQvtC30LTQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwIGh0bWxcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgaWQsIGNsYXNzTGlzdCwgYXR0cmlidXRlcywgcHJvcGVydGllcykge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICBpZiAoaWQpIHtcbiAgICAgICAgZWxlbWVudC5pZCA9IGlkO1xuICAgIH1cbiAgICAvL1RPRE86INCd0LDQv9C40YHQsNGC0Ywg0YTRg9C90LrRhtC40Y4g0LrQvtGC0L7RgNCw0Y8g0YHQvNC+0LbQtdGCINC/0YDQuCDRgdC+0LbQtNCw0L3QuNC4INGN0LvQtdC80LXQvdGC0LAg0LTQvtCx0L7QstC70Y/RgtGMINC90LXRgdC60L7Qu9GM0LrQviDQutC70LDRgdGB0L7QslxuICAgIGlmIChjbGFzc0xpc3QpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTGlzdCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJpYnV0ZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYml0ZShhdHRyaWJ1dGUsIGF0dHJpYnV0ZXNbYXR0cmlidXRlXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcGVydGl5IGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnRbcHJvcGVydGl5XSA9IHByb3BlcnRpZXNbcHJvcGVydGl5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cblxuLy/QodC+0LfQtNCw0L3QuNC1INC80LXQtNC40LAt0Y3Qu9C10LzQtdC90YLQsFxuZnVuY3Rpb24gY3JlYXRlTWVkaWFFbGVtZW50KHRhZ05hbWUsIG5hbWUsIHNyYywgdHlwZSkge1xuICAgIHZhciBlbGVtZW50ID0gY3JlYXRlRWxlbWVudCh0YWdOYW1lLCBnZW5JRCh0YWdOYW1lKSwgJ2NsYXNzXycgKyB0YWdOYW1lLCBmYWxzZSwge1xuICAgICAgICBjb250cm9sczogdHJ1ZSxcbiAgICAgICAgcHJlbG9hZDogXCJhdXRvXCJcbiAgICB9KTtcbiAgICB2YXIgc291cmNlID0gY3JlYXRlRWxlbWVudChcInNvdXJjZVwiLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCB7XG4gICAgICAgIHNyYzogc3JjICsgbmFtZSxcbiAgICAgICAgdHlwZTogdHlwZVxuICAgIH0pO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc291cmNlKTtcbiAgICByZXR1cm4gZWxlbWVudDtcbn1cbi8vINCk0YPQvdC60YbQuNGPINC/0L7Qu9GD0YfQtdC90LjQtSBKU09OJ9CwINC/0L4gVVJMINC4INC/0YDQtdC+0LHRgNC30L7QstCw0L3QuNC1INC10LPQviDQsiDQvtCx0YrQtdC60YJcbmZ1bmN0aW9uIGdldE9iamVjdEpTT04odXJsSlNPTikge1xuICAgIHZhciBvYmplY3RKU09OID0ge307XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybEpTT04sIGZhbHNlKTtcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwi0JfQsNCz0YDRg9C30LrQsCDRg9GB0L/QtdGI0L3QviDQt9Cw0LLQtdGA0YjQtdC90LA6IFwiLCB1cmxKU09OKTtcbiAgICAgICAgICAgICAgICBvYmplY3RKU09OID0gSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0LfQsNCz0YDRg9C30LrQuDogXCIgKyB1cmxKU09OKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxdWVzdC5zZW5kKG51bGwpO1xuICAgIHJldHVybiBvYmplY3RKU09OO1xufVxuXG4vLyArKysrKysrKysrKysrKysrK1xuLy8g0JLRgNC10LzQtdC90L3Ri9C1INGE0YPQvdC60YbQuNC4XG4vLyArKysrKysrKysrKysrKysrK1xuZnVuY3Rpb24gY2hlY2tTdG9wKCl7XG4gICAgdmFyIGRhdGFBY3RpdmVDb3VudCA9IDA7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikuZm9yRWFjaChmdW5jdGlvbihlbGVtLCBpbmRleCl7XG4gICAgICAgIGlmIChlbGVtLmRhdGFzZXQuc3RhdHVzID09IGtleSl7XG4gICAgICAgICAgICBkYXRhQWN0aXZlQ291bnQgPSBpbmRleDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vY29uc29sZS5pbmZvKFwi0KHRgNCw0LLQvdC10L3QuNC1OiBcIiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoIC0gMSwgZGF0YUFjdGl2ZUNvdW50KTtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoIC0gMSA9PSBkYXRhQWN0aXZlQ291bnQpe1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZU91dCk7XG4gICAgfVxufVxuLy8gbGliL2Z1bmN0aW9ucy5qc1xuLy8g0J7RgdC90L7QstC90YvQtSDQstC90YPRgtGA0LXQvdC90LjQtSDRhNGD0L3QutGG0LjQuCBNb29ucmFpblBsYXllclxuXG4vLyBlbmRcblxuICAgIC8vINCe0YHQvdC+0LLQvdGL0LUg0YTRg9C90LrRhtC40LhcblxuICAgIC8vINCk0YPQvdC60YbQuNGPINC/0YDQvtCy0LXRgNC60Lgg0LfQsNC/0YPRidC10L0g0LvQuCDQtNGA0YPQs9C+0Lkg0Y3QutC30LrQvNC90LvRj9GAINCx0LjQsdC70LjQvtGC0LXQutC4XG4gICAgLy8g0JXRgdC70Lgg0LTRgNGD0LPQvtCz0L4g0Y3QutC30LXQvNC/0LvRj9GA0LAg0L3QtSDQt9Cw0L/Rg9GJ0LXQvdC+INGC0L4g0LfQsNC/0YPRgdC60LDQtdGCINGE0YPQvdC60YbQuNGOIHN0YXJ0KClcbiAgICBmdW5jdGlvbiBjaGVjayhzZWxlY3Rvcil7XG4gICAgICAgIGlmKEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgZnVuY3Rpb24oZWxlbWVudCl7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5kYXRhc2V0LnN0YXR1cyAhPT0gdW5kZWZpbmVkO1xuICAgICAgICB9KS5sZW5ndGgpe1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi0KDQsNCx0L7RgtCw0LXRgiDQtNGA0YPQs9Cw0Y8g0LHQuNCx0LvQuNC+0YLQtdC60LAhXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBzdGFydChzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDQpNGD0L3QutGG0LjRjyDQv9C10YDQtdCx0L7RgNCwINGN0LvQtdC80LXQvdGC0L7QsiDQv9C+0LTRhdC+0LTRj9GJ0LjRhSDQv9C+0LQg0YLRgNC10LHQvtCy0LDQvdC40Y9cbiAgICBmdW5jdGlvbiBzdGFydChzZWxlY3Rvcil7XG4gICAgICAgLy8gY29uc29sZS5pbmZvKCfRgdGC0LDRgNGCINC30LDQv9GB0YLQuNC70YHRjywg0YHQtdC70LXQutGC0L7RgCAnKyBzZWxlY3RvciwgdGhpcyk7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgZnVuY3Rpb24oSFRNTEVsZW1lbnQpe1xuICAgICAgICAgICAgcmV0dXJuIEhUTUxFbGVtZW50LmRhdGFzZXQuc3RhdHVzID09PSB1bmRlZmluZWQ7XG4gICAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24oSFRNTEVsZW1lbnQsIGksIGFycmF5KXtcbiAgICAgICAgICAvLyAgY29uc29sZS5sb2coZWxlbWVudCk7XG4gICAgICAgICAgICBIVE1MRWxlbWVudC5kYXRhc2V0LnN0YXR1cyA9IGtleTtcbiAgICAgICAgICAgIC8vcGxheWVyQ29uc3RydWN0b3IoSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgbWVkaWFPYmplY3QgPSByZW1vdmVFbGVtZW50V2l0aG91dER1cmF0aW9uKGdldER1cmF0aW9uKGdldERhdGEoSFRNTEVsZW1lbnQpKSk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzdGFydChzZWxlY3Rvcik7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuXG5cblxuICAgIGZ1bmN0aW9uIGdldERhdGEoSFRNTEVsZW1lbnQpe1xuICAgICAgICB2YXIgZWxlbWVudCA9IEhUTUxFbGVtZW50O1xuICAgICAgICBlbGVtZW50LnNyYyA9IEhUTUxFbGVtZW50LmRhdGFzZXQuc3JjO1xuXG4gICAgICAgIGVsZW1lbnQuc3BlYWtlcnMgPSBnZXRPYmplY3RKU09OKFwiaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9cIiArIEhUTUxFbGVtZW50LmRhdGFzZXQuc3JjICsgXCJlbmRwb2ludHMuanNvblwiKTtcbiAgICAgICAgdmFyIEpTT05PYmplY3QgPSBnZXRPYmplY3RKU09OKFwiaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9cIiArIEhUTUxFbGVtZW50LmRhdGFzZXQuc3JjICsgXCJtZXRhZGF0YS5qc29uXCIpO1xuXG4gICAgICAgIGVsZW1lbnQuc3BlYWtlcnMuZm9yRWFjaChmdW5jdGlvbihzcGVha2VyKXtcbiAgICAgICAgICAgIHNwZWFrZXIuYXVkaW8gPSBKU09OT2JqZWN0LmF1ZGlvLmZpbHRlcihmdW5jdGlvbihhdWRpbyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF1ZGlvLmVuZHBvaW50SWQgPT0gc3BlYWtlci5pZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3BlYWtlci52aWRlbyA9IEpTT05PYmplY3QudmlkZW8uZmlsdGVyKGZ1bmN0aW9uKHZpZGVvKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlkZW8uZW5kcG9pbnRJZCA9PSBzcGVha2VyLmlkICYmIHZpZGVvLnR5cGUgPT0gXCJSRUNPUkRJTkdfU1RBUlRFRFwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzcGVha2VyLmNoYW5nZSA9IEpTT05PYmplY3QudmlkZW8uZmlsdGVyKGZ1bmN0aW9uKHZpZGVvKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlkZW8uZW5kcG9pbnRJZCA9PSBzcGVha2VyLmlkICYmIHZpZGVvLnR5cGUgPT0gXCJTUEVBS0VSX0NIQU5HRURcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3BlYWtlci5hdWRpb0R1cmF0aW9uID0gMDtcbiAgICAgICAgICAgIHNwZWFrZXIudmlkZW9EdXJhdGlvbiA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXREdXJhdGlvbihvYmplY3Qpe1xuICAgICAgICBvYmplY3Quc3BlYWtlcnMuZm9yRWFjaChmdW5jdGlvbihzcGVha2VyKXtcbiAgICAgICAgICAgIHNwZWFrZXIudmlkZW8uZm9yRWFjaChmdW5jdGlvbih2aWRlbyl7XG4gICAgICAgICAgICAgICAgdmlkZW8uaHRtbCA9IGNyZWF0ZU1lZGlhRWxlbWVudChcInZpZGVvXCIsdmlkZW8uZmlsZW5hbWUsIG9iamVjdC5zcmMsIFwidmlkZW8vd2VibVwiKTtcbiAgICAgICAgICAgICAgICBvYmplY3QuYXBwZW5kQ2hpbGQodmlkZW8uaHRtbCk7XG4gICAgICAgICAgICAgICAgYWRkRWxlbWVudEFmdGVyTG9hZER1cmF0aW9uKG9iamVjdCwgdmlkZW8pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzcGVha2VyLmF1ZGlvLmZvckVhY2goZnVuY3Rpb24oYXVkaW8pe1xuICAgICAgICAgICAgICAgIGF1ZGlvLmh0bWwgPSBjcmVhdGVNZWRpYUVsZW1lbnQoXCJhdWRpb1wiLGF1ZGlvLmZpbGVuYW1lLCBvYmplY3Quc3JjLCBcImF1ZGlvL21wM1wiKTtcbiAgICAgICAgICAgICAgICBvYmplY3QuYXBwZW5kQ2hpbGQoYXVkaW8uaHRtbCk7XG4gICAgICAgICAgICAgICAgYWRkRWxlbWVudEFmdGVyTG9hZER1cmF0aW9uKG9iamVjdCwgYXVkaW8pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEVsZW1lbnRBZnRlckxvYWREdXJhdGlvbihvYmplY3QsIG9iamVjdEVsZW1lbnQpe1xuICAgICAgICBvYmplY3RFbGVtZW50Lmh0bWwuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZG1ldGFkYXRhXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBvYmplY3RFbGVtZW50LmR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbjtcbiAgICAgICAgICAgIG9iamVjdEVsZW1lbnQudGltZWxpbmVIdG1sID0gY3JlYXRlRWxlbWVudChcImRpdlwiLGZhbHNlICxmYWxzZSwgZmFsc2UsZmFsc2UpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFkZFwiLCBvYmplY3RFbGVtZW50KTtcblxuXG4gICAgICAgICAgICAvL29iamVjdC5hcHBlbmRDaGlsZChvYmplY3RFbGVtZW50Lmh0bWwpO1xuICAgICAgICAgICAgdGltZWxpbmVDb25zdHJ1Y3RvcjMob2JqZWN0LCBvYmplY3RFbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cblxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlRWxlbWVudFdpdGhvdXREdXJhdGlvbihvYmplY3Qpe1xuICAgICAgICBvYmplY3Quc3BlYWtlcnMuZm9yRWFjaChmdW5jdGlvbihzcGVha2VyKXtcbiAgICAgICAgICAgIHNwZWFrZXIudmlkZW8uZm9yRWFjaChmdW5jdGlvbih2aWRlbyl7XG4gICAgICAgICAgICAgICAgaWYoIXZpZGVvLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlXCIsIHZpZGVvKTtcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uaHRtbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHZpZGVvLmh0bWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3BlYWtlci5hdWRpby5mb3JFYWNoKGZ1bmN0aW9uKGF1ZGlvKXtcbiAgICAgICAgICAgICAgICBpZighYXVkaW8uZHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVcIiwgYXVkaW8pO1xuICAgICAgICAgICAgICAgICAgICBhdWRpby5odG1sLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYXVkaW8uaHRtbCk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG5cblxuICAgIGZ1bmN0aW9uIHRpbWVsaW5lQ29uc3RydWN0b3IzKG9iamVjdCwgb2JqZWN0RWxlbWVudCl7XG5cbiAgICAgICAgaWYoIW9iamVjdC5xdWVyeVNlbGVjdG9yKFwiLnRpbWVsaW5lXCIpKSB7dmFyIHRpbWVsaW5lID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJ0aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBvYmplY3QuYXBwZW5kQ2hpbGQodGltZWxpbmUpfTtcbiAgICAgICAgdmFyIHRpbWVsaW5lID0gb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoXCIudGltZWxpbmVcIilcblxuICAgICAgICB2YXIgYXJyID0gb2JqZWN0LnNwZWFrZXJzLmZpbHRlcihmdW5jdGlvbihzcGVha2VyKXtcbiAgICAgICAgICAgIHJldHVybiBzcGVha2VyLmlkID09IG9iamVjdEVsZW1lbnQuZW5kcG9pbnRJZFxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHggPSBhcnJbMF1bb2JqZWN0RWxlbWVudC5tZWRpYVR5cGVdLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmR1cmF0aW9uXG4gICAgICAgIH0pXG4gICAgICAgIGFyclswXVtvYmplY3RFbGVtZW50Lm1lZGlhVHlwZStcIkR1cmF0aW9uXCJdID0gKHhbeC5sZW5ndGggLSAxXS5pbnN0YW50IC0geFswXS5pbnN0YW50KS8xMDAwICsgeFt4Lmxlbmd0aCAtIDFdLmR1cmF0aW9uO1xuICAgICAgICBpZiAoIXRpbWVsaW5lLnF1ZXJ5U2VsZWN0b3IoXCIjc3BlYWtlcl9cIitvYmplY3RFbGVtZW50LmVuZHBvaW50SWQpKXtcbiAgICAgICAgICAgIHZhciBsaW5lID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBcInNwZWFrZXJfXCIrb2JqZWN0RWxlbWVudC5lbmRwb2ludElkLCBcIml0ZW0tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIHRpbWVsaW5lLmFwcGVuZENoaWxkKGxpbmUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsaW5lID0gdGltZWxpbmUucXVlcnlTZWxlY3RvcihcIiNzcGVha2VyX1wiK29iamVjdEVsZW1lbnQuZW5kcG9pbnRJZCk7XG5cbiAgICAgICAgaWYoIWxpbmUucXVlcnlTZWxlY3RvcihcIi52aWRlby10aW1lbGluZVwiKSl7XG4gICAgICAgICAgICB2YXIgdmlkZW9MaW5lID0gIGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidmlkZW8tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIGxpbmUuYXBwZW5kQ2hpbGQodmlkZW9MaW5lKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdmlkZW9MaW5lID0gbGluZS5xdWVyeVNlbGVjdG9yKFwiLnZpZGVvLXRpbWVsaW5lXCIpXG4gICAgICAgICAgICBpZighbGluZS5xdWVyeVNlbGVjdG9yKFwiLmF1ZGlvLXRpbWVsaW5lXCIpKXtcbiAgICAgICAgICAgICAgICB2YXIgYXVkaW9MaW5lID0gIGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiYXVkaW8tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBsaW5lLmFwcGVuZENoaWxkKGF1ZGlvTGluZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF1ZGlvTGluZSA9IGxpbmUucXVlcnlTZWxlY3RvcihcIi5hdWRpby10aW1lbGluZVwiKVxuXG5cbiAgICAgICAgLy9jb25zb2xlLmluZm8oeFswXVtvYmplY3RFbGVtZW50Lm1lZGlhVHlwZV0pO1xuICAgICAgICBjb25zb2xlLmluZm8ob2JqZWN0LnNwZWFrZXJzKTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHRpbWVsaW5lQ29uc3RydWN0b3IyKG9iamVjdCl7XG5cbiAgICAgICAgb2JqZWN0LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICAgICAgdmFyIHRpbWVsaW5lID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJ0aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBvYmplY3QuYXBwZW5kQ2hpbGQodGltZWxpbmUpO1xuXG4gICAgICAgIG9iamVjdC5zcGVha2Vycy5mb3JFYWNoKGZ1bmN0aW9uKHNwZWFrZXIpe1xuXG5cblxuICAgICAgICAgICAgdmFyIGxpbmUgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIFwic3BlYWtlclwiK3NwZWFrZXIuaWQsIFwiaXRlbS10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgICAgdmFyIHZpZGVvTGluZSA9ICBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInZpZGVvLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICB2YXIgYXVkaW9MaW5lID0gIGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiYXVkaW8tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIGxpbmUuYXBwZW5kQ2hpbGRyZW4odmlkZW9MaW5lLCBhdWRpb0xpbmUpO1xuICAgICAgICAgICAgdGltZWxpbmUuYXBwZW5kQ2hpbGQobGluZSk7XG5cbiAgICAgICAgICAgIHNwZWFrZXIudmlkZW8uZm9yRWFjaChmdW5jdGlvbih2aWRlbyl7XG4gICAgICAgICAgICAgICAgaWYodmlkZW8uZHVyYXRpb24pe1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZUxpbmVCbG9jayA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidmlkZW8tYmxvY2stdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9MaW5lLmFwcGVuZENoaWxkKHRpbWVMaW5lQmxvY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzcGVha2VyLmF1ZGlvLmZvckVhY2goZnVuY3Rpb24oYXVkaW8pe1xuICAgICAgICAgICAgICAgIGlmKGF1ZGlvLmR1cmF0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVMaW5lQmxvY2sgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImF1ZGlvLWJsb2NrLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvTGluZS5hcHBlbmRDaGlsZCh0aW1lTGluZUJsb2NrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpbWVsaW5lQ29uc3RydWN0b3Iob2JqZWN0LCBvYmplY3RFbGVtZW50KXtcblxuXG4gICAgICAgIHZhciBsaW5lID0gb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoXCIudGltZWxpbmVcIikucXVlcnlTZWxlY3RvcihcIiNzcGVha2VyXCIgKyBvYmplY3RFbGVtZW50LmVuZHBvaW50SWQpO1xuICAgICAgICBpZihsaW5lKXtcbiAgICAgICAgICAgIGlmKG9iamVjdEVsZW1lbnQubWVkaWFUeXBlID09IFwidmlkZW9cIil7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lTGluZUJsb2NrID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJ2aWRlby1ibG9jay10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLnF1ZXJ5U2VsZWN0b3IoXCIudmlkZW8tdGltZWxpbmVcIikuYXBwZW5kQ2hpbGQodGltZUxpbmVCbG9jayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZUxpbmVCbG9jayA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiYXVkaW8tYmxvY2stdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5xdWVyeVNlbGVjdG9yKFwiLmF1ZGlvLXRpbWVsaW5lXCIpLmFwcGVuZENoaWxkKHRpbWVMaW5lQmxvY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICB2YXIgbmV3VGltZWxpbmUgPSAgY3JlYXRlRWxlbWVudChcImRpdlwiLCBcInNwZWFrZXJcIiArIG9iamVjdEVsZW1lbnQuZW5kcG9pbnRJZCwgXCJpdGVtLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICB2YXIgdmlkZW9MaW5lID0gIGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidmlkZW8tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIHZhciBhdWRpb0xpbmUgPSAgY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJhdWRpby10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xuXG4gICAgICAgICAgICBpZihvYmplY3RFbGVtZW50Lm1lZGlhVHlwZSA9PSBcInZpZGVvXCIpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZUxpbmVCbG9jayA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidmlkZW8tYmxvY2stdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9MaW5lLmFwcGVuZENoaWxkKHRpbWVMaW5lQmxvY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVMaW5lQmxvY2sgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImF1ZGlvLWJsb2NrLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvTGluZS5hcHBlbmRDaGlsZCh0aW1lTGluZUJsb2NrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbmV3VGltZWxpbmUuYXBwZW5kQ2hpbGRyZW4odmlkZW9MaW5lLCBhdWRpb0xpbmUpO1xuICAgICAgICAgICAgb2JqZWN0LnF1ZXJ5U2VsZWN0b3IoXCIudGltZWxpbmVcIikuYXBwZW5kQ2hpbGQobmV3VGltZWxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheWVyQ29uc3RydWN0b3IoSFRNTEVsZW1lbnQpe1xuXG4gICAgICAgIHZhciBlbGVtZW50ID0ge307XG4gICAgICAgIGVsZW1lbnQuaHRtbCA9IEhUTUxFbGVtZW50O1xuICAgICAgICBlbGVtZW50Lm1lZGlhID0gW107XG4gICAgICAgIGVsZW1lbnQudXNlcnMgPSBbXTtcbiAgICAgICAgZWxlbWVudC5zcGVha2VyQ2hhbmdlID0gW107XG5cbiAgICAgICAgbWVkaWFPYmplY3QucHVzaChlbGVtZW50KTtcbiAgICAgICAgdmFyIEpTT05PYmplY3QgPSBnZXRPYmplY3RKU09OKFwiaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9cIiArIGVsZW1lbnQuaHRtbC5kYXRhc2V0LnNyYyArIFwibWV0YWRhdGEuanNvblwiKTtcbiAgICAgICAgdmFyIG1lZGlhID0gSlNPTk9iamVjdC52aWRlby5jb25jYXQoSlNPTk9iamVjdC5hdWRpbyk7XG5cblxuICAgICAgICBtZWRpYS5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgIGlmKGVsLmZpbGVuYW1lICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIGlmKCFlbGVtZW50LnVzZXJzLmluY2x1ZGVzKGVsLmVuZHBvaW50SWQpKSBlbGVtZW50LnVzZXJzLnB1c2goZWwuZW5kcG9pbnRJZCk7XG4gICAgICAgICAgICAgICAgdmFyIG1lZGlhRWxlbWVudCA9IHt9O1xuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC50YWdOYW1lID0gZWwubWVkaWFUeXBlO1xuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5maWxlbmFtZSA9IGVsLmZpbGVuYW1lO1xuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5zcmMgPSBlbGVtZW50Lmh0bWwuZGF0YXNldC5zcmM7XG4gICAgICAgICAgICAgICAgaWYoZWwubWVkaWFUeXBlID09IFwiYXVkaW9cIikgbWVkaWFFbGVtZW50LnR5cGUgPSBcImF1ZGlvL21wM1wiO1xuICAgICAgICAgICAgICAgIGlmKGVsLm1lZGlhVHlwZSA9PSBcInZpZGVvXCIpIG1lZGlhRWxlbWVudC50eXBlID0gXCJ2aWRlby93ZWJtXCI7XG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50LnVzZXIgPSBlbC5lbmRwb2ludElkO1xuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5pbnN0YW50ID0gZWwuaW5zdGFudDtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1lZGlhLnB1c2gobWVkaWFFbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zcGVha2VyQ2hhbmdlLnB1c2goZWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgZWxlbWVudC5odG1sLmFwcGVuZENoaWxkKGNyZWF0ZVBsYXllcihlbGVtZW50KSk7XG4gICAgfVxuXG5cblxuXG5cbiAgICBmdW5jdGlvbiBjcmVhdGVQbGF5ZXIoZWwpe1xuICAgICAgICB2YXIgdXNlcnMgPSB7fTtcbiAgICAgICAgZWwudGltZWxpbmVzID0ge307XG5cbiAgICAgICAgdmFyIGJsb2NrTWVkaWEgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInBsYXllclwiLCBmYWxzZSwgZmFsc2UpO1xuXG4gICAgICAgIHZhciB2aWRlbyA9IGNyZWF0ZUVsZW1lbnQoXCJ2aWRlb1wiLCBmYWxzZSwgXCJ2aWRlb01vb25yYWluUGxheWVyXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IDA7XG4gICAgICAgIHZpZGVvLmZpcnN0ID0gMDtcbiAgICAgICAgdmFyIHNvdXJjZVZpZGVvID0gY3JlYXRlRWxlbWVudChcInNvdXJjZVwiLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIHZpZGVvLmFwcGVuZENoaWxkKHNvdXJjZVZpZGVvKTtcblxuICAgICAgICB2YXIgYXVkaW8gPSBjcmVhdGVFbGVtZW50KFwiYXVkaW9cIiwgZmFsc2UsIFwiYXVkaW9Nb29ucmFpblBsYXllclwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBhdWRpby5jdXJyZW50RHVyYXRpb24gPSAwO1xuICAgICAgICBhdWRpby5maXJzdCA9IDA7XG4gICAgICAgIHZhciBzb3VyY2VBdWRpbyA9IGNyZWF0ZUVsZW1lbnQoXCJzb3VyY2VcIiwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBhdWRpby5hcHBlbmRDaGlsZChzb3VyY2VBdWRpbyk7XG5cbiAgICAgICAgdmFyIGJsb2NrQ29udHJvbHMgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImJvdHRvbVwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICB2YXIgcHJvZ3Jlc3MgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzXCIsIGZhbHNlLCBmYWxzZSk7XG5cbiAgICAgICAgZm9yICh2YXIgdXNlciBpbiBlbC51c2Vycyl7XG4gICAgICAgICAgICB2YXIgdGltZWxpbmUgPSB7fTtcbiAgICAgICAgICAgIHRpbWVsaW5lLmJvZHkgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIHRpbWVsaW5lLnZpZGVvID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJwcm9ncmVzcy12aWRlb1wiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgICAgdGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzLXZpZXdlZFwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgICAgdGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LmFkZChcInByb2dyZXNzLWluYWN0aXZlXCIpO1xuICAgICAgICAgICAgdGltZWxpbmUudmlkZW8uYXBwZW5kQ2hpbGQodGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQpO1xuICAgICAgICAgICAgdGltZWxpbmUuYXVkaW8gPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzLWF1ZGlvXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgICB0aW1lbGluZS5ib2R5LmFwcGVuZENoaWxkcmVuKHRpbWVsaW5lLnZpZGVvLCB0aW1lbGluZS5hdWRpbyk7XG4gICAgICAgICAgICBwcm9ncmVzcy5hcHBlbmRDaGlsZCh0aW1lbGluZS5ib2R5KTtcbiAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tlbC51c2Vyc1t1c2VyXV0gPSB0aW1lbGluZTtcbiAgICAgICAgICAgIGlmKHVzZXIgPT0gMCkge3RpbWVsaW5lLnByb2dyZXNzVmlld2VkLmNsYXNzTGlzdC5hZGQoXCJwcm9ncmVzcy1hY3RpdmVcIik7dGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LnJlbW92ZShcInByb2dyZXNzLWluYWN0aXZlXCIpO31cbiAgICAgICAgfVxuXG5cblxuICAgICAgICB2YXIgc2NydWJiZXIgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInNjcnViYmVyXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIHNjcnViYmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic2NydWJiZXItY2lyY2xlXCI+PC9kaXY+JztcbiAgICAgICAgcHJvZ3Jlc3MuYXBwZW5kQ2hpbGQoc2NydWJiZXIpO1xuXG4gICAgICAgIHNjcnViYmVyLm9uZHJhZ3N0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGNvbnRyb2xzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sc1wiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICB2YXIgbGVmdENvbnRyb2xzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9scy1sZWZ0XCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIHZhciByaWdodENvbnRyb2xzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9scy1yaWdodFwiLCBmYWxzZSwgZmFsc2UpO1xuXG4gICAgICAgIHZhciBidXR0b25QbGF5UGF1c2UgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtYnV0dG9uXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIGJ1dHRvblBsYXlQYXVzZS5jbGFzc0xpc3QuYWRkKFwicGxheS1wYXVzZVwiKTtcblxuICAgICAgICBidXR0b25QbGF5UGF1c2UuaW5uZXJIVE1MID0gJzxzdmcgY2xhc3M9XCJwbGF5LWltYWdlIGFjdGl2ZVwiIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGQ9XCJNIDEyLDI2IDE4LjUsMjIgMTguNSwxNCAxMiwxMCB6IE0gMTguNSwyMiAyNSwxOCAyNSwxOCAxOC41LDE0IHpcIj48L3BhdGg+PC9zdmc+PHN2ZyBjbGFzcz1cInBhdXNlLWltYWdlXCIgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgd2lkdGg9XCIxMDAlXCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIk0gMTIsMjYgMTYsMjYgMTYsMTAgMTIsMTAgeiBNIDIxLDI2IDI1LDI2IDI1LDEwIDIxLDEwIHpcIj48L3BhdGg+PC9zdmc+JztcblxuXG4gICAgICAgIGJ1dHRvblBsYXlQYXVzZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIi5wbGF5LWltYWdlXCIpLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnBhdXNlLWltYWdlXCIpLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICBpZih2aWRlby5wYXVzZWQpe1xuICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICBhdWRpby5wbGF5KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAvKiB2YXIgYnV0dG9uU3RvcCA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsICBcImNvbnRyb2wtYnV0dG9uXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIGJ1dHRvblN0b3AuaW5uZXJIVE1MID0gJyc7Ki9cblxuICAgICAgICB2YXIgYnV0dG9uUHJldiA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbC1idXR0b25cIiwgZmFsc2UsICB7aGlkZGVuOiBcImhpZGRlblwifSk7XG4gICAgICAgIGJ1dHRvblByZXYuaW5uZXJIVE1MID0gJzxzdmcgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgd2lkdGg9XCIxMDAlXCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIm0gMTIsMTIgaCAyIHYgMTIgaCAtMiB6IG0gMy41LDYgOC41LDYgViAxMiB6XCI+PC9wYXRoPjwvc3ZnPic7XG5cbiAgICAgICAgdmFyIGJ1dHRvbk5leHQgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtYnV0dG9uXCIsIGZhbHNlLCB7aGlkZGVuOiBcImhpZGRlblwifSk7XG4gICAgICAgIGJ1dHRvbk5leHQuaW5uZXJIVE1MID0gJzxzdmcgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgd2lkdGg9XCIxMDAlXCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIk0gMTIsMjQgMjAuNSwxOCAxMiwxMiBWIDI0IHogTSAyMiwxMiB2IDEyIGggMiBWIDEyIGggLTIgelwiPjwvcGF0aD48L3N2Zz4nO1xuXG4gICAgICAgIHZhciBidXR0b25Wb2x1bWUgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtdm9sdW1lXCIsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIGJ1dHRvblZvbHVtZS5pbm5lckhUTUwgPSAnPHN2ZyBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgMzYgMzZcIj48cGF0aCBmaWxsPVwid2hpdGVcIiBkPVwiTTgsMjEgTDEyLDIxIEwxNywyNiBMMTcsMTAgTDEyLDE1IEw4LDE1IEw4LDIxIFogTTE5LDE0IEwxOSwyMiBDMjAuNDgsMjEuMzIgMjEuNSwxOS43NyAyMS41LDE4IEMyMS41LDE2LjI2IDIwLjQ4LDE0Ljc0IDE5LDE0IFogTTE5LDExLjI5IEMyMS44OSwxMi4xNSAyNCwxNC44MyAyNCwxOCBDMjQsMjEuMTcgMjEuODksMjMuODUgMTksMjQuNzEgTDE5LDI2Ljc3IEMyMy4wMSwyNS44NiAyNiwyMi4yOCAyNiwxOCBDMjYsMTMuNzIgMjMuMDEsMTAuMTQgMTksOS4yMyBMMTksMTEuMjkgWlwiPjwvcGF0aD48L3N2Zz4nO1xuXG4gICAgICAgIGJ1dHRvblZvbHVtZUlucHV0ID0gY3JlYXRlRWxlbWVudChcImlucHV0XCIsIGZhbHNlLCBcInZvbHVtZS12YWx1ZVwiLCBmYWxzZSwge3R5cGU6IFwicmFuZ2VcIiwgbWluOiBcIjBcIiwgbWF4OiBcIjFcIiwgc3RlcDogXCIwLjAxXCJ9KTtcbiAgICAgICAgYnV0dG9uVm9sdW1lLmFwcGVuZENoaWxkKGJ1dHRvblZvbHVtZUlucHV0KTtcblxuICAgICAgICB2YXIgdGltZXIgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtdGltZXJcIiwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgdGltZXIuaW5uZXJIVE1MID0gJzxzcGFuPjIzOjEyPC9zcGFuPiA8c3Bhbj4vPC9zcGFuPiA8c3Bhbj4xMDo1NjowMjwvc3Bhbj4nO1xuXG4gICAgICAgIHZhciBidXR0b25TZXR0aW5ncyA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbC1zZXR0aW5nc1wiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBidXR0b25TZXR0aW5ncy5pbm5lckhUTUwgPSAnPHN2ZyBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgMzYgMzZcIj48cGF0aCBkPVwibSAyMy45NCwxOC43OCBjIC4wMywtMC4yNSAuMDUsLTAuNTEgLjA1LC0wLjc4IDAsLTAuMjcgLTAuMDIsLTAuNTIgLTAuMDUsLTAuNzggbCAxLjY4LC0xLjMyIGMgLjE1LC0wLjEyIC4xOSwtMC4zMyAuMDksLTAuNTEgbCAtMS42LC0yLjc2IGMgLTAuMDksLTAuMTcgLTAuMzEsLTAuMjQgLTAuNDgsLTAuMTcgbCAtMS45OSwuOCBjIC0wLjQxLC0wLjMyIC0wLjg2LC0wLjU4IC0xLjM1LC0wLjc4IGwgLTAuMzAsLTIuMTIgYyAtMC4wMiwtMC4xOSAtMC4xOSwtMC4zMyAtMC4zOSwtMC4zMyBsIC0zLjIsMCBjIC0wLjIsMCAtMC4zNiwuMTQgLTAuMzksLjMzIGwgLTAuMzAsMi4xMiBjIC0wLjQ4LC4yIC0wLjkzLC40NyAtMS4zNSwuNzggbCAtMS45OSwtMC44IGMgLTAuMTgsLTAuMDcgLTAuMzksMCAtMC40OCwuMTcgbCAtMS42LDIuNzYgYyAtMC4xMCwuMTcgLTAuMDUsLjM5IC4wOSwuNTEgbCAxLjY4LDEuMzIgYyAtMC4wMywuMjUgLTAuMDUsLjUyIC0wLjA1LC43OCAwLC4yNiAuMDIsLjUyIC4wNSwuNzggbCAtMS42OCwxLjMyIGMgLTAuMTUsLjEyIC0wLjE5LC4zMyAtMC4wOSwuNTEgbCAxLjYsMi43NiBjIC4wOSwuMTcgLjMxLC4yNCAuNDgsLjE3IGwgMS45OSwtMC44IGMgLjQxLC4zMiAuODYsLjU4IDEuMzUsLjc4IGwgLjMwLDIuMTIgYyAuMDIsLjE5IC4xOSwuMzMgLjM5LC4zMyBsIDMuMiwwIGMgLjIsMCAuMzYsLTAuMTQgLjM5LC0wLjMzIGwgLjMwLC0yLjEyIGMgLjQ4LC0wLjIgLjkzLC0wLjQ3IDEuMzUsLTAuNzggbCAxLjk5LC44IGMgLjE4LC4wNyAuMzksMCAuNDgsLTAuMTcgbCAxLjYsLTIuNzYgYyAuMDksLTAuMTcgLjA1LC0wLjM5IC0wLjA5LC0wLjUxIGwgLTEuNjgsLTEuMzIgMCwwIHogbSAtNS45NCwyLjAxIGMgLTEuNTQsMCAtMi44LC0xLjI1IC0yLjgsLTIuOCAwLC0xLjU0IDEuMjUsLTIuOCAyLjgsLTIuOCAxLjU0LDAgMi44LDEuMjUgMi44LDIuOCAwLDEuNTQgLTEuMjUsMi44IC0yLjgsMi44IGwgMCwwIHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz4nO1xuXG4gICAgICAgIHZhciBidXR0b25GdWxsc2NyZWVuID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLWJ1dHRvblwiLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBidXR0b25GdWxsc2NyZWVuLmlubmVySFRNTCA9ICc8c3ZnIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIm0gMTAsMTYgMiwwIDAsLTQgNCwwIDAsLTIgTCAxMCwxMCBsIDAsNiAwLDAgelwiPjwvcGF0aD48L2c+PGc+PHBhdGggZmlsbD1cIndoaXRlXCIgY2xhc3M9XCJ5dHAtc3ZnLWZpbGxcIiBkPVwibSAyMCwxMCAwLDIgNCwwIDAsNCAyLDAgTCAyNiwxMCBsIC02LDAgMCwwIHpcIj48L3BhdGg+PC9nPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIm0gMjQsMjQgLTQsMCAwLDIgTCAyNiwyNiBsIDAsLTYgLTIsMCAwLDQgMCwwIHpcIj48L3BhdGg+PC9nPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIk0gMTIsMjAgMTAsMjAgMTAsMjYgbCA2LDAgMCwtMiAtNCwwIDAsLTQgMCwwIHpcIj48L3BhdGg+PC9nPjwvc3ZnPic7XG5cbiAgICAgICAgbGVmdENvbnRyb2xzLmFwcGVuZENoaWxkcmVuKGJ1dHRvblBsYXlQYXVzZSwgLypidXR0b25TdG9wLCovIGJ1dHRvblByZXYsIGJ1dHRvbk5leHQsIGJ1dHRvblZvbHVtZSwgdGltZXIpO1xuICAgICAgICByaWdodENvbnRyb2xzLmFwcGVuZENoaWxkcmVuKGJ1dHRvblNldHRpbmdzLCBidXR0b25GdWxsc2NyZWVuKTtcblxuICAgICAgICBjb250cm9scy5hcHBlbmRDaGlsZHJlbihsZWZ0Q29udHJvbHMsIHJpZ2h0Q29udHJvbHMpO1xuICAgICAgICBibG9ja0NvbnRyb2xzLmFwcGVuZENoaWxkcmVuKHByb2dyZXNzLCBjb250cm9scyk7XG5cbiAgICAgICAgdmFyIGJsb2NrSGlkZSA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiaGlkZS12aWRlb3NcIiwgZmFsc2UsIGZhbHNlKTtcblxuICAgICAgICBlbC51c2Vycy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KXtcbiAgICAgICAgICAgIHVzZXJzW2VsZW1lbnRdID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgZWxlbWVudCwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIGJsb2NrSGlkZS5hcHBlbmRDaGlsZCh1c2Vyc1tlbGVtZW50XSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgZWwubWVkaWEuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCl7XG4gICAgICAgICAgICB2YXIgSFRNTEVsZW1lbnQgPSBjcmVhdGVNZWRpYUVsZW1lbnQoZWxlbWVudC50YWdOYW1lLCBlbGVtZW50LmZpbGVuYW1lLCBlbGVtZW50LnNyYywgZWxlbWVudC50eXBlKTtcbiAgICAgICAgICAgIGJsb2NrSGlkZS5hcHBlbmRDaGlsZChIVE1MRWxlbWVudCk7XG5cbiAgICAgICAgICAgIEhUTUxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkZWRtZXRhZGF0YVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHVzZXJzW2VsZW1lbnQudXNlcl0uYXBwZW5kQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZWxlbWVudC50YWdOYW1lLCBpbmRleCwgZWxlbWVudC51c2VyLCBlbGVtZW50Lmluc3RhbnQsIEhUTUxFbGVtZW50LmR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmR1cmF0aW9uID0gSFRNTEVsZW1lbnQuZHVyYXRpb247XG5cblxuICAgICAgICAgICAgaWYoZWxlbWVudC50YWdOYW1lID09IFwidmlkZW9cIil7XG4gICAgICAgICAgICAgICAgaWYodmlkZW8uZmlyc3QgPT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmZpcnN0ID0gZWxlbWVudC5pbnN0YW50O1xuICAgICAgICAgICAgICAgICAgICB2aWRlby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHZpZGVvLmZpcnN0ID4gZWxlbWVudC5pbnN0YW50KXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwidmlkZW8uc3JjXCIsIHZpZGVvLnNyYywgZWxlbWVudC5pbnN0YW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICB2aWRlby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoZWxlbWVudC50YWdOYW1lID09IFwiYXVkaW9cIil7XG4gICAgICAgICAgICAgICAgaWYoYXVkaW8uZmlyc3QgPT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLmZpcnN0ID0gZWxlbWVudC5pbnN0YW50O1xuICAgICAgICAgICAgICAgICAgICBhdWRpby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhdWRpby5maXJzdCA+IGVsZW1lbnQuaW5zdGFudCl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcImF1ZGlvLnNyY1wiLCBhdWRpby5zcmMsIGVsZW1lbnQuaW5zdGFudCk7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgYXVkaW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tlbGVtZW50LnVzZXJdLmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmKGVsZW1lbnQudGFnTmFtZSA9PSBcInZpZGVvXCIpe1xuICAgICAgICAgICAgICAgICAgICBpZih2aWRlby5zcmMgIT09IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZSl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHZpZGVvLnBhdXNlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoZWxlbWVudC50YWdOYW1lID09IFwiYXVkaW9cIil7XG4gICAgICAgICAgICAgICAgICAgIGlmKGF1ZGlvLnNyYyAhPT0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGF1ZGlvLnBhdXNlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuXG5cbiAgICAgICAgfSk7XG5cblxuICAgICAgICBibG9ja01lZGlhLmFwcGVuZENoaWxkcmVuKHZpZGVvLCBhdWRpbywgYmxvY2tDb250cm9scywgYmxvY2tIaWRlKTtcblxuXG4gICAgICAgIC8v0J/QvtGB0YLQvtGP0L3QvdC+0LUg0L7RgtGB0LvQtdC20LjQstCw0L3QtdC90LjQtSDRgdC+0YHRgtC+0Y/QvdC40Lkg0LLQuNC00LXQviDQuCDQsNGD0LTQuNC+IChwbGF5INC40LvQuCBwYXVzZSlcbiAgICAgICAgLypcbiAgICAgICAgKGZ1bmN0aW9uIHRpbWUoKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidmlkZW8ucGF1c2VkOiBcIiwgdmlkZW8ucGF1c2VkKTtcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImF1ZGlvLnBhdXNlZDogXCIsIGF1ZGlvLnBhdXNlZCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCB0aW1lICwgMTAwMCk7XG5cbiAgICAgICAgfSkoKTtcbiAgICAgICAgKi9cblxuXG4gICAgICAgIC8vKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKytcblxuICAgICAgICB2YXIgbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwicG9pbnRlclwiO1xuICAgICAgICAgICAgdmFyIG1vdXNlWDtcbiAgICAgICAgICAgIChlLmNsaWVudFggLSAxOSA8IDApID8gbW91c2VYID0gMDogKGUuY2xpZW50WCAtIDE5ID4gODMwKSA/IG1vdXNlWCA9IDgzMDogbW91c2VYID0gZS5jbGllbnRYIC0gMTk7XG5cbiAgICAgICAgICAgIHNjcnViYmVyLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWChcIiArIG1vdXNlWCArIFwicHgpXCI7XG5cbiAgICAgICAgICAgIGZvcih2YXIgbmFtZSBpbiBlbC50aW1lbGluZXMpe1xuICAgICAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tuYW1lXS5wcm9ncmVzc1ZpZXdlZC5zdHlsZS53aWR0aCA9IG1vdXNlWCArIFwicHhcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInZpZGVvLmN1cnJlbnRUaW1lXCIsIHZpZGVvLmN1cnJlbnREdXJhdGlvbiAqIChtb3VzZVgvODMwKSk7XG4gICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYXVkaW8uY3VycmVudFRpbWVcIiwgYXVkaW8uY3VycmVudER1cmF0aW9uICogKG1vdXNlWC84MzApKTtcblxuICAgICAgICAgICAgdmlkZW8uY3VycmVudFRpbWUgPSBhdWRpby5jdXJyZW50RHVyYXRpb24gKiAobW91c2VYIC8gODMwKTtcbiAgICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gYXVkaW8uY3VycmVudER1cmF0aW9uICogKG1vdXNlWCAvIDgzMCk7XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoXCJ0aW1ldXBkYXRlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yKHZhciBuYW1lIGluIGVsLnRpbWVsaW5lcyl7XG4gICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW25hbWVdLnByb2dyZXNzVmlld2VkLnN0eWxlLndpZHRoID0gKHZpZGVvLmN1cnJlbnRUaW1lIC8gdmlkZW8uY3VycmVudER1cmF0aW9uKSAqIDgzMCAgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjcnViYmVyLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWChcIiArICh2aWRlby5jdXJyZW50VGltZSAvIHZpZGVvLmN1cnJlbnREdXJhdGlvbikgKiA4MzAgKyBcInB4KVwiO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoXCJvbnNlZWtlZFwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBhbGVydChcIlNlZWsgb3BlcmF0aW9uIGNvbXBsZXRlZCFcIik7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgcHJvZ3Jlc3MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgbW92ZUxpc3RlbmVyKGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZUxpc3RlbmVyLCAgZmFsc2UpO1xuICAgICAgICB9LCBmYWxzZSk7XG5cblxuICAgICAgICBzY3J1YmJlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBtb3ZlTGlzdGVuZXIoZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlTGlzdGVuZXIsICBmYWxzZSk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiYXV0b1wiO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZUxpc3RlbmVyLCAgZmFsc2UpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlVQIVwiKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuXG5cbiAgICAgICAgYnV0dG9uVm9sdW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBhdWRpby52b2x1bWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYXVkaW8udm9sdW1lKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICBidXR0b25GdWxsc2NyZWVuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPSyFcIiwgdmlkZW8pO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIGZvcih2YXIgbmFtZSBpbiBlbC50aW1lbGluZXMpe1xuICAgICAgICAgICAgKGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tuYW1lXS52aWRlby5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IFtdLnNsaWNlLmNhbGwocHJvZ3Jlc3MuY2hpbGROb2RlcykuaW5kZXhPZihlbC50aW1lbGluZXNbbmFtZV0uYm9keSk7XG4gICAgICAgICAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tuYW1lXS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QucmVtb3ZlKFwicHJvZ3Jlc3MtaW5hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tuYW1lXS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QuYWRkKFwicHJvZ3Jlc3MtYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGFub3RoZXJuYW1lIGluIGVsLnRpbWVsaW5lcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhbm90aGVybmFtZSAhPT1uYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbYW5vdGhlcm5hbWVdLnByb2dyZXNzVmlld2VkLmNsYXNzTGlzdC5yZW1vdmUoXCJwcm9ncmVzcy1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW2Fub3RoZXJuYW1lXS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QuYWRkKFwicHJvZ3Jlc3MtaW5hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MucXVlcnlTZWxlY3RvcihcIi5zY3J1YmJlci1jaXJjbGVcIikuc3R5bGUudG9wID0gaSAqIDE0IC0gMiArIFwicHhcIjtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYmxvY2tNZWRpYTtcbiAgICB9XG5cbiAgICAvLyDQl9Cw0L/Rg9GB0Log0LrQvtC80L/QvtC90LXQvdGC0L7QsiDQsdC40LHQu9C40L7RgtC10LrQuFxuLy8g0J7RgdC90L7QstC90YvQtSDQvNC10YLQvtC00YtcblxuLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0LHQuNCx0LvQuNC+0YLQtdC60Lgg0Lgg0LLQvtC30YDQsNGJ0LXQvdC1INC80LXQtNC40LDQvtCx0YrQtdC60YLQvtCyXG50aGlzLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIGNoZWNrKHNlbGVjdG9yKTtcbiAgICAvKnN0YXJ0KCk7Ki9cbiAgICByZXR1cm4gbWVkaWFPYmplY3Q7XG59O1xufSJdLCJmaWxlIjoibWFpbi5qcyJ9
