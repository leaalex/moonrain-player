function findPlayer(){

}
function createPlayer(){
    var blockMedia;
    var video;
    blockMedia.appendChild(video);
    var blockControls;
    var progress;
    for (var element in elements){
        var timeline;
        var timelineVideo;
        var timelineAudio;
        timeline.appendChild(timelineVideo);
        timeline.appendChild(timelineAudio);
        progress.appendChild(timeline);
    }
    var scrubber;
    progress.appendChild(scrubber);

    var controls;
    var leftControls;
    var buttonPlayPouse;
    var buttonStop;
    var buttonPrev;
    var buttonNext;
    var buttonVolume;
    var timer;




    blockControls.appendChild(progress);
    blockControls.appendChild(controls);
    var blockHide;
}

function createElement(tagName, id, classList, attributes, properties){
    var element = document.createElement(tagName);
    if(classList){
        element.classList.add(classList);
    }
    if(classList){
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

function genID(value){
    var value = value+"_" || "id";
        return value + Math.random().toString(16).substr(2, 8).toUpperCase();
}

function createMediaElement(type, name, src){
    var element = createElement(type, genID(type), 'class_'+type, false, {controls:false, preload:"metadata"});
    var source = createElement("source", false, false, false, {src:src + name, type: "video/webm"});
    element.appendChild(source);
    return element;
}

function append(element, array){

}

Element.prototype.appendChildren = function(){
    for (var key in arguments){
        this.appendChild(arguments[key]);
    }
};
