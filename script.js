const toggleBtn = document.querySelector('.side-toggle');
const sidebar = document.querySelector('.side-panel');
const wrapper = document.querySelector('#wrapper');

const homePage = document.querySelector('.home-content');
const statPage = document.querySelector('.statistics-content');
const taskPage = document.querySelector('.task-content');
const comPage = document.querySelector('.community-content');

const buttons = document.querySelectorAll('.panel-item');

const panelItems = [homePage, statPage, comPage, taskPage];

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

const closeTask = document.querySelector('.close-task-panel')
const taskboxes = document.querySelectorAll('.task-det');
const taskPanel = document.querySelector('.detailed-task-panel')
for(let i = 0; i < taskboxes.length; i++){
    taskboxes[i].addEventListener('click', function(){
        taskPanel.classList.toggle('detailed-task-panel-open')
    })
}
closeTask.addEventListener('click', function(){
    taskPanel.classList.remove('detailed-task-panel-open')
})
