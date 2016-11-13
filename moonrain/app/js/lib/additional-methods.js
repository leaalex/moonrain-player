// Вспомогательные методы

// Методы расширения возможностей стандартных DOM обектов
Element.prototype.appendChildren = function(){
    for (var key in arguments){
        this.appendChild(arguments[key]);
    }
};
