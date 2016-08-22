// Функция получает селектор возвращает массив обектов. В массие может быть один элемент


function query(selector){
    var array = [];
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++){
        array.push(elements[i]);
    };
    return array;
}
// Функция гегенрации ID
function genID(value){
    var value = value+"_" || "id"
        return value + Math.random().toString(16).substr(2, 8).toUpperCase();
};
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
                console.log("Ошибка загрузки: " + urlJSON)
            }
        }
    }
    request.send(null);
    return objectJSON;
};
// Функция получения свойства каждого из элементов в нутри обекта
function mediaObjects(objectJSON, type, property){
    var elements = [];
    objectJSON[type].forEach(function(element){
        if(element.type != "SPEAKER_CHANGED"){
            elements.push(element[property])
        }
    });
    return elements;
};
// Функция создания видео/аудео блока
function createMediaELement(type, name, src){
    var element = document.createElement(type);
    element.controls = false;
    element.preload = "metadata";
    var source = document.createElement("source");
    source.src = src + name;
    source.type = "video/webm";
    element.appendChild(source);
    return element;
};
// Функция создания HTML элемента
function createElement(tagName, id, classList, attributes, properties){

  var element = document.createElement(tagName);
  if (id) {
    element.id = id;
  };
  if (classList) {
    element.classList = classList;
  };
  if (attributes){
    for (attribute in attributes){
      element.setAttribute(attribute, attributes[attribute]);
    };
  };
  if (properties){
    for (propertiy in properties){
      element[propertiy] =  properties[propertiy];
    }
  }
  return element;
};

function formatTime(time) {
    var hours = (time / 3600) >= 1.0;
    if (hours) {
        var h = Math.floor(time / 3600);
        time = time - h * 3600;
                    
        var m = Math.floor(time / 60);
        var s = Math.floor(time % 60);
                    
        return h.lead0(2)  + ":" + m.lead0(2) + ":" + s.lead0(2);
    } else {
        var m = Math.floor(time / 60);
        var s = Math.floor(time % 60);
                    
        return m.lead0(2) + ":" + s.lead0(2);
    }
}
            
Number.prototype.lead0 = function(n) {
    var nz = "" + this;
    while (nz.length < n) {
        nz = "0" + nz;
    }
    return nz;
};