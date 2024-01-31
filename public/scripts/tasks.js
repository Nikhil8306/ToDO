const loadingBar = document.querySelector(".loading");
const taskBody = document.querySelector(".task-body")
const addTaskInp = document.querySelector(".add-task-field")
const addTaskBtn = document.querySelector(".add-task-button")
const myTasksBtn = document.querySelector(".my-task")

const taskTitle = document.querySelector(".taskDetails")
const taskDescription = document.querySelector(".taskDescription")
const isImportant = document.querySelector(".isImportant")
const repeatDaily = document.querySelector(".repeatDaily")
const taskDueTime = document.querySelector(".taskDueTime")
const saveTaskBtn = document.querySelector(".saveTask")

const taskDetailPanel = document.querySelector(".task-details-panel")

let tasks = []
let currTaskDet = -1

fetchPersonalTasks()
myTasksBtn.addEventListener("click", function(){
    fetchPersonalTasks()
})

saveTaskBtn.addEventListener("click", async function(){
    body = {}
    if (!taskTitle.value){
        showNotification("Please add title")
        return
    }
    body.taskId = tasks[currTaskDet]._id
    body.title = taskTitle.value
    body.description = taskDescription.value
    body.isImportant = isImportant.checked
    body.repeatDaily = repeatDaily.checked

    if (taskDueTime.value){

        body.dueTime = new Date(taskDueTime.value)
    }
    
    const data = await fetch(baseUrl+'board/tasks', {
        method:"PATCH",
        headers:{
            'Content-Type': 'application/json',
            auth_token:getCookie("auth_token")
        },
        body:JSON.stringify(body)
    })
    if (data.status != 200){
        showNotification("Cannot save task")
        return
        
    }

    fetchPersonalTasks()
})

addTaskBtn.addEventListener("click", async function(){
    if (addTaskInp.value.length > 0){
        const data = await fetch(baseUrl+'board/tasks', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                "auth_token":getCookie("auth_token"),
                "workarea":'Personal'
            },
            body: JSON.stringify({title:addTaskInp.value,description:"", isImportant:false, repeatDaily:false})
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
    loadingBar.classList.add("display-loading")
    
    const res = await fetch(baseUrl+'board/tasks', {
        method : 'GET',
        headers:{
            "auth_token":getCookie("auth_token"),
            "workarea":'Personal'
        }
    })
    if (res.status !== 200){
        loadingBar.classList.remove("display-loading")
        showNotification("Cannot load your tasks")
        return
    }
    taskBody.innerHTML = `<div class="task-box invisible-task-box"></div>`
    tasks = await res.json()
    loadingBar.classList.remove("display-loading")
    for(let i = 0; i < tasks.length; i++){
        const currTask = taskBox(tasks[i].title, tasks[i].dueTime, tasks[i].repeatDaily, "pending")
        taskBody.prepend(currTask)
        currTask.children[0].addEventListener('click', function(){
            detailPanel.classList.add("detail-panel-open")
            taskDetailPanel.classList.remove('hide')
            taskTitle.value = tasks[i].title
            taskDescription.value = tasks[i].description
            isImportant.checked = tasks[i].isImportant
            repeatDaily.checked = tasks[i].repeatDaily
            if (tasks[i].dueTime){ 
                const tm = new Date(tasks[i].dueTime)
                tm.setMinutes(tm.getMinutes() + 330)
                taskDueTime.value = tm.toISOString().slice(0, 16)
            }
            else taskDueTime.value = ""
            currTaskDet = i
        })
        
    }
}


function taskBox(taskName, dueTime, isHabit, taskStatus){
    let time = ""
    if (dueTime){
        const dueDate = new Date(dueTime)
        time += dueDate.getDate().toString().padStart(2, "0")
        time+="-"
        time += (dueDate.getMonth()+1).toString().padStart(2, "0")
        time+="-"
        time += (dueDate.getFullYear()).toString()
        time += "    "
        time += (dueDate.getHours()%12 || 12).toString().padStart(2, "0")
        time += ":"
        time += dueDate.getMinutes().toString().padStart(2, "0")
        if (dueDate.getHours() >= 12) time += " PM"
        else time += " AM"
    }
    const box = document.createElement('div')
    let habit = ""
    if (isHabit) habit = "Daily"
    box.innerHTML = `
    <div class="task-det">
        <div class="task-name"> 
            ${taskName}
        </div>
        <div class="other-details">
            <div class="due-date">${time}</div>
            <div class="ishabit">${habit}</div>
        </div>
    </div>
    <div class="completion-status">${taskStatus}</div>
    <button class="task-box-2">Delete</button>
    `
    box.classList.add("task-box")

    return box
}
