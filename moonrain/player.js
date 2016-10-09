function findPlayer(){

}
function createPlayer(){


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
