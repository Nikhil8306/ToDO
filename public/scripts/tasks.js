const loadingBar = document.querySelector(".loading");
const taskBody = document.querySelector(".task-body")
const addTaskInp = document.querySelector(".add-task-field")
const addTaskBtn = document.querySelector(".add-task-button")
const myTasksBtn = document.querySelector(".my-task")

fetchPersonalTasks()
myTasksBtn.addEventListener("click", function(){
    fetchPersonalTasks()
})
addTaskBtn.addEventListener("click", async function(){
    if (addTaskInp.value.length > 0){
        const data = await fetch('board/tasks', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                "auth_token":getCookie("auth_token"),
                "workarea":'Personal'
            },
            body: JSON.stringify({title:addTaskInp.value,description:"",reminder:false})
        })
        if (data.status !== 200){
            showNotification("Something went wrong, task not added")
            return
        }
        fetchPersonalTasks()
    }
})

// Functions
async function fetchPersonalTasks(){
    loadingBar.classList.toggle("display-loading")
    taskBody.innerHTML = `<div class="task-box invisible-task-box"></div>`
    const res = await fetch('board/tasks', {
        method : 'GET',
        headers:{
            "auth_token":getCookie("auth_token"),
            "workarea":'Personal'
        }
    })
    if (res.status !== 200){
        showNotification("Cannot load your tasks")
        return
    }
    const tasks = await res.json()
    loadingBar.classList.toggle("display-loading")
    for(let i = 0; i < tasks.length; i++){
        taskBody.prepend(taskBox(tasks[i].title, "10 feb", true, "pending"))
    }
}


function taskBox(taskName, dueDate, isHabit, taskStatus){
    const box = document.createElement('div')
    let habit = ""
    if (isHabit) habit = "habit"
    box.innerHTML = `
    <div class="task-det">
        <div class="task-name"> 
            ${taskName}
        </div>
        <div class="other-details">
            <div class="due-date">${dueDate}</div>
            <div class="ishabit">${habit}</div>
        </div>
    </div>
    <div class="completion-status">${taskStatus}</div>
    <div class="task-box-2">Delete</div>
    `
    box.classList.add("task-box")
    box.children[0].addEventListener('click', function(){
        taskPanel.classList.toggle('detailed-task-panel-open')
    })
    return box
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