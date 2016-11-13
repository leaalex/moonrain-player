console.log("Я test.js")
function MoonrainPlayer(selector) {
// TODO: this.default = {};
    // Переменные
    var key = genID("key");
    var mediaObject = [];
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
        if (id){
            element.id = id;
        }
        //TODO: Написать функцию которая сможет при сождании элемента добовлять несколько классов
        if (classList){
            element.classList.add(classList);
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
        var element = createElement(tagName, genID(tagName), 'class_' + tagName, false, {controls: true, preload: "auto"});
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
                    console.info("Загрузка успешно завершена: " , urlJSON);
                    objectJSON = JSON.parse(this.responseText);
                }
                else {
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
            constructor(HTMLElement);
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


    function constructor(HTMLElement){

        var element = {};
        element.html = HTMLElement;
        element.media = [];
        element.users = [];
        element.speakerChange = []

        mediaObject.push(element);

        var JSONObject = getObjectJSON("https://crossorigin.me/" + element.html.dataset.src + "metadata.json");
        var media = JSONObject.video.concat(JSONObject.audio);

        console.info("video: ", JSONObject.video);
        console.info("video: ", (JSONObject.video[0].instant-JSONObject.video[2].instant)/1000);
        console.info("audio: ", JSONObject.audio);


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

       console.log(element);
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
                console.log(element.tagName, index, element.user, element.instant, element.filename, HTMLElement.duration);
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

    this.init();
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwbGF5ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coXCLQryB0ZXN0LmpzXCIpXHJcbmZ1bmN0aW9uIE1vb25yYWluUGxheWVyKHNlbGVjdG9yKSB7XHJcbi8vIFRPRE86IHRoaXMuZGVmYXVsdCA9IHt9O1xyXG4gICAgLy8g0J/QtdGA0LXQvNC10L3QvdGL0LVcclxuICAgIHZhciBrZXkgPSBnZW5JRChcImtleVwiKTtcclxuICAgIHZhciBtZWRpYU9iamVjdCA9IFtdO1xyXG4gICAgdmFyIHNlbGVjdG9yRGVmYXVsdCA9IFwiLm1vb25yYWlucGxheWVyXCI7XHJcblxyXG5cclxuICAgIC8vINCf0YDQtdC/0YDQvtCy0LXRgNC60LhcclxuICAgIGlmKHNlbGVjdG9yID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3JEZWZhdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vINCS0YHQv9C+0LzQvtCz0LDRgtC10LvRjNC90YvQtSDQvNC10YLQvtC00YtcclxuXHJcbiAgICAvLyDQnNC10YLQvtC00Ysg0YDQsNGB0YjQuNGA0LXQvdC40Y8g0LLQvtC30LzQvtC20L3QvtGB0YLQtdC5INGB0YLQsNC90LTQsNGA0YLQvdGL0YUgRE9NINC+0LHQtdC60YLQvtCyXHJcbiAgICBFbGVtZW50LnByb3RvdHlwZS5hcHBlbmRDaGlsZHJlbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50cyl7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYXJndW1lbnRzW2tleV0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8g0JLRgdC/0L7QvNC+0LPQsNGC0LXQu9GM0L3Ri9C1INGE0YPQvdC60YbQuNC4OlxyXG5cclxuICAgIC8v0JPQtdC90LXRgNCw0YbQuNGPIElEXHJcbiAgICBmdW5jdGlvbiBnZW5JRCh2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWUgfHwgXCJpZFwiO1xyXG4gICAgICAgIHJldHVybiB2YWx1ZSArXCJfXCIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDE2KS5zdWJzdHIoMiwgOCkudG9VcHBlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvL9Ch0L7Qt9C00LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCBodG1sXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUsIGlkLCBjbGFzc0xpc3QsIGF0dHJpYnV0ZXMsIHByb3BlcnRpZXMpe1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcclxuICAgICAgICBpZiAoaWQpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmlkID0gaWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETzog0J3QsNC/0LjRgdCw0YLRjCDRhNGD0L3QutGG0LjRjiDQutC+0YLQvtGA0LDRjyDRgdC80L7QttC10YIg0L/RgNC4INGB0L7QttC00LDQvdC40Lgg0Y3Qu9C10LzQtdC90YLQsCDQtNC+0LHQvtCy0LvRj9GC0Ywg0L3QtdGB0LrQvtC70YzQutC+INC60LvQsNGB0YHQvtCyXHJcbiAgICAgICAgaWYgKGNsYXNzTGlzdCl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc0xpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXR0cmlidXRlcyl7XHJcbiAgICAgICAgICAgIGZvcih2YXIgYXR0cmlidXRlIGluIGF0dHJpYnV0ZXMpe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJpdGUoYXR0cmlidXRlLCBhdHRyaWJ1dGVzW2F0dHJpYnV0ZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9wZXJ0aWVzKXtcclxuICAgICAgICAgICAgZm9yICh2YXIgcHJvcGVydGl5IGluIHByb3BlcnRpZXMpe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudFtwcm9wZXJ0aXldID0gIHByb3BlcnRpZXNbcHJvcGVydGl5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvL9Ch0L7Qt9C00LDQvdC40LUg0LzQtdC00LjQsC3RjdC70LXQvNC10L3RgtCwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVNZWRpYUVsZW1lbnQodGFnTmFtZSwgbmFtZSwgc3JjLCB0eXBlKXtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgZ2VuSUQodGFnTmFtZSksICdjbGFzc18nICsgdGFnTmFtZSwgZmFsc2UsIHtjb250cm9sczogdHJ1ZSwgcHJlbG9hZDogXCJhdXRvXCJ9KTtcclxuICAgICAgICB2YXIgc291cmNlID0gY3JlYXRlRWxlbWVudChcInNvdXJjZVwiLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCB7c3JjOiBzcmMgKyBuYW1lLCB0eXBlOiB0eXBlfSk7XHJcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3VyY2UpO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG4gICAgLy8g0KTRg9C90LrRhtC40Y8g0L/QvtC70YPRh9C10L3QuNC1IEpTT04n0LAg0L/QviBVUkwg0Lgg0L/RgNC10L7QsdGA0LfQvtCy0LDQvdC40LUg0LXQs9C+INCyINC+0LHRitC10LrRglxyXG4gICAgZnVuY3Rpb24gZ2V0T2JqZWN0SlNPTih1cmxKU09OKXtcclxuICAgICAgICB2YXIgb2JqZWN0SlNPTiA9IHt9O1xyXG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmxKU09OLCBmYWxzZSk7XHJcbiAgICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gNCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcItCX0LDQs9GA0YPQt9C60LAg0YPRgdC/0LXRiNC90L4g0LfQsNCy0LXRgNGI0LXQvdCwOiBcIiAsIHVybEpTT04pO1xyXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdEpTT04gPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLQntGI0LjQsdC60LAg0LfQsNCz0YDRg9C30LrQuDogXCIgKyB1cmxKU09OKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmVxdWVzdC5zZW5kKG51bGwpO1xyXG4gICAgICAgIHJldHVybiBvYmplY3RKU09OO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyArKysrKysrKysrKysrKysrK1xyXG4gICAgLy8g0JLRgNC10LzQtdC90L3Ri9C1INGE0YPQvdC60YbQuNC4XHJcbiAgICAvLyArKysrKysrKysrKysrKysrK1xyXG4gICAgZnVuY3Rpb24gY2hlY2tTdG9wKCl7XHJcbiAgICAgICAgdmFyIGRhdGFBY3RpdmVDb3VudCA9IDA7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikuZm9yRWFjaChmdW5jdGlvbihlbGVtLCBpbmRleCl7XHJcbiAgICAgICAgICAgIGlmIChlbGVtLmRhdGFzZXQuc3RhdHVzID09IGtleSl7XHJcbiAgICAgICAgICAgICAgICBkYXRhQWN0aXZlQ291bnQgPSBpbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vY29uc29sZS5pbmZvKFwi0KHRgNCw0LLQvdC10L3QuNC1OiBcIiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoIC0gMSwgZGF0YUFjdGl2ZUNvdW50KTtcclxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoIC0gMSA9PSBkYXRhQWN0aXZlQ291bnQpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZU91dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy8g0J7RgdC90L7QstC90YvQtSDRhNGD0L3QutGG0LjQuFxyXG5cclxuICAgIC8vINCk0YPQvdC60YbQuNGPINC/0YDQvtCy0LXRgNC60Lgg0LfQsNC/0YPRidC10L0g0LvQuCDQtNGA0YPQs9C+0Lkg0Y3QutC30LrQvNC90LvRj9GAINCx0LjQsdC70LjQvtGC0LXQutC4XHJcbiAgICAvLyDQldGB0LvQuCDQtNGA0YPQs9C+0LPQviDRjdC60LfQtdC80L/Qu9GP0YDQsCDQvdC1INC30LDQv9GD0YnQtdC90L4g0YLQviDQt9Cw0L/Rg9GB0LrQsNC10YIg0YTRg9C90LrRhtC40Y4gc3RhcnQoKVxyXG4gICAgZnVuY3Rpb24gY2hlY2soc2VsZWN0b3Ipe1xyXG4gICAgICAgIGlmKEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmRhdGFzZXQuc3RhdHVzICE9PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSkubGVuZ3RoKXtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi0KDQsNCx0L7RgtCw0LXRgiDQtNGA0YPQs9Cw0Y8g0LHQuNCx0LvQuNC+0YLQtdC60LAhXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBzdGFydChzZWxlY3Rvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vINCk0YPQvdC60YbQuNGPINC/0LXRgNC10LHQvtGA0LAg0Y3Qu9C10LzQtdC90YLQvtCyINC/0L7QtNGF0L7QtNGP0YnQuNGFINC/0L7QtCDRgtGA0LXQsdC+0LLQsNC90LjRj1xyXG4gICAgZnVuY3Rpb24gc3RhcnQoc2VsZWN0b3Ipe1xyXG4gICAgICAgLy8gY29uc29sZS5pbmZvKCfRgdGC0LDRgNGCINC30LDQv9GB0YLQuNC70YHRjywg0YHQtdC70LXQutGC0L7RgCAnKyBzZWxlY3RvciwgdGhpcyk7XHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLCBmdW5jdGlvbihIVE1MRWxlbWVudCl7XHJcbiAgICAgICAgICAgIHJldHVybiBIVE1MRWxlbWVudC5kYXRhc2V0LnN0YXR1cyA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24oSFRNTEVsZW1lbnQsIGksIGFycmF5KXtcclxuICAgICAgICAgIC8vICBjb25zb2xlLmxvZyhlbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50LmRhdGFzZXQuc3RhdHVzID0ga2V5O1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihIVE1MRWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBzdGFydChzZWxlY3Rvcik7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vINCe0YHQvdC+0LLQvdGL0LUg0LzQtdGC0L7QtNGLXHJcblxyXG4gICAgLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0LHQuNCx0LvQuNC+0YLQtdC60Lgg0Lgg0LLQvtC30YDQsNGJ0LXQvdC1INC80LXQtNC40LDQvtCx0YrQtdC60YLQvtCyXHJcbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGNoZWNrKHNlbGVjdG9yKTtcclxuICAgICAgICAvKnN0YXJ0KCk7Ki9cclxuICAgICAgICByZXR1cm4gbWVkaWFPYmplY3Q7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBjb25zdHJ1Y3RvcihIVE1MRWxlbWVudCl7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0ge307XHJcbiAgICAgICAgZWxlbWVudC5odG1sID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgZWxlbWVudC5tZWRpYSA9IFtdO1xyXG4gICAgICAgIGVsZW1lbnQudXNlcnMgPSBbXTtcclxuICAgICAgICBlbGVtZW50LnNwZWFrZXJDaGFuZ2UgPSBbXVxyXG5cclxuICAgICAgICBtZWRpYU9iamVjdC5wdXNoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICB2YXIgSlNPTk9iamVjdCA9IGdldE9iamVjdEpTT04oXCJodHRwczovL2Nyb3Nzb3JpZ2luLm1lL1wiICsgZWxlbWVudC5odG1sLmRhdGFzZXQuc3JjICsgXCJtZXRhZGF0YS5qc29uXCIpO1xyXG4gICAgICAgIHZhciBtZWRpYSA9IEpTT05PYmplY3QudmlkZW8uY29uY2F0KEpTT05PYmplY3QuYXVkaW8pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmluZm8oXCJ2aWRlbzogXCIsIEpTT05PYmplY3QudmlkZW8pO1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcInZpZGVvOiBcIiwgKEpTT05PYmplY3QudmlkZW9bMF0uaW5zdGFudC1KU09OT2JqZWN0LnZpZGVvWzJdLmluc3RhbnQpLzEwMDApO1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcImF1ZGlvOiBcIiwgSlNPTk9iamVjdC5hdWRpbyk7XHJcblxyXG5cclxuICAgICAgICBtZWRpYS5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgaWYoZWwuZmlsZW5hbWUgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBpZighZWxlbWVudC51c2Vycy5pbmNsdWRlcyhlbC5lbmRwb2ludElkKSkgZWxlbWVudC51c2Vycy5wdXNoKGVsLmVuZHBvaW50SWQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lZGlhRWxlbWVudCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50LnRhZ05hbWUgPSBlbC5tZWRpYVR5cGU7XHJcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuZmlsZW5hbWUgPSBlbC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5zcmMgPSBlbGVtZW50Lmh0bWwuZGF0YXNldC5zcmM7XHJcbiAgICAgICAgICAgICAgICBpZihlbC5tZWRpYVR5cGUgPT0gXCJhdWRpb1wiKSBtZWRpYUVsZW1lbnQudHlwZSA9IFwiYXVkaW8vbXAzXCI7XHJcbiAgICAgICAgICAgICAgICBpZihlbC5tZWRpYVR5cGUgPT0gXCJ2aWRlb1wiKSBtZWRpYUVsZW1lbnQudHlwZSA9IFwidmlkZW8vd2VibVwiO1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50LnVzZXIgPSBlbC5lbmRwb2ludElkO1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50Lmluc3RhbnQgPSBlbC5pbnN0YW50O1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tZWRpYS5wdXNoKG1lZGlhRWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3BlYWtlckNoYW5nZS5wdXNoKGVsKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XHJcbiAgICAgICAgZWxlbWVudC5odG1sLmFwcGVuZENoaWxkKGNyZWF0ZVBsYXllcihlbGVtZW50KSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVBsYXllcihlbCl7XHJcbiAgICAgICAgdmFyIHVzZXJzID0ge307XHJcbiAgICAgICAgZWwudGltZWxpbmVzID0ge307XHJcblxyXG4gICAgICAgIHZhciBibG9ja01lZGlhID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJwbGF5ZXJcIiwgZmFsc2UsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdmFyIHZpZGVvID0gY3JlYXRlRWxlbWVudChcInZpZGVvXCIsIGZhbHNlLCBcInZpZGVvTW9vbnJhaW5QbGF5ZXJcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB2aWRlby5jdXJyZW50RHVyYXRpb24gPSAwO1xyXG4gICAgICAgIHZpZGVvLmZpcnN0ID0gMDtcclxuICAgICAgICB2YXIgc291cmNlVmlkZW8gPSBjcmVhdGVFbGVtZW50KFwic291cmNlXCIsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB2aWRlby5hcHBlbmRDaGlsZChzb3VyY2VWaWRlbyk7XHJcblxyXG4gICAgICAgIHZhciBhdWRpbyA9IGNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiLCBmYWxzZSwgXCJhdWRpb01vb25yYWluUGxheWVyXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgYXVkaW8uY3VycmVudER1cmF0aW9uID0gMDtcclxuICAgICAgICBhdWRpby5maXJzdCA9IDA7XHJcbiAgICAgICAgdmFyIHNvdXJjZUF1ZGlvID0gY3JlYXRlRWxlbWVudChcInNvdXJjZVwiLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgYXVkaW8uYXBwZW5kQ2hpbGQoc291cmNlQXVkaW8pO1xyXG5cclxuICAgICAgICB2YXIgYmxvY2tDb250cm9scyA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiYm90dG9tXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdmFyIHByb2dyZXNzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJwcm9ncmVzc1wiLCBmYWxzZSwgZmFsc2UpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciB1c2VyIGluIGVsLnVzZXJzKXtcclxuICAgICAgICAgICAgdmFyIHRpbWVsaW5lID0ge307XHJcbiAgICAgICAgICAgIHRpbWVsaW5lLmJvZHkgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGltZWxpbmUudmlkZW8gPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcInByb2dyZXNzLXZpZGVvXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRpbWVsaW5lLnByb2dyZXNzVmlld2VkID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJwcm9ncmVzcy12aWV3ZWRcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LmFkZChcInByb2dyZXNzLWluYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICB0aW1lbGluZS52aWRlby5hcHBlbmRDaGlsZCh0aW1lbGluZS5wcm9ncmVzc1ZpZXdlZCk7XHJcbiAgICAgICAgICAgIHRpbWVsaW5lLmF1ZGlvID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJwcm9ncmVzcy1hdWRpb1wiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aW1lbGluZS5ib2R5LmFwcGVuZENoaWxkcmVuKHRpbWVsaW5lLnZpZGVvLCB0aW1lbGluZS5hdWRpbyk7XHJcbiAgICAgICAgICAgIHByb2dyZXNzLmFwcGVuZENoaWxkKHRpbWVsaW5lLmJvZHkpO1xyXG4gICAgICAgICAgICBlbC50aW1lbGluZXNbZWwudXNlcnNbdXNlcl1dID0gdGltZWxpbmU7XHJcbiAgICAgICAgICAgIGlmKHVzZXIgPT0gMCkge3RpbWVsaW5lLnByb2dyZXNzVmlld2VkLmNsYXNzTGlzdC5hZGQoXCJwcm9ncmVzcy1hY3RpdmVcIik7dGltZWxpbmUucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LnJlbW92ZShcInByb2dyZXNzLWluYWN0aXZlXCIpO31cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgdmFyIHNjcnViYmVyID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJzY3J1YmJlclwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIHNjcnViYmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic2NydWJiZXItY2lyY2xlXCI+PC9kaXY+JztcclxuICAgICAgICBwcm9ncmVzcy5hcHBlbmRDaGlsZChzY3J1YmJlcik7XHJcblxyXG4gICAgICAgIHNjcnViYmVyLm9uZHJhZ3N0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY29udHJvbHMgPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2xzXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdmFyIGxlZnRDb250cm9scyA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbHMtbGVmdFwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIHZhciByaWdodENvbnRyb2xzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9scy1yaWdodFwiLCBmYWxzZSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB2YXIgYnV0dG9uUGxheVBhdXNlID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLWJ1dHRvblwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIGJ1dHRvblBsYXlQYXVzZS5jbGFzc0xpc3QuYWRkKFwicGxheS1wYXVzZVwiKTtcclxuXHJcbiAgICAgICAgYnV0dG9uUGxheVBhdXNlLmlubmVySFRNTCA9ICc8c3ZnIGNsYXNzPVwicGxheS1pbWFnZSBhY3RpdmVcIiBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgMzYgMzZcIiB3aWR0aD1cIjEwMCVcIj48cGF0aCBmaWxsPVwid2hpdGVcIiBkPVwiTSAxMiwyNiAxOC41LDIyIDE4LjUsMTQgMTIsMTAgeiBNIDE4LjUsMjIgMjUsMTggMjUsMTggMTguNSwxNCB6XCI+PC9wYXRoPjwvc3ZnPjxzdmcgY2xhc3M9XCJwYXVzZS1pbWFnZVwiIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGQ9XCJNIDEyLDI2IDE2LDI2IDE2LDEwIDEyLDEwIHogTSAyMSwyNiAyNSwyNiAyNSwxMCAyMSwxMCB6XCI+PC9wYXRoPjwvc3ZnPic7XHJcblxyXG5cclxuICAgICAgICBidXR0b25QbGF5UGF1c2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnBsYXktaW1hZ2VcIikuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIi5wYXVzZS1pbWFnZVwiKS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHZpZGVvLnBhdXNlZCl7XHJcbiAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICBhdWRpby5wbGF5KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdmlkZW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgIC8qIHZhciBidXR0b25TdG9wID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgIFwiY29udHJvbC1idXR0b25cIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBidXR0b25TdG9wLmlubmVySFRNTCA9ICcnOyovXHJcblxyXG4gICAgICAgIHZhciBidXR0b25QcmV2ID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLWJ1dHRvblwiLCBmYWxzZSwgIHtoaWRkZW46IFwiaGlkZGVuXCJ9KTtcclxuICAgICAgICBidXR0b25QcmV2LmlubmVySFRNTCA9ICc8c3ZnIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGQ9XCJtIDEyLDEyIGggMiB2IDEyIGggLTIgeiBtIDMuNSw2IDguNSw2IFYgMTIgelwiPjwvcGF0aD48L3N2Zz4nO1xyXG5cclxuICAgICAgICB2YXIgYnV0dG9uTmV4dCA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbC1idXR0b25cIiwgZmFsc2UsIHtoaWRkZW46IFwiaGlkZGVuXCJ9KTtcclxuICAgICAgICBidXR0b25OZXh0LmlubmVySFRNTCA9ICc8c3ZnIGhlaWdodD1cIjEwMCVcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCAzNiAzNlwiIHdpZHRoPVwiMTAwJVwiPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGQ9XCJNIDEyLDI0IDIwLjUsMTggMTIsMTIgViAyNCB6IE0gMjIsMTIgdiAxMiBoIDIgViAxMiBoIC0yIHpcIj48L3BhdGg+PC9zdmc+JztcclxuXHJcbiAgICAgICAgdmFyIGJ1dHRvblZvbHVtZSA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbC12b2x1bWVcIiwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICBidXR0b25Wb2x1bWUuaW5uZXJIVE1MID0gJzxzdmcgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCI+PHBhdGggZmlsbD1cIndoaXRlXCIgZD1cIk04LDIxIEwxMiwyMSBMMTcsMjYgTDE3LDEwIEwxMiwxNSBMOCwxNSBMOCwyMSBaIE0xOSwxNCBMMTksMjIgQzIwLjQ4LDIxLjMyIDIxLjUsMTkuNzcgMjEuNSwxOCBDMjEuNSwxNi4yNiAyMC40OCwxNC43NCAxOSwxNCBaIE0xOSwxMS4yOSBDMjEuODksMTIuMTUgMjQsMTQuODMgMjQsMTggQzI0LDIxLjE3IDIxLjg5LDIzLjg1IDE5LDI0LjcxIEwxOSwyNi43NyBDMjMuMDEsMjUuODYgMjYsMjIuMjggMjYsMTggQzI2LDEzLjcyIDIzLjAxLDEwLjE0IDE5LDkuMjMgTDE5LDExLjI5IFpcIj48L3BhdGg+PC9zdmc+JztcclxuXHJcbiAgICAgICAgYnV0dG9uVm9sdW1lSW5wdXQgPSBjcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgZmFsc2UsIFwidm9sdW1lLXZhbHVlXCIsIGZhbHNlLCB7dHlwZTogXCJyYW5nZVwiLCBtaW46IFwiMFwiLCBtYXg6IFwiMVwiLCBzdGVwOiBcIjAuMDFcIn0pO1xyXG4gICAgICAgIGJ1dHRvblZvbHVtZS5hcHBlbmRDaGlsZChidXR0b25Wb2x1bWVJbnB1dCk7XHJcblxyXG4gICAgICAgIHZhciB0aW1lciA9IGNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgZmFsc2UsIFwiY29udHJvbC10aW1lclwiLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIHRpbWVyLmlubmVySFRNTCA9ICc8c3Bhbj4yMzoxMjwvc3Bhbj4gPHNwYW4+Lzwvc3Bhbj4gPHNwYW4+MTA6NTY6MDI8L3NwYW4+JztcclxuXHJcbiAgICAgICAgdmFyIGJ1dHRvblNldHRpbmdzID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJjb250cm9sLXNldHRpbmdzXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgYnV0dG9uU2V0dGluZ3MuaW5uZXJIVE1MID0gJzxzdmcgaGVpZ2h0PVwiMTAwJVwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDM2IDM2XCI+PHBhdGggZD1cIm0gMjMuOTQsMTguNzggYyAuMDMsLTAuMjUgLjA1LC0wLjUxIC4wNSwtMC43OCAwLC0wLjI3IC0wLjAyLC0wLjUyIC0wLjA1LC0wLjc4IGwgMS42OCwtMS4zMiBjIC4xNSwtMC4xMiAuMTksLTAuMzMgLjA5LC0wLjUxIGwgLTEuNiwtMi43NiBjIC0wLjA5LC0wLjE3IC0wLjMxLC0wLjI0IC0wLjQ4LC0wLjE3IGwgLTEuOTksLjggYyAtMC40MSwtMC4zMiAtMC44NiwtMC41OCAtMS4zNSwtMC43OCBsIC0wLjMwLC0yLjEyIGMgLTAuMDIsLTAuMTkgLTAuMTksLTAuMzMgLTAuMzksLTAuMzMgbCAtMy4yLDAgYyAtMC4yLDAgLTAuMzYsLjE0IC0wLjM5LC4zMyBsIC0wLjMwLDIuMTIgYyAtMC40OCwuMiAtMC45MywuNDcgLTEuMzUsLjc4IGwgLTEuOTksLTAuOCBjIC0wLjE4LC0wLjA3IC0wLjM5LDAgLTAuNDgsLjE3IGwgLTEuNiwyLjc2IGMgLTAuMTAsLjE3IC0wLjA1LC4zOSAuMDksLjUxIGwgMS42OCwxLjMyIGMgLTAuMDMsLjI1IC0wLjA1LC41MiAtMC4wNSwuNzggMCwuMjYgLjAyLC41MiAuMDUsLjc4IGwgLTEuNjgsMS4zMiBjIC0wLjE1LC4xMiAtMC4xOSwuMzMgLTAuMDksLjUxIGwgMS42LDIuNzYgYyAuMDksLjE3IC4zMSwuMjQgLjQ4LC4xNyBsIDEuOTksLTAuOCBjIC40MSwuMzIgLjg2LC41OCAxLjM1LC43OCBsIC4zMCwyLjEyIGMgLjAyLC4xOSAuMTksLjMzIC4zOSwuMzMgbCAzLjIsMCBjIC4yLDAgLjM2LC0wLjE0IC4zOSwtMC4zMyBsIC4zMCwtMi4xMiBjIC40OCwtMC4yIC45MywtMC40NyAxLjM1LC0wLjc4IGwgMS45OSwuOCBjIC4xOCwuMDcgLjM5LDAgLjQ4LC0wLjE3IGwgMS42LC0yLjc2IGMgLjA5LC0wLjE3IC4wNSwtMC4zOSAtMC4wOSwtMC41MSBsIC0xLjY4LC0xLjMyIDAsMCB6IG0gLTUuOTQsMi4wMSBjIC0xLjU0LDAgLTIuOCwtMS4yNSAtMi44LC0yLjggMCwtMS41NCAxLjI1LC0yLjggMi44LC0yLjggMS41NCwwIDIuOCwxLjI1IDIuOCwyLjggMCwxLjU0IC0xLjI1LDIuOCAtMi44LDIuOCBsIDAsMCB6XCIgZmlsbD1cIiNmZmZcIj48L3BhdGg+PC9zdmc+JztcclxuXHJcbiAgICAgICAgdmFyIGJ1dHRvbkZ1bGxzY3JlZW4gPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBcImNvbnRyb2wtYnV0dG9uXCIsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgYnV0dG9uRnVsbHNjcmVlbi5pbm5lckhUTUwgPSAnPHN2ZyBoZWlnaHQ9XCIxMDAlXCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgMzYgMzZcIiB3aWR0aD1cIjEwMCVcIj48Zz48cGF0aCBmaWxsPVwid2hpdGVcIiBjbGFzcz1cInl0cC1zdmctZmlsbFwiIGQ9XCJtIDEwLDE2IDIsMCAwLC00IDQsMCAwLC0yIEwgMTAsMTAgbCAwLDYgMCwwIHpcIj48L3BhdGg+PC9nPjxnPjxwYXRoIGZpbGw9XCJ3aGl0ZVwiIGNsYXNzPVwieXRwLXN2Zy1maWxsXCIgZD1cIm0gMjAsMTAgMCwyIDQsMCAwLDQgMiwwIEwgMjYsMTAgbCAtNiwwIDAsMCB6XCI+PC9wYXRoPjwvZz48Zz48cGF0aCBmaWxsPVwid2hpdGVcIiBjbGFzcz1cInl0cC1zdmctZmlsbFwiIGQ9XCJtIDI0LDI0IC00LDAgMCwyIEwgMjYsMjYgbCAwLC02IC0yLDAgMCw0IDAsMCB6XCI+PC9wYXRoPjwvZz48Zz48cGF0aCBmaWxsPVwid2hpdGVcIiBjbGFzcz1cInl0cC1zdmctZmlsbFwiIGQ9XCJNIDEyLDIwIDEwLDIwIDEwLDI2IGwgNiwwIDAsLTIgLTQsMCAwLC00IDAsMCB6XCI+PC9wYXRoPjwvZz48L3N2Zz4nO1xyXG5cclxuICAgICAgICBsZWZ0Q29udHJvbHMuYXBwZW5kQ2hpbGRyZW4oYnV0dG9uUGxheVBhdXNlLCAvKmJ1dHRvblN0b3AsKi8gYnV0dG9uUHJldiwgYnV0dG9uTmV4dCwgYnV0dG9uVm9sdW1lLCB0aW1lcik7XHJcbiAgICAgICAgcmlnaHRDb250cm9scy5hcHBlbmRDaGlsZHJlbihidXR0b25TZXR0aW5ncywgYnV0dG9uRnVsbHNjcmVlbik7XHJcblxyXG4gICAgICAgIGNvbnRyb2xzLmFwcGVuZENoaWxkcmVuKGxlZnRDb250cm9scywgcmlnaHRDb250cm9scyk7XHJcbiAgICAgICAgYmxvY2tDb250cm9scy5hcHBlbmRDaGlsZHJlbihwcm9ncmVzcywgY29udHJvbHMpO1xyXG5cclxuICAgICAgICB2YXIgYmxvY2tIaWRlID0gY3JlYXRlRWxlbWVudChcImRpdlwiLCBmYWxzZSwgXCJoaWRlLXZpZGVvc1wiLCBmYWxzZSwgZmFsc2UpO1xyXG5cclxuICAgICAgICBlbC51c2Vycy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KXtcclxuICAgICAgICAgICAgdXNlcnNbZWxlbWVudF0gPSBjcmVhdGVFbGVtZW50KFwiZGl2XCIsIGZhbHNlLCBlbGVtZW50LCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICBibG9ja0hpZGUuYXBwZW5kQ2hpbGQodXNlcnNbZWxlbWVudF0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgZWwubWVkaWEuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCl7XHJcbiAgICAgICAgICAgIHZhciBIVE1MRWxlbWVudCA9IGNyZWF0ZU1lZGlhRWxlbWVudChlbGVtZW50LnRhZ05hbWUsIGVsZW1lbnQuZmlsZW5hbWUsIGVsZW1lbnQuc3JjLCBlbGVtZW50LnR5cGUpO1xyXG4gICAgICAgICAgICBibG9ja0hpZGUuYXBwZW5kQ2hpbGQoSFRNTEVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZG1ldGFkYXRhXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB1c2Vyc1tlbGVtZW50LnVzZXJdLmFwcGVuZENoaWxkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZWxlbWVudC50YWdOYW1lLCBpbmRleCwgZWxlbWVudC51c2VyLCBlbGVtZW50Lmluc3RhbnQsIGVsZW1lbnQuZmlsZW5hbWUsIEhUTUxFbGVtZW50LmR1cmF0aW9uKTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZHVyYXRpb24gPSBIVE1MRWxlbWVudC5kdXJhdGlvbjtcclxuXHJcblxyXG4gICAgICAgICAgICBpZihlbGVtZW50LnRhZ05hbWUgPT0gXCJ2aWRlb1wiKXtcclxuICAgICAgICAgICAgICAgIGlmKHZpZGVvLmZpcnN0ID09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLmZpcnN0ID0gZWxlbWVudC5pbnN0YW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5jdXJyZW50RHVyYXRpb24gPSBlbGVtZW50LmR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2aWRlby5maXJzdCA+IGVsZW1lbnQuaW5zdGFudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwidmlkZW8uc3JjXCIsIHZpZGVvLnNyYywgZWxlbWVudC5pbnN0YW50KTtcclxuICAgICAgICAgICAgICAgICAgICB2aWRlby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoZWxlbWVudC50YWdOYW1lID09IFwiYXVkaW9cIil7XHJcbiAgICAgICAgICAgICAgICBpZihhdWRpby5maXJzdCA9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgICBhdWRpby5maXJzdCA9IGVsZW1lbnQuaW5zdGFudDtcclxuICAgICAgICAgICAgICAgICAgICBhdWRpby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXVkaW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhdWRpby5maXJzdCA+IGVsZW1lbnQuaW5zdGFudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiYXVkaW8uc3JjXCIsIGF1ZGlvLnNyYywgZWxlbWVudC5pbnN0YW50KTtcclxuICAgICAgICAgICAgICAgICAgICBhdWRpby5zcmMgPSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXVkaW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgZWwudGltZWxpbmVzW2VsZW1lbnQudXNlcl0uYm9keS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBpZihlbGVtZW50LnRhZ05hbWUgPT0gXCJ2aWRlb1wiKXtcclxuICAgICAgICAgICAgICAgICAgICBpZih2aWRlby5zcmMgIT09IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZSl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih2aWRlby5wYXVzZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoZWxlbWVudC50YWdOYW1lID09IFwiYXVkaW9cIil7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoYXVkaW8uc3JjICE9PSBlbGVtZW50LnNyYyArIGVsZW1lbnQuZmlsZW5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhdWRpby5wYXVzZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8uc3JjID0gZWxlbWVudC5zcmMgKyBlbGVtZW50LmZpbGVuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW8uY3VycmVudER1cmF0aW9uID0gZWxlbWVudC5kdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLnNyYyA9IGVsZW1lbnQuc3JjICsgZWxlbWVudC5maWxlbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvLmN1cnJlbnREdXJhdGlvbiA9IGVsZW1lbnQuZHVyYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGJsb2NrTWVkaWEuYXBwZW5kQ2hpbGRyZW4odmlkZW8sIGF1ZGlvLCBibG9ja0NvbnRyb2xzLCBibG9ja0hpZGUpO1xyXG5cclxuXHJcbiAgICAgICAgLy/Qn9C+0YHRgtC+0Y/QvdC90L7QtSDQvtGC0YHQu9C10LbQuNCy0LDQvdC10L3QuNC1INGB0L7RgdGC0L7Rj9C90LjQuSDQstC40LTQtdC+INC4INCw0YPQtNC40L4gKHBsYXkg0LjQu9C4IHBhdXNlKVxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgKGZ1bmN0aW9uIHRpbWUoKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ2aWRlby5wYXVzZWQ6IFwiLCB2aWRlby5wYXVzZWQpO1xyXG4gICAgICAgICAgICAgY29uc29sZS5sb2coXCJhdWRpby5wYXVzZWQ6IFwiLCBhdWRpby5wYXVzZWQpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCB0aW1lICwgMTAwMCk7XHJcblxyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgKi9cclxuXHJcblxyXG4gICAgICAgIC8vKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKytcclxuXHJcbiAgICAgICAgdmFyIG1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwicG9pbnRlclwiO1xyXG4gICAgICAgICAgICB2YXIgbW91c2VYO1xyXG4gICAgICAgICAgICAoZS5jbGllbnRYIC0gMTkgPCAwKSA/IG1vdXNlWCA9IDA6IChlLmNsaWVudFggLSAxOSA+IDgzMCkgPyBtb3VzZVggPSA4MzA6IG1vdXNlWCA9IGUuY2xpZW50WCAtIDE5O1xyXG5cclxuICAgICAgICAgICAgc2NydWJiZXIuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVYKFwiICsgbW91c2VYICsgXCJweClcIjtcclxuXHJcbiAgICAgICAgICAgIGZvcih2YXIgbmFtZSBpbiBlbC50aW1lbGluZXMpe1xyXG4gICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW25hbWVdLnByb2dyZXNzVmlld2VkLnN0eWxlLndpZHRoID0gbW91c2VYICsgXCJweFwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwidmlkZW8uY3VycmVudFRpbWVcIiwgdmlkZW8uY3VycmVudER1cmF0aW9uICogKG1vdXNlWC84MzApKTtcclxuICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImF1ZGlvLmN1cnJlbnRUaW1lXCIsIGF1ZGlvLmN1cnJlbnREdXJhdGlvbiAqIChtb3VzZVgvODMwKSk7XHJcblxyXG4gICAgICAgICAgICB2aWRlby5jdXJyZW50VGltZSA9IGF1ZGlvLmN1cnJlbnREdXJhdGlvbiAqIChtb3VzZVggLyA4MzApO1xyXG4gICAgICAgICAgICBhdWRpby5jdXJyZW50VGltZSA9IGF1ZGlvLmN1cnJlbnREdXJhdGlvbiAqIChtb3VzZVggLyA4MzApO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcInRpbWV1cGRhdGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgbmFtZSBpbiBlbC50aW1lbGluZXMpe1xyXG4gICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW25hbWVdLnByb2dyZXNzVmlld2VkLnN0eWxlLndpZHRoID0gKHZpZGVvLmN1cnJlbnRUaW1lIC8gdmlkZW8uY3VycmVudER1cmF0aW9uKSAqIDgzMCAgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjcnViYmVyLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWChcIiArICh2aWRlby5jdXJyZW50VGltZSAvIHZpZGVvLmN1cnJlbnREdXJhdGlvbikgKiA4MzAgKyBcInB4KVwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcIm9uc2Vla2VkXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgYWxlcnQoXCJTZWVrIG9wZXJhdGlvbiBjb21wbGV0ZWQhXCIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgcHJvZ3Jlc3MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBtb3ZlTGlzdGVuZXIoZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmVMaXN0ZW5lciwgIGZhbHNlKTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG5cclxuICAgICAgICBzY3J1YmJlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIG1vdmVMaXN0ZW5lcihlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZUxpc3RlbmVyLCAgZmFsc2UpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJhdXRvXCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmVMaXN0ZW5lciwgIGZhbHNlKTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlVQIVwiKTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG5cclxuICAgICAgICBidXR0b25Wb2x1bWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgYXVkaW8udm9sdW1lID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYXVkaW8udm9sdW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGJ1dHRvbkZ1bGxzY3JlZW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT0shXCIsIHZpZGVvKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGZvcih2YXIgbmFtZSBpbiBlbC50aW1lbGluZXMpe1xyXG4gICAgICAgICAgICAoZnVuY3Rpb24obmFtZSl7XHJcbiAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbbmFtZV0udmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSA9IFtdLnNsaWNlLmNhbGwocHJvZ3Jlc3MuY2hpbGROb2RlcykuaW5kZXhPZihlbC50aW1lbGluZXNbbmFtZV0uYm9keSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW25hbWVdLnByb2dyZXNzVmlld2VkLmNsYXNzTGlzdC5yZW1vdmUoXCJwcm9ncmVzcy1pbmFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBlbC50aW1lbGluZXNbbmFtZV0ucHJvZ3Jlc3NWaWV3ZWQuY2xhc3NMaXN0LmFkZChcInByb2dyZXNzLWFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGFub3RoZXJuYW1lIGluIGVsLnRpbWVsaW5lcyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFub3RoZXJuYW1lICE9PW5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW2Fub3RoZXJuYW1lXS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QucmVtb3ZlKFwicHJvZ3Jlc3MtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwudGltZWxpbmVzW2Fub3RoZXJuYW1lXS5wcm9ncmVzc1ZpZXdlZC5jbGFzc0xpc3QuYWRkKFwicHJvZ3Jlc3MtaW5hY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MucXVlcnlTZWxlY3RvcihcIi5zY3J1YmJlci1jaXJjbGVcIikuc3R5bGUudG9wID0gaSAqIDE0IC0gMiArIFwicHhcIjtcclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSkobmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYmxvY2tNZWRpYTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDQl9Cw0L/Rg9GB0Log0LrQvtC80L/QvtC90LXQvdGC0L7QsiDQsdC40LHQu9C40L7RgtC10LrQuFxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG59Il0sImZpbGUiOiJwbGF5ZXIuanMifQ==
