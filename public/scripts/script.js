
const toggleBtn = document.querySelector('.side-toggle');
const sidebar = document.querySelector('.side-panel');
const wrapper = document.querySelector('#wrapper');

const homePage = document.querySelector('.home-content');
const statPage = document.querySelector('.statistics-content');
const taskPage = document.querySelector('.task-content');
const comPage = document.querySelector('.community-content');

const notification = document.querySelector('.notification');
const buttons = document.querySelectorAll('.panel-item');


const panelItems = [homePage, statPage, comPage, taskPage];

const baseUrl = ''

for(let i = 0; i < 4; i++){
    buttons[i].addEventListener("click", function(){
        for(let j = 0; j < 4; j++){
            if (!panelItems[j].classList.contains('hide')) panelItems[j].classList.toggle('hide');
        }

        panelItems[i].classList.remove('fade-animation');
        panelItems[i].classList.add('fade-animation');
        panelItems[i].classList.toggle('hide');
    })
}

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('sidebar-open');
});

notification.addEventListener('click', function() {
    notification.classList.add('hide-notification')
})

const closeTask = document.querySelector('.close-panel')
const detailPanel = document.querySelector('.detail-panel')

closeTask.addEventListener('click', function(){
    detailPanel.classList.remove('detail-panel-open')
    taskDetailPanel.classList.add('hide')
})

// Functions
function showNotification(message){
    notification.innerHTML = message
    notification.classList.remove('hide-notification')
    setTimeout(function(){
        notification.classList.add('hide-notification')
    }, 5000)
}
function getCookie(c){
    // console.log(document.cookie)
    let value = ""
    document.cookie.split(';').forEach(function(el) {
        let [key,v] = el.split('=');
        if (key == c){
            value = v
            return
        }
    })
    return value
}

const warning = document.querySelector('.warning')
const warningText = document.querySelector('.warning-message')
const warningNo = document.querySelector('.warning-no');
const warningYes = document.querySelector('.warning-yes');

function showWarning(mssg){
    warning.classList.add('show-warning')
    warningText.innerHTML = mssg

    return new Promise(function(resolve,reject){
        warningNo.addEventListener('click', function(){
            warning.classList.remove('show-warning')
            resolve("no")
        })
        warningYes.addEventListener('click', function(){
            warning.classList.remove('show-warning')
            resolve("yes")
        })
    })
}