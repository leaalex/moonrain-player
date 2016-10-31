
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
                } else{ video.pause(); audio.pause();}
            //(audio.paused) ? audio.play() : audio.pause();
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
            //console.log(element);
        });


        el.media.forEach(function(element, index){
            var HTMLElement = createMediaElement(element.tagName, element.filename, element.src, element.type);
            blockHide.appendChild(HTMLElement);

            HTMLElement.addEventListener("loadedmetadata", function(){
                users[element.user].appendChild(this);
                console.log(element.tagName, index, element.user, element.instant, HTMLElement.duration);
                element.duration = HTMLElement.duration;
            
            
            if(element.tagName == "video"){
               // console.log(video.first);
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
               // console.log(audio.first);
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
                        video.src = element.src + element.filename;
                        video.currentDuration = element.duration;
                    }
                }
                if(element.tagName == "audio"){
                    if(audio.src !== element.src + element.filename){
                        audio.src = element.src + element.filename;
                        audio.currentDuration = element.duration;
                    }
                }
            });
        



        });


        blockMedia.appendChildren(video, audio, blockControls, blockHide);
        

        //+++++++++++++++++++++++++++++++++++++++++++++++++++++



        var moveListener = function(e){
            document.body.style.cursor = "pointer";
            var mouseX;
            (e.clientX - 19 < 0) ? mouseX = 0: (e.clientX - 19 > 830) ? mouseX = 830: mouseX = e.clientX - 19;

            scrubber.style.transform = "translateX(" + mouseX + "px)";
            
            for(var name in el.timelines){
                el.timelines[name].progressViewed.style.width = mouseX + "px";
            }

            console.log("video.currentTime", video.currentDuration * (mouseX/830));
            console.log("audio.currentTime", audio.currentDuration * (mouseX/830));
            
            video.currentTime = audio.currentDuration * (mouseX/830); 
            audio.currentTime = audio.currentDuration * (mouseX/830); 
            
            /*audio.currentTime = audio.duration/830 * mouseX;*/
        };

        progress.addEventListener('mousedown', function(e){
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

            console.log("UP!");

        }, false);

        buttonVolumeInput.addEventListener('input', function()
        {
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
