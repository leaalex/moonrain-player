console.log("Я e.js")
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


    // Основные методы

    // Инициализация библиотеки и возращене медиаобъектов
    this.init = function(){
        check(selector);
        /*start();*/
        return mediaObject;
    };

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUubG9nKFwi0K8gZS5qc1wiKVxyXG5jb25zb2xlLmxvZyhcIm1vZGVsLmpzXCIpO1xyXG5mdW5jdGlvbiBNb29ucmFpblBsYXllcihzZWxlY3Rvcikge1xyXG5cclxudGhpcy5kZWZhdWx0ID0ge307XHJcbnZhciBrZXkgPSBnZW5JRChcImtleVwiKTtcclxudmFyIG1lZGlhT2JqZWN0ID0gW107XHJcbnZhciBzZWxlY3RvckRlZmF1bHQgPSBcIi5tb29ucmFpbnBsYXllclwiO1xyXG52YXIgcGxheWVyT2JqZWN0cyA9IFtdO1xyXG5cclxuXHJcbi8vINC/0YDQuNGB0LLQvtC10L3QuNGPXHJcbmlmKHNlbGVjdG9yID09PSB1bmRlZmluZWQpe1xyXG4gICAgc2VsZWN0b3IgPSBzZWxlY3RvckRlZmF1bHQ7XHJcbn1cclxuLy8g0JLRgdC/0L7QvNC+0LPQsNGC0LXQu9GM0L3Ri9C1INC80LXRgtC+0LTRi1xyXG5cclxuLy8g0JzQtdGC0L7QtNGLINGA0LDRgdGI0LjRgNC10L3QuNGPINCy0L7Qt9C80L7QttC90L7RgdGC0LXQuSDRgdGC0LDQvdC00LDRgNGC0L3Ri9GFIERPTSDQvtCx0LXQutGC0L7QslxyXG5FbGVtZW50LnByb3RvdHlwZS5hcHBlbmRDaGlsZHJlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gYXJndW1lbnRzKXtcclxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGFyZ3VtZW50c1trZXldKTtcclxuICAgIH1cclxufTtcclxuLy8g0JLRgdC/0L7QvNC+0LPQsNGC0LXQu9GM0L3Ri9C1INGE0YPQvdC60YbQuNC4OlxyXG5cclxuLy/Qk9C10L3QtdGA0LDRhtC40Y8gSURcclxuZnVuY3Rpb24gZ2VuSUQodmFsdWUpIHtcclxuICAgIHZhbHVlID0gdmFsdWUgfHwgXCJpZFwiO1xyXG4gICAgcmV0dXJuIHZhbHVlICsgXCJfXCIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDE2KS5zdWJzdHIoMiwgOCkudG9VcHBlckNhc2UoKTtcclxufVxyXG5cclxuLy/QodC+0LfQtNCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LAgaHRtbFxyXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUsIGlkLCBjbGFzc0xpc3QsIGF0dHJpYnV0ZXMsIHByb3BlcnRpZXMpIHtcclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcclxuICAgIGlmIChpZCkge1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSBpZDtcclxuICAgIH1cclxuICAgIC8vVE9ETzog0J3QsNC/0LjRgdCw0YLRjCDRhNGD0L3QutGG0LjRjiDQutC+0YLQvtGA0LDRjyDRgdC80L7QttC10YIg0L/RgNC4INGB0L7QttC00LDQvdC40Lgg0Y3Qu9C10LzQtdC90YLQsCDQtNC+0LHQvtCy0LvRj9GC0Ywg0L3QtdGB0LrQvtC70YzQutC+INC60LvQsNGB0YHQvtCyXHJcbiAgICBpZiAoY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTGlzdCk7XHJcbiAgICB9XHJcbiAgICBpZiAoYXR0cmlidXRlcykge1xyXG4gICAgICAgIGZvciAodmFyIGF0dHJpYnV0ZSBpbiBhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmliaXRlKGF0dHJpYnV0ZSwgYXR0cmlidXRlc1thdHRyaWJ1dGVdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocHJvcGVydGllcykge1xyXG4gICAgICAgIGZvciAodmFyIHByb3BlcnRpeSBpbiBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnRbcHJvcGVydGl5XSA9IHByb3BlcnRpZXNbcHJvcGVydGl5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxufVxyXG5cclxuLy/QodC+0LfQtNCw0L3QuNC1INC80LXQtNC40LAt0Y3Qu9C10LzQtdC90YLQsFxyXG5mdW5jdGlvbiBjcmVhdGVNZWRpYUVsZW1lbnQodGFnTmFtZSwgbmFtZSwgc3JjLCB0eXBlKSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgZ2VuSUQodGFnTmFtZSksICdjbGFzc18nICsgdGFnTmFtZSwgZmFsc2UsIHtcclxuICAgICAgICBjb250cm9sczogdHJ1ZSxcclxuICAgICAgICBwcmVsb2FkOiBcImF1dG9cIlxyXG4gICAgfSk7XHJcbiAgICB2YXIgc291cmNlID0gY3JlYXRlRWxlbWVudChcInNvdXJjZVwiLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCB7XHJcbiAgICAgICAgc3JjOiBzcmMgKyBuYW1lLFxyXG4gICAgICAgIHR5cGU6IHR5cGVcclxuICAgIH0pO1xyXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3VyY2UpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn1cclxuLy8g0KTRg9C90LrRhtC40Y8g0L/QvtC70YPRh9C10L3QuNC1IEpTT04n0LAg0L/QviBVUkwg0Lgg0L/RgNC10L7QsdGA0LfQvtCy0LDQvdC40LUg0LXQs9C+INCyINC+0LHRitC10LrRglxyXG5mdW5jdGlvbiBnZXRPYmplY3RKU09OKHVybEpTT04pIHtcclxuICAgIHZhciBvYmplY3RKU09OID0ge307XHJcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmxKU09OLCBmYWxzZSk7XHJcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwi0JfQsNCz0YDRg9C30LrQsCDRg9GB0L/QtdGI0L3QviDQt9Cw0LLQtdGA0YjQtdC90LA6IFwiLCB1cmxKU09OKTtcclxuICAgICAgICAgICAgICAgIG9iamVjdEpTT04gPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0LfQsNCz0YDRg9C30LrQuDogXCIgKyB1cmxKU09OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXF1ZXN0LnNlbmQobnVsbCk7XHJcbiAgICByZXR1cm4gb2JqZWN0SlNPTjtcclxufVxyXG5cclxuICAgIC8vICsrKysrKysrKysrKysrKysrXHJcbiAgICAvLyDQktGA0LXQvNC10L3QvdGL0LUg0YTRg9C90LrRhtC40LhcclxuICAgIC8vICsrKysrKysrKysrKysrKysrXHJcbiAgICBmdW5jdGlvbiBjaGVja1N0b3AoKXtcclxuICAgICAgICB2YXIgZGF0YUFjdGl2ZUNvdW50ID0gMDtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0sIGluZGV4KXtcclxuICAgICAgICAgICAgaWYgKGVsZW0uZGF0YXNldC5zdGF0dXMgPT0ga2V5KXtcclxuICAgICAgICAgICAgICAgIGRhdGFBY3RpdmVDb3VudCA9IGluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9jb25zb2xlLmluZm8oXCLQodGA0LDQstC90LXQvdC40LU6IFwiLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggLSAxLCBkYXRhQWN0aXZlQ291bnQpO1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggLSAxID09IGRhdGFBY3RpdmVDb3VudCl7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lT3V0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyDQntGB0L3QvtCy0L3Ri9C1INGE0YPQvdC60YbQuNC4XHJcblxyXG4gICAgLy8g0KTRg9C90LrRhtC40Y8g0L/RgNC+0LLQtdGA0LrQuCDQt9Cw0L/Rg9GJ0LXQvSDQu9C4INC00YDRg9Cz0L7QuSDRjdC60LfQutC80L3Qu9GP0YAg0LHQuNCx0LvQuNC+0YLQtdC60LhcclxuICAgIC8vINCV0YHQu9C4INC00YDRg9Cz0L7Qs9C+INGN0LrQt9C10LzQv9C70Y/RgNCwINC90LUg0LfQsNC/0YPRidC10L3QviDRgtC+INC30LDQv9GD0YHQutCw0LXRgiDRhNGD0L3QutGG0LjRjiBzdGFydCgpXHJcbiAgICBmdW5jdGlvbiBjaGVjayhzZWxlY3Rvcil7XHJcbiAgICAgICAgaWYoQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLCBmdW5jdGlvbihlbGVtZW50KXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZGF0YXNldC5zdGF0dXMgIT09IHVuZGVmaW5lZDtcclxuICAgICAgICB9KS5sZW5ndGgpe1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLQoNCw0LHQvtGC0LDQtdGCINC00YDRg9Cz0LDRjyDQsdC40LHQu9C40L7RgtC10LrQsCFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHN0YXJ0KHNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g0KTRg9C90LrRhtC40Y8g0L/QtdGA0LXQsdC+0YDQsCDRjdC70LXQvNC10L3RgtC+0LIg0L/QvtC00YXQvtC00Y/RidC40YUg0L/QvtC0INGC0YDQtdCx0L7QstCw0L3QuNGPXHJcbiAgICBmdW5jdGlvbiBzdGFydChzZWxlY3Rvcil7XHJcbiAgICAgICAvLyBjb25zb2xlLmluZm8oJ9GB0YLQsNGA0YIg0LfQsNC/0YHRgtC40LvRgdGPLCDRgdC10LvQtdC60YLQvtGAICcrIHNlbGVjdG9yLCB0aGlzKTtcclxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIGZ1bmN0aW9uKEhUTUxFbGVtZW50KXtcclxuICAgICAgICAgICAgcmV0dXJuIEhUTUxFbGVtZW50LmRhdGFzZXQuc3RhdHVzID09PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSkuZm9yRWFjaChmdW5jdGlvbihIVE1MRWxlbWVudCwgaSwgYXJyYXkpe1xyXG4gICAgICAgICAgLy8gIGNvbnNvbGUubG9nKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudC5kYXRhc2V0LnN0YXR1cyA9IGtleTtcclxuICAgICAgICAgICAgLy9wbGF5ZXJDb25zdHJ1Y3RvcihIVE1MRWxlbWVudCk7XHJcbiAgICAgICAgICAgIG1lZGlhT2JqZWN0ID0gcmVtb3ZlRWxlbWVudFdpdGhvdXREdXJhdGlvbihnZXREdXJhdGlvbihnZXREYXRhKEhUTUxFbGVtZW50KSkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgc3RhcnQoc2VsZWN0b3IpO1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyDQntGB0L3QvtCy0L3Ri9C1INC80LXRgtC+0LTRi1xyXG5cclxuICAgIC8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINCx0LjQsdC70LjQvtGC0LXQutC4INC4INCy0L7Qt9GA0LDRidC10L3QtSDQvNC10LTQuNCw0L7QsdGK0LXQutGC0L7QslxyXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBjaGVjayhzZWxlY3Rvcik7XHJcbiAgICAgICAgLypzdGFydCgpOyovXHJcbiAgICAgICAgcmV0dXJuIG1lZGlhT2JqZWN0O1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXREYXRhKEhUTUxFbGVtZW50KXtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIGVsZW1lbnQuc3JjID0gSFRNTEVsZW1lbnQuZGF0YXNldC5zcmM7XHJcblxyXG4gICAgICAgIGVsZW1lbnQuc3BlYWtlcnMgPSBnZXRPYmplY3RKU09OKFwiaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9cIiArIEhUTUxFbGVtZW50LmRhdGFzZXQuc3JjICsgXCJlbmRwb2ludHMuanNvblwiKTtcclxuICAgICAgICB2YXIgSlNPTk9iamVjdCA9IGdldE9iamVjdEpTT04oXCJodHRwczovL2Nyb3Nzb3JpZ2luLm1lL1wiICsgSFRNTEVsZW1lbnQuZGF0YXNldC5zcmMgKyBcIm1ldGFkYXRhLmpzb25cIik7XHJcblxyXG4gICAgICAgIGVsZW1lbnQuc3BlYWtlcnMuZm9yRWFjaChmdW5jdGlvbihzcGVha2VyKXtcclxuICAgICAgICAgICAgc3BlYWtlci5hdWRpbyA9IEpTT05PYmplY3QuYXVkaW8uZmlsdGVyKGZ1bmN0aW9uKGF1ZGlvKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhdWRpby5lbmRwb2ludElkID09IHNwZWFrZXIuaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzcGVha2VyLnZpZGVvID0gSlNPTk9iamVjdC52aWRlby5maWx0ZXIoZnVuY3Rpb24odmlkZW8pe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZGVvLmVuZHBvaW50SWQgPT0gc3BlYWtlci5pZCAmJiB2aWRlby50eXBlID09IFwiUkVDT1JESU5HX1NUQVJURURcIjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHNwZWFrZXIuY2hhbmdlID0gSlNPTk9iamVjdC52aWRlby5maWx0ZXIoZnVuY3Rpb24odmlkZW8pe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZGVvLmVuZHBvaW50SWQgPT0gc3BlYWtlci5pZCAmJiB2aWRlby50eXBlID09IFwiU1BFQUtFUl9DSEFOR0VEXCI7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzcGVha2VyLmF1ZGlvRHVyYXRpb24gPSAwO1xyXG4gICAgICAgICAgICBzcGVha2VyLnZpZGVvRHVyYXRpb24gPSAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldER1cmF0aW9uKG9iamVjdCl7XHJcbiAgICAgICAgb2JqZWN0LnNwZWFrZXJzLmZvckVhY2goZnVuY3Rpb24oc3BlYWtlcil7XHJcbiAgICAgICAgICAgIHNwZWFrZXIudmlkZW8uZm9yRWFjaChmdW5jdGlvbih2aWRlbyl7XHJcbiAgICAgICAgICAgICAgICB2aWRlby5odG1sID0gY3JlYXRlTWVkaWFFbGVtZW50KFwidmlkZW9cIix2aWRlby5maWxlbmFtZSwgb2JqZWN0LnNyYywgXCJ2aWRlby93ZWJtXCIpO1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0LmFwcGVuZENoaWxkKHZpZGVvLmh0bWwpO1xyXG4gICAgICAgICAgICAgICAgYWRkRWxlbWVudEFmdGVyTG9hZER1cmF0aW9uKG9iamVjdCwgdmlkZW8pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzcGVha2VyLmF1ZGlvLmZvckVhY2goZnVuY3Rpb24oYXVkaW8pe1xyXG4gICAgICAgICAgICAgICAgYXVkaW8uaHRtbCA9IGNyZWF0ZU1lZGlhRWxlbWVudChcImF1ZGlvXCIsYXVkaW8uZmlsZW5hbWUsIG9iamVjdC5zcmMsIFwiYXVkaW8vbXAzXCIpO1xyXG4gICAgICAgICAgICAgICAgb2JqZWN0LmFwcGVuZENoaWxkKGF1ZGlvLmh0bWwpO1xyXG4gICAgICAgICAgICAgICAgYWRkRWxlbWVudEFmdGVyTG9hZER1cmF0aW9uKG9iamVjdCwgYXVkaW8pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZEVsZW1lbnRBZnRlckxvYWREdXJhdGlvbihvYmplY3QsIG9iamVjdEVsZW1lbnQpe1xyXG4gICAgICAgIG9iamVjdEVsZW1lbnQuaHRtbC5hZGRFdmVudExpc3RlbmVyKFwibG9hZGVkbWV0YWRhdGFcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgb2JqZWN0RWxlbWVudC5kdXJhdGlvbiA9IHRoaXMuZHVyYXRpb247XHJcbiAgICAgICAgICAgIG9iamVjdEVsZW1lbnQudGltZWxpbmVIdG1sID0gY3JlYXRlRWxlbWVudChcImRpdlwiLGZhbHNlICxmYWxzZSwgZmFsc2UsZmFsc2UpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkXCIsIG9iamVjdEVsZW1lbnQpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIC8vb2JqZWN0LmFwcGVuZENoaWxkKG9iamVjdEVsZW1lbnQuaHRtbCk7XHJcbiAgICAgICAgICAgIHRpbWVsaW5lQ29uc3RydWN0b3IzKG9iamVjdCwgb2JqZWN0RWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlRWxlbWVudFdpdGhvdXREdXJhdGlvbihvYmplY3Qpe1xyXG4gICAgICAgIG9iamVjdC5zcGVha2Vycy5mb3JFYWNoKGZ1bmN0aW9uKHNwZWFrZXIpe1xyXG4gICAgICAgICAgICBzcGVha2VyLnZpZGVvLmZvckVhY2goZnVuY3Rpb24odmlkZW8pe1xyXG4gICAgICAgICAgICAgICAgaWYoIXZpZGVvLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVcIiwgdmlkZW8pO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmh0bWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh2aWRlby5odG1sKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHNwZWFrZXIuYXVkaW8uZm9yRWFjaChmdW5jdGlvbihhdWRpbyl7XHJcbiAgICAgICAgICAgICAgICBpZighYXVkaW8uZHVyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZVwiLCBhdWRpbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXVkaW8uaHRtbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGF1ZGlvLmh0bWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHRpbWVsaW5lQ29uc3RydWN0b3IzKG9iamVjdCwgb2JqZWN0RWxlbWVudCl7XHJcblxyXG4gICAgICAgIGlmKCFvYmplY3QucXVlcnlTZWxlY3RvcihcIi50aW1lbGluZVwiKSkge3ZhciB0aW1lbGluZSA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBvYmplY3QuYXBwZW5kQ2hpbGQodGltZWxpbmUpfTtcclxuICAgICAgICB2YXIgdGltZWxpbmUgPSBvYmplY3QucXVlcnlTZWxlY3RvcihcIi50aW1lbGluZVwiKVxyXG5cclxuICAgICAgICB2YXIgYXJyID0gb2JqZWN0LnNwZWFrZXJzLmZpbHRlcihmdW5jdGlvbihzcGVha2VyKXtcclxuICAgICAgICAgICAgcmV0dXJuIHNwZWFrZXIuaWQgPT0gb2JqZWN0RWxlbWVudC5lbmRwb2ludElkXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHggPSBhcnJbMF1bb2JqZWN0RWxlbWVudC5tZWRpYVR5cGVdLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZHVyYXRpb25cclxuICAgICAgICB9KVxyXG4gICAgICAgIGFyclswXVtvYmplY3RFbGVtZW50Lm1lZGlhVHlwZStcIkR1cmF0aW9uXCJdID0gKHhbeC5sZW5ndGggLSAxXS5pbnN0YW50IC0geFswXS5pbnN0YW50KS8xMDAwICsgeFt4Lmxlbmd0aCAtIDFdLmR1cmF0aW9uO1xyXG4gICAgICAgIGlmICghdGltZWxpbmUucXVlcnlTZWxlY3RvcihcIiNzcGVha2VyX1wiK29iamVjdEVsZW1lbnQuZW5kcG9pbnRJZCkpe1xyXG4gICAgICAgICAgICB2YXIgbGluZSA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgXCJzcGVha2VyX1wiK29iamVjdEVsZW1lbnQuZW5kcG9pbnRJZCwgXCJpdGVtLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRpbWVsaW5lLmFwcGVuZENoaWxkKGxpbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbGluZSA9IHRpbWVsaW5lLnF1ZXJ5U2VsZWN0b3IoXCIjc3BlYWtlcl9cIitvYmplY3RFbGVtZW50LmVuZHBvaW50SWQpO1xyXG5cclxuICAgICAgICBpZighbGluZS5xdWVyeVNlbGVjdG9yKFwiLnZpZGVvLXRpbWVsaW5lXCIpKXtcclxuICAgICAgICAgICAgdmFyIHZpZGVvTGluZSA9ICBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInZpZGVvLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGxpbmUuYXBwZW5kQ2hpbGQodmlkZW9MaW5lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZpZGVvTGluZSA9IGxpbmUucXVlcnlTZWxlY3RvcihcIi52aWRlby10aW1lbGluZVwiKVxyXG4gICAgICAgICAgICBpZighbGluZS5xdWVyeVNlbGVjdG9yKFwiLmF1ZGlvLXRpbWVsaW5lXCIpKXtcclxuICAgICAgICAgICAgICAgIHZhciBhdWRpb0xpbmUgPSAgY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJhdWRpby10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgbGluZS5hcHBlbmRDaGlsZChhdWRpb0xpbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYXVkaW9MaW5lID0gbGluZS5xdWVyeVNlbGVjdG9yKFwiLmF1ZGlvLXRpbWVsaW5lXCIpXHJcblxyXG5cclxuICAgICAgICAvL2NvbnNvbGUuaW5mbyh4WzBdW29iamVjdEVsZW1lbnQubWVkaWFUeXBlXSk7XHJcbiAgICAgICAgY29uc29sZS5pbmZvKG9iamVjdC5zcGVha2Vycyk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHRpbWVsaW5lQ29uc3RydWN0b3IyKG9iamVjdCl7XHJcblxyXG4gICAgICAgIG9iamVjdC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgICAgICB2YXIgdGltZWxpbmUgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgb2JqZWN0LmFwcGVuZENoaWxkKHRpbWVsaW5lKTtcclxuXHJcbiAgICAgICAgb2JqZWN0LnNwZWFrZXJzLmZvckVhY2goZnVuY3Rpb24oc3BlYWtlcil7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIHZhciBsaW5lID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBcInNwZWFrZXJcIitzcGVha2VyLmlkLCBcIml0ZW0tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgdmFyIHZpZGVvTGluZSA9ICBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInZpZGVvLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHZhciBhdWRpb0xpbmUgPSAgY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJhdWRpby10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICBsaW5lLmFwcGVuZENoaWxkcmVuKHZpZGVvTGluZSwgYXVkaW9MaW5lKTtcclxuICAgICAgICAgICAgdGltZWxpbmUuYXBwZW5kQ2hpbGQobGluZSk7XHJcblxyXG4gICAgICAgICAgICBzcGVha2VyLnZpZGVvLmZvckVhY2goZnVuY3Rpb24odmlkZW8pe1xyXG4gICAgICAgICAgICAgICAgaWYodmlkZW8uZHVyYXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lTGluZUJsb2NrID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJ2aWRlby1ibG9jay10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvTGluZS5hcHBlbmRDaGlsZCh0aW1lTGluZUJsb2NrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzcGVha2VyLmF1ZGlvLmZvckVhY2goZnVuY3Rpb24oYXVkaW8pe1xyXG4gICAgICAgICAgICAgICAgaWYoYXVkaW8uZHVyYXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lTGluZUJsb2NrID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJhdWRpby1ibG9jay10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvTGluZS5hcHBlbmRDaGlsZCh0aW1lTGluZUJsb2NrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0aW1lbGluZUNvbnN0cnVjdG9yKG9iamVjdCwgb2JqZWN0RWxlbWVudCl7XHJcblxyXG5cclxuICAgICAgICB2YXIgbGluZSA9IG9iamVjdC5xdWVyeVNlbGVjdG9yKFwiLnRpbWVsaW5lXCIpLnF1ZXJ5U2VsZWN0b3IoXCIjc3BlYWtlclwiICsgb2JqZWN0RWxlbWVudC5lbmRwb2ludElkKTtcclxuICAgICAgICBpZihsaW5lKXtcclxuICAgICAgICAgICAgaWYob2JqZWN0RWxlbWVudC5tZWRpYVR5cGUgPT0gXCJ2aWRlb1wiKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZUxpbmVCbG9jayA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidmlkZW8tYmxvY2stdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBsaW5lLnF1ZXJ5U2VsZWN0b3IoXCIudmlkZW8tdGltZWxpbmVcIikuYXBwZW5kQ2hpbGQodGltZUxpbmVCbG9jayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZUxpbmVCbG9jayA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiYXVkaW8tYmxvY2stdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBsaW5lLnF1ZXJ5U2VsZWN0b3IoXCIuYXVkaW8tdGltZWxpbmVcIikuYXBwZW5kQ2hpbGQodGltZUxpbmVCbG9jayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdmFyIG5ld1RpbWVsaW5lID0gIGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgXCJzcGVha2VyXCIgKyBvYmplY3RFbGVtZW50LmVuZHBvaW50SWQsIFwiaXRlbS10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB2YXIgdmlkZW9MaW5lID0gIGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwidmlkZW8tdGltZWxpbmVcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgdmFyIGF1ZGlvTGluZSA9ICBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImF1ZGlvLXRpbWVsaW5lXCIsIGZhbHNlLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICBpZihvYmplY3RFbGVtZW50Lm1lZGlhVHlwZSA9PSBcInZpZGVvXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lTGluZUJsb2NrID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJ2aWRlby1ibG9jay10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvTGluZS5hcHBlbmRDaGlsZCh0aW1lTGluZUJsb2NrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lTGluZUJsb2NrID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJhdWRpby1ibG9jay10aW1lbGluZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvTGluZS5hcHBlbmRDaGlsZCh0aW1lTGluZUJsb2NrKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbmV3VGltZWxpbmUuYXBwZW5kQ2hpbGRyZW4odmlkZW9MaW5lLCBhdWRpb0xpbmUpO1xyXG4gICAgICAgICAgICBvYmplY3QucXVlcnlTZWxlY3RvcihcIi50aW1lbGluZVwiKS5hcHBlbmRDaGlsZChuZXdUaW1lbGluZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBsYXllckNvbnN0cnVjdG9yKEhUTUxFbGVtZW50KXtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB7fTtcclxuICAgICAgICBlbGVtZW50Lmh0bWwgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICBlbGVtZW50Lm1lZGlhID0gW107XHJcbiAgICAgICAgZWxlbWVudC51c2VycyA9IFtdO1xyXG4gICAgICAgIGVsZW1lbnQuc3BlYWtlckNoYW5nZSA9IFtdO1xyXG5cclxuICAgICAgICBtZWRpYU9iamVjdC5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBKU09OT2JqZWN0ID0gZ2V0T2JqZWN0SlNPTihcImh0dHBzOi8vY3Jvc3NvcmlnaW4ubWUvXCIgKyBlbGVtZW50Lmh0bWwuZGF0YXNldC5zcmMgKyBcIm1ldGFkYXRhLmpzb25cIik7XHJcbiAgICAgICAgdmFyIG1lZGlhID0gSlNPTk9iamVjdC52aWRlby5jb25jYXQoSlNPTk9iamVjdC5hdWRpbyk7XHJcblxyXG5cclxuICAgICAgICBtZWRpYS5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgaWYoZWwuZmlsZW5hbWUgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBpZighZWxlbWVudC51c2Vycy5pbmNsdWRlcyhlbC5lbmRwb2ludElkKSkgZWxlbWVudC51c2Vycy5wdXNoKGVsLmVuZHBvaW50SWQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lZGlhRWxlbWVudCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50LnRhZ05hbWUgPSBlbC5tZWRpYVR5cGU7XHJcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuZmlsZW5hbWUgPSBlbC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5zcmMgPSBlbGVtZW50Lmh0bWwuZGF0YXNldC5zcmM7XHJcbiAgICAgICAgICAgICAgICBpZihlbC5tZWRpYVR5cGUgPT0gXCJhdWRpb1wiKSBtZWRpYUVsZW1lbnQudHlwZSA9IFwiYXVkaW8vbXAzXCI7XHJcbiAgICAgICAgICAgICAgICBpZihlbC5tZWRpYVR5cGUgPT0gXCJ2aWRlb1wiKSBtZWRpYUVsZW1lbnQudHlwZSA9IFwidmlkZW8vd2VibVwiO1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50LnVzZXIgPSBlbC5lbmRwb2ludElkO1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50Lmluc3RhbnQgPSBlbC5pbnN0YW50O1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tZWRpYS5wdXNoKG1lZGlhRWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3BlYWtlckNoYW5nZS5wdXNoKGVsKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBlbGVtZW50Lmh0bWwuYXBwZW5kQ2hpbGQoY3JlYXRlUGxheWVyKGVsZW1lbnQpKTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlUGxheWVyKGVsKXtcclxuICAgICAgICB2YXIgdXNlcnMgPSB7fTtcclxuICAgICAgICBlbC50aW1lbGluZXMgPSB7fTtcclxuXHJcbiAgICAgICAgdmFyIGJsb2NrTWVkaWEgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInBsYXllclwiLCBmYWxzZSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB2YXIgdmlkZW8gPSBjcmVhdGVFbGVtZW50KFwidmlkZW9cIiwgZmFsc2UsIFwidmlkZW9Nb29ucmFpblBsYXllclwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IDA7XHJcbiAgICAgICAgdmlkZW8uZmlyc3QgPSAwO1xyXG4gICAgICAgIHZhciBzb3VyY2VWaWRlbyA9IGNyZWF0ZUVsZW1lbnQoXCJzb3VyY2VcIiwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIHZpZGVvLmFwcGVuZENoaWxkKHNvdXJjZVZpZGVvKTtcclxuXHJcbiAgICAgICAgdmFyIGF1ZGlvID0gY3JlYXRlRWxlbWVudChcImF1ZGlvXCIsIGZhbHNlLCBcImF1ZGlvTW9vbnJhaW5QbGF5ZXJcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBhdWRpby5jdXJyZW50RHVyYXRpb24gPSAwO1xyXG4gICAgICAgIGF1ZGlvLmZpcnN0ID0gMDtcclxuICAgICAgICB2YXIgc291cmNlQXVkaW8gPSBjcmVhdGVFbGVtZW50KFwic291cmNlXCIsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBhdWRpby5hcHBlbmRDaGlsZChzb3VyY2VBdWRpbyk7XHJcblxyXG4gICAgICAgIHZhciBibG9ja0NvbnRyb2xzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJib3R0b21cIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB2YXIgcHJvZ3Jlc3MgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzXCIsIGZhbHNlLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIHVzZXIgaW4gZWwudXNlcnMpe1xyXG4gICAgICAgICAgICB2YXIgdGltZWxpbmUgPSB7fTtcclxuICAgICAgICAgICAgdGltZWxpbmUuYm9keSA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aW1lbGluZS52aWRlbyA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwicHJvZ3Jlc3MtdmlkZW9cIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzLXZpZXdlZFwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aW1lbGluZS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QuYWRkKFwicHJvZ3Jlc3MtaW5hY3RpdmVcIik7XHJcbiAgICAgICAgICAgIHRpbWVsaW5lLnZpZGVvLmFwcGVuZENoaWxkKHRpbWVsaW5lLnByb2dyZXNzVmlld2VkKTtcclxuICAgICAgICAgICAgdGltZWxpbmUuYXVkaW8gPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzLWF1ZGlvXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRpbWVsaW5lLmJvZHkuYXBwZW5kQ2hpbGRyZW4odGltZWxpbmUudmlkZW8sIHRpbWVsaW5lLmF1ZGlvKTtcclxuICAgICAgICAgICAgcHJvZ3Jlc3MuYXBwZW5kQ2hpbGQodGltZWxpbmUuYm9keSk7XHJcbiAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tlbC51c2Vyc1t1c2VyXV0gPSB0aW1lbGluZTtcclxuICAgICAgICAgICAgaWYodXNlciA9PSAwKSB7dGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LmFkZChcInByb2dyZXNzLWFjdGl2ZVwiKTt0aW1lbGluZS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QucmVtb3ZlKFwicHJvZ3Jlc3MtaW5hY3RpdmVcIik7fVxyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICB2YXIgc2NydWJiZXIgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInNjcnViYmVyXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgc2NydWJiZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzY3J1YmJlci1jaXJjbGVcIj48L2Rpdj4nO1xyXG4gICAgICAgIHByb2dyZXNzLmFwcGVuZENoaWxkKHNjcnViYmVyKTtcclxuXHJcbiAgICAgICAgc2NydWJiZXIub25kcmFnc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjb250cm9scyA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbHNcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB2YXIgbGVmdENvbnRyb2xzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9scy1sZWZ0XCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdmFyIHJpZ2h0Q29udHJvbHMgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2xzLXJpZ2h0XCIsIGZhbHNlLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHZhciBidXR0b25QbGF5UGF1c2UgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtYnV0dG9uXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgYnV0dG9uUGxheVBhdXNlLmNsYXNzTGlzdC5hZGQoXCJwbGF5LXBhdXNlXCIpO1xyXG5cclxuICAgICAgICBidXR0b25QbGF5UGF1c2UuaW5uZXJIVE1MID0gJzxzdmcgY2xhc3M9XCJwbGF5LWltYWdlIGFjdGl2ZVwiIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGQ9XCJNIDEyLDI2IDE4LjUsMjIgMTguNSwxNCAxMiwxMCB6IE0gMTguNSwyMiAyNSwxOCAyNSwxOCAxOC41LDE0IHpcIj48L3BhdGg+PC9zdmc+PHN2ZyBjbGFzcz1cInBhdXNlLWltYWdlXCIgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgd2lkdGg9XCIxMDAlXCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIk0gMTIsMjYgMTYsMjYgMTYsMTAgMTIsMTAgeiBNIDIxLDI2IDI1LDI2IDI1LDEwIDIxLDEwIHpcIj48L3BhdGg+PC9zdmc+JztcclxuXHJcblxyXG4gICAgICAgIGJ1dHRvblBsYXlQYXVzZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIucGxheS1pbWFnZVwiKS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnBhdXNlLWltYWdlXCIpLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgaWYodmlkZW8ucGF1c2VkKXtcclxuICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLnBsYXkoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB2aWRlby5wYXVzZSgpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgLyogdmFyIGJ1dHRvblN0b3AgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCAgXCJjb250cm9sLWJ1dHRvblwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIGJ1dHRvblN0b3AuaW5uZXJIVE1MID0gJyc7Ki9cclxuXHJcbiAgICAgICAgdmFyIGJ1dHRvblByZXYgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtYnV0dG9uXCIsIGZhbHNlLCAge2hpZGRlbjogXCJoaWRkZW5cIn0pO1xyXG4gICAgICAgIGJ1dHRvblByZXYuaW5uZXJIVE1MID0gJzxzdmcgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgd2lkdGg9XCIxMDAlXCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIm0gMTIsMTIgaCAyIHYgMTIgaCAtMiB6IG0gMy41LDYgOC41LDYgViAxMiB6XCI+PC9wYXRoPjwvc3ZnPic7XHJcblxyXG4gICAgICAgIHZhciBidXR0b25OZXh0ID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLWJ1dHRvblwiLCBmYWxzZSwge2hpZGRlbjogXCJoaWRkZW5cIn0pO1xyXG4gICAgICAgIGJ1dHRvbk5leHQuaW5uZXJIVE1MID0gJzxzdmcgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgd2lkdGg9XCIxMDAlXCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIk0gMTIsMjQgMjAuNSwxOCAxMiwxMiBWIDI0IHogTSAyMiwxMiB2IDEyIGggMiBWIDEyIGggLTIgelwiPjwvcGF0aD48L3N2Zz4nO1xyXG5cclxuICAgICAgICB2YXIgYnV0dG9uVm9sdW1lID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLXZvbHVtZVwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIGJ1dHRvblZvbHVtZS5pbm5lckhUTUwgPSAnPHN2ZyBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgMzYgMzZcIj48cGF0aCBmaWxsPVwid2hpdGVcIiBkPVwiTTgsMjEgTDEyLDIxIEwxNywyNiBMMTcsMTAgTDEyLDE1IEw4LDE1IEw4LDIxIFogTTE5LDE0IEwxOSwyMiBDMjAuNDgsMjEuMzIgMjEuNSwxOS43NyAyMS41LDE4IEMyMS41LDE2LjI2IDIwLjQ4LDE0Ljc0IDE5LDE0IFogTTE5LDExLjI5IEMyMS44OSwxMi4xNSAyNCwxNC44MyAyNCwxOCBDMjQsMjEuMTcgMjEuODksMjMuODUgMTksMjQuNzEgTDE5LDI2Ljc3IEMyMy4wMSwyNS44NiAyNiwyMi4yOCAyNiwxOCBDMjYsMTMuNzIgMjMuMDEsMTAuMTQgMTksOS4yMyBMMTksMTEuMjkgWlwiPjwvcGF0aD48L3N2Zz4nO1xyXG5cclxuICAgICAgICBidXR0b25Wb2x1bWVJbnB1dCA9IGNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCBmYWxzZSwgXCJ2b2x1bWUtdmFsdWVcIiwgZmFsc2UsIHt0eXBlOiBcInJhbmdlXCIsIG1pbjogXCIwXCIsIG1heDogXCIxXCIsIHN0ZXA6IFwiMC4wMVwifSk7XHJcbiAgICAgICAgYnV0dG9uVm9sdW1lLmFwcGVuZENoaWxkKGJ1dHRvblZvbHVtZUlucHV0KTtcclxuXHJcbiAgICAgICAgdmFyIHRpbWVyID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLXRpbWVyXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdGltZXIuaW5uZXJIVE1MID0gJzxzcGFuPjIzOjEyPC9zcGFuPiA8c3Bhbj4vPC9zcGFuPiA8c3Bhbj4xMDo1NjowMjwvc3Bhbj4nO1xyXG5cclxuICAgICAgICB2YXIgYnV0dG9uU2V0dGluZ3MgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtc2V0dGluZ3NcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBidXR0b25TZXR0aW5ncy5pbm5lckhUTUwgPSAnPHN2ZyBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgMzYgMzZcIj48cGF0aCBkPVwibSAyMy45NCwxOC43OCBjIC4wMywtMC4yNSAuMDUsLTAuNTEgLjA1LC0wLjc4IDAsLTAuMjcgLTAuMDIsLTAuNTIgLTAuMDUsLTAuNzggbCAxLjY4LC0xLjMyIGMgLjE1LC0wLjEyIC4xOSwtMC4zMyAuMDksLTAuNTEgbCAtMS42LC0yLjc2IGMgLTAuMDksLTAuMTcgLTAuMzEsLTAuMjQgLTAuNDgsLTAuMTcgbCAtMS45OSwuOCBjIC0wLjQxLC0wLjMyIC0wLjg2LC0wLjU4IC0xLjM1LC0wLjc4IGwgLTAuMzAsLTIuMTIgYyAtMC4wMiwtMC4xOSAtMC4xOSwtMC4zMyAtMC4zOSwtMC4zMyBsIC0zLjIsMCBjIC0wLjIsMCAtMC4zNiwuMTQgLTAuMzksLjMzIGwgLTAuMzAsMi4xMiBjIC0wLjQ4LC4yIC0wLjkzLC40NyAtMS4zNSwuNzggbCAtMS45OSwtMC44IGMgLTAuMTgsLTAuMDcgLTAuMzksMCAtMC40OCwuMTcgbCAtMS42LDIuNzYgYyAtMC4xMCwuMTcgLTAuMDUsLjM5IC4wOSwuNTEgbCAxLjY4LDEuMzIgYyAtMC4wMywuMjUgLTAuMDUsLjUyIC0wLjA1LC43OCAwLC4yNiAuMDIsLjUyIC4wNSwuNzggbCAtMS42OCwxLjMyIGMgLTAuMTUsLjEyIC0wLjE5LC4zMyAtMC4wOSwuNTEgbCAxLjYsMi43NiBjIC4wOSwuMTcgLjMxLC4yNCAuNDgsLjE3IGwgMS45OSwtMC44IGMgLjQxLC4zMiAuODYsLjU4IDEuMzUsLjc4IGwgLjMwLDIuMTIgYyAuMDIsLjE5IC4xOSwuMzMgLjM5LC4zMyBsIDMuMiwwIGMgLjIsMCAuMzYsLTAuMTQgLjM5LC0wLjMzIGwgLjMwLC0yLjEyIGMgLjQ4LC0wLjIgLjkzLC0wLjQ3IDEuMzUsLTAuNzggbCAxLjk5LC44IGMgLjE4LC4wNyAuMzksMCAuNDgsLTAuMTcgbCAxLjYsLTIuNzYgYyAuMDksLTAuMTcgLjA1LC0wLjM5IC0wLjA5LC0wLjUxIGwgLTEuNjgsLTEuMzIgMCwwIHogbSAtNS45NCwyLjAxIGMgLTEuNTQsMCAtMi44LC0xLjI1IC0yLjgsLTIuOCAwLC0xLjU0IDEuMjUsLTIuOCAyLjgsLTIuOCAxLjU0LDAgMi44LDEuMjUgMi44LDIuOCAwLDEuNTQgLTEuMjUsMi44IC0yLjgsMi44IGwgMCwwIHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz4nO1xyXG5cclxuICAgICAgICB2YXIgYnV0dG9uRnVsbHNjcmVlbiA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbC1idXR0b25cIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBidXR0b25GdWxsc2NyZWVuLmlubmVySFRNTCA9ICc8c3ZnIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIm0gMTAsMTYgMiwwIDAsLTQgNCwwIDAsLTIgTCAxMCwxMCBsIDAsNiAwLDAgelwiPjwvcGF0aD48L2c+PGc+PHBhdGggZmlsbD1cIndoaXRlXCIgY2xhc3M9XCJ5dHAtc3ZnLWZpbGxcIiBkPVwibSAyMCwxMCAwLDIgNCwwIDAsNCAyLDAgTCAyNiwxMCBsIC02LDAgMCwwIHpcIj48L3BhdGg+PC9nPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIm0gMjQsMjQgLTQsMCAwLDIgTCAyNiwyNiBsIDAsLTYgLTIsMCAwLDQgMCwwIHpcIj48L3BhdGg+PC9nPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIk0gMTIsMjAgMTAsMjAgMTAsMjYgbCA2LDAgMCwtMiAtNCwwIDAsLTQgMCwwIHpcIj48L3BhdGg+PC9nPjwvc3ZnPic7XHJcblxyXG4gICAgICAgIGxlZnRDb250cm9scy5hcHBlbmRDaGlsZHJlbihidXR0b25QbGF5UGF1c2UsIC8qYnV0dG9uU3RvcCwqLyBidXR0b25QcmV2LCBidXR0b25OZXh0LCBidXR0b25Wb2x1bWUsIHRpbWVyKTtcclxuICAgICAgICByaWdodENvbnRyb2xzLmFwcGVuZENoaWxkcmVuKGJ1dHRvblNldHRpbmdzLCBidXR0b25GdWxsc2NyZWVuKTtcclxuXHJcbiAgICAgICAgY29udHJvbHMuYXBwZW5kQ2hpbGRyZW4obGVmdENvbnRyb2xzLCByaWdodENvbnRyb2xzKTtcclxuICAgICAgICBibG9ja0NvbnRyb2xzLmFwcGVuZENoaWxkcmVuKHByb2dyZXNzLCBjb250cm9scyk7XHJcblxyXG4gICAgICAgIHZhciBibG9ja0hpZGUgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImhpZGUtdmlkZW9zXCIsIGZhbHNlLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGVsLnVzZXJzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpe1xyXG4gICAgICAgICAgICB1c2Vyc1tlbGVtZW50XSA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIGVsZW1lbnQsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGJsb2NrSGlkZS5hcHBlbmRDaGlsZCh1c2Vyc1tlbGVtZW50XSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBlbC5tZWRpYS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KXtcclxuICAgICAgICAgICAgdmFyIEhUTUxFbGVtZW50ID0gY3JlYXRlTWVkaWFFbGVtZW50KGVsZW1lbnQudGFnTmFtZSwgZWxlbWVudC5maWxlbmFtZSwgZWxlbWVudC5zcmMsIGVsZW1lbnQudHlwZSk7XHJcbiAgICAgICAgICAgIGJsb2NrSGlkZS5hcHBlbmRDaGlsZChIVE1MRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICBIVE1MRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZGVkbWV0YWRhdGFcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHVzZXJzW2VsZW1lbnQudXNlcl0uYXBwZW5kQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50LnRhZ05hbWUsIGluZGV4LCBlbGVtZW50LnVzZXIsIGVsZW1lbnQuaW5zdGFudCwgSFRNTEVsZW1lbnQuZHVyYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5kdXJhdGlvbiA9IEhUTUxFbGVtZW50LmR1cmF0aW9uO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQudGFnTmFtZSA9PSBcInZpZGVvXCIpe1xyXG4gICAgICAgICAgICAgICAgaWYodmlkZW8uZmlyc3QgPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uZmlyc3QgPSBlbGVtZW50Lmluc3RhbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZpZGVvLmZpcnN0ID4gZWxlbWVudC5pbnN0YW50KXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJ2aWRlby5zcmNcIiwgdmlkZW8uc3JjLCBlbGVtZW50Lmluc3RhbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihlbGVtZW50LnRhZ05hbWUgPT0gXCJhdWRpb1wiKXtcclxuICAgICAgICAgICAgICAgIGlmKGF1ZGlvLmZpcnN0ID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLmZpcnN0ID0gZWxlbWVudC5pbnN0YW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBhdWRpby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGF1ZGlvLmZpcnN0ID4gZWxlbWVudC5pbnN0YW50KXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJhdWRpby5zcmNcIiwgYXVkaW8uc3JjLCBlbGVtZW50Lmluc3RhbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBhdWRpby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICBlbC50aW1lbGluZXNbZWxlbWVudC51c2VyXS5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGlmKGVsZW1lbnQudGFnTmFtZSA9PSBcInZpZGVvXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHZpZGVvLnNyYyAhPT0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHZpZGVvLnBhdXNlZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWRlby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWRlby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihlbGVtZW50LnRhZ05hbWUgPT0gXCJhdWRpb1wiKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihhdWRpby5zcmMgIT09IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGF1ZGlvLnBhdXNlZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgYmxvY2tNZWRpYS5hcHBlbmRDaGlsZHJlbih2aWRlbywgYXVkaW8sIGJsb2NrQ29udHJvbHMsIGJsb2NrSGlkZSk7XHJcblxyXG5cclxuICAgICAgICAvL9Cf0L7RgdGC0L7Rj9C90L3QvtC1INC+0YLRgdC70LXQttC40LLQsNC90LXQvdC40LUg0YHQvtGB0YLQvtGP0L3QuNC5INCy0LjQtNC10L4g0Lgg0LDRg9C00LjQviAocGxheSDQuNC70LggcGF1c2UpXHJcbiAgICAgICAgLypcclxuICAgICAgICAoZnVuY3Rpb24gdGltZSgpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInZpZGVvLnBhdXNlZDogXCIsIHZpZGVvLnBhdXNlZCk7XHJcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImF1ZGlvLnBhdXNlZDogXCIsIGF1ZGlvLnBhdXNlZCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIHRpbWUgLCAxMDAwKTtcclxuXHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICAqL1xyXG5cclxuXHJcbiAgICAgICAgLy8rKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK1xyXG5cclxuICAgICAgICB2YXIgbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJwb2ludGVyXCI7XHJcbiAgICAgICAgICAgIHZhciBtb3VzZVg7XHJcbiAgICAgICAgICAgIChlLmNsaWVudFggLSAxOSA8IDApID8gbW91c2VYID0gMDogKGUuY2xpZW50WCAtIDE5ID4gODMwKSA/IG1vdXNlWCA9IDgzMDogbW91c2VYID0gZS5jbGllbnRYIC0gMTk7XHJcblxyXG4gICAgICAgICAgICBzY3J1YmJlci5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVgoXCIgKyBtb3VzZVggKyBcInB4KVwiO1xyXG5cclxuICAgICAgICAgICAgZm9yKHZhciBuYW1lIGluIGVsLnRpbWVsaW5lcyl7XHJcbiAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbbmFtZV0ucHJvZ3Jlc3NWaWV3ZWQuc3R5bGUud2lkdGggPSBtb3VzZVggKyBcInB4XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ2aWRlby5jdXJyZW50VGltZVwiLCB2aWRlby5jdXJyZW50RHVyYXRpb24gKiAobW91c2VYLzgzMCkpO1xyXG4gICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYXVkaW8uY3VycmVudFRpbWVcIiwgYXVkaW8uY3VycmVudER1cmF0aW9uICogKG1vdXNlWC84MzApKTtcclxuXHJcbiAgICAgICAgICAgIHZpZGVvLmN1cnJlbnRUaW1lID0gYXVkaW8uY3VycmVudER1cmF0aW9uICogKG1vdXNlWCAvIDgzMCk7XHJcbiAgICAgICAgICAgIGF1ZGlvLmN1cnJlbnRUaW1lID0gYXVkaW8uY3VycmVudER1cmF0aW9uICogKG1vdXNlWCAvIDgzMCk7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwidGltZXVwZGF0ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBuYW1lIGluIGVsLnRpbWVsaW5lcyl7XHJcbiAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbbmFtZV0ucHJvZ3Jlc3NWaWV3ZWQuc3R5bGUud2lkdGggPSAodmlkZW8uY3VycmVudFRpbWUgLyB2aWRlby5jdXJyZW50RHVyYXRpb24pICogODMwICArIFwicHhcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NydWJiZXIuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVYKFwiICsgKHZpZGVvLmN1cnJlbnRUaW1lIC8gdmlkZW8uY3VycmVudER1cmF0aW9uKSAqIDgzMCArIFwicHgpXCI7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwib25zZWVrZWRcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBhbGVydChcIlNlZWsgb3BlcmF0aW9uIGNvbXBsZXRlZCFcIik7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBwcm9ncmVzcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIG1vdmVMaXN0ZW5lcihlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZUxpc3RlbmVyLCAgZmFsc2UpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcblxyXG4gICAgICAgIHNjcnViYmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgbW92ZUxpc3RlbmVyKGUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlTGlzdGVuZXIsICBmYWxzZSk7XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBcImF1dG9cIjtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZUxpc3RlbmVyLCAgZmFsc2UpO1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiVVAhXCIpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcblxyXG4gICAgICAgIGJ1dHRvblZvbHVtZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBhdWRpby52b2x1bWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhdWRpby52b2x1bWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgYnV0dG9uRnVsbHNjcmVlbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPSyFcIiwgdmlkZW8pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgZm9yKHZhciBuYW1lIGluIGVsLnRpbWVsaW5lcyl7XHJcbiAgICAgICAgICAgIChmdW5jdGlvbihuYW1lKXtcclxuICAgICAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tuYW1lXS52aWRlby5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpID0gW10uc2xpY2UuY2FsbChwcm9ncmVzcy5jaGlsZE5vZGVzKS5pbmRleE9mKGVsLnRpbWVsaW5lc1tuYW1lXS5ib2R5KTtcclxuICAgICAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbbmFtZV0ucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LnJlbW92ZShcInByb2dyZXNzLWluYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLnRpbWVsaW5lc1tuYW1lXS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QuYWRkKFwicHJvZ3Jlc3MtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgYW5vdGhlcm5hbWUgaW4gZWwudGltZWxpbmVzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYW5vdGhlcm5hbWUgIT09bmFtZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbYW5vdGhlcm5hbWVdLnByb2dyZXNzVmlld2VkLmNsYXNzTGlzdC5yZW1vdmUoXCJwcm9ncmVzcy1hY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbYW5vdGhlcm5hbWVdLnByb2dyZXNzVmlld2VkLmNsYXNzTGlzdC5hZGQoXCJwcm9ncmVzcy1pbmFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzcy5xdWVyeVNlbGVjdG9yKFwiLnNjcnViYmVyLWNpcmNsZVwiKS5zdHlsZS50b3AgPSBpICogMTQgLSAyICsgXCJweFwiO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KShuYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBibG9ja01lZGlhO1xyXG4gICAgfVxyXG5cclxuICAgIC8vINCX0LDQv9GD0YHQuiDQutC+0LzQv9C+0L3QtdC90YLQvtCyINCx0LjQsdC70LjQvtGC0LXQutC4XHJcbi8vINCe0YHQvdC+0LLQvdGL0LUg0LzQtdGC0L7QtNGLXHJcblxyXG4vLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQsdC40LHQu9C40L7RgtC10LrQuCDQuCDQstC+0LfRgNCw0YnQtdC90LUg0LzQtdC00LjQsNC+0LHRitC10LrRgtC+0LJcclxudGhpcy5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIGNoZWNrKHNlbGVjdG9yKTtcclxuICAgIC8qc3RhcnQoKTsqL1xyXG4gICAgcmV0dXJuIG1lZGlhT2JqZWN0O1xyXG59O1xyXG59Il0sImZpbGUiOiJtYWluLmpzIn0=
