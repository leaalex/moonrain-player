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
