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
