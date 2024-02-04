const commBtn = document.querySelector(".communities")
const commBody = document.querySelector(".comm-body")
const addCommBtn = document.querySelector(".add-comm-btn")
const addCommPage = document.querySelector(".add-community")
const saveCommBtn = document.querySelector("button[value=add-community]")
const commForm = document.querySelector(".add-comm-form")
const addMemberBtn = document.querySelector(".add-member")
const addMemberInp = document.querySelector(".add-member-input")
const workspaceDetails = document.querySelector(".workspace-details")
const workspaceAddTask = document.querySelector(".workspace-add-task")
const workspaceAddTaskBtn = document.querySelector(".add-workspace-task-button")
const workspaceTaskTitle = document.querySelector(".add-workspace-task-field")

const showMembers = document.querySelector(".show-members")
const membersBox = document.querySelector(".members-box")
const membersList = document.querySelector(".members-list")
const closeMemberBox = document.querySelector(".close-member-box")
const workspaceTaskHead = document.querySelector(".workspace-task-heading")
const workspaceTasks = document.querySelector(".workspace-tasks")

let workspaces = []
let members = []
let membersMail = []
let membersName = []
let currWorkspace = -1
let currUser = null


closeMemberBox.addEventListener("click", function(){
    membersBox.classList.remove("show-members-box")
})
showMembers.addEventListener("click", function(){
    membersBox.classList.add("show-members-box")
    membersList.innerHTML = ""
    for(let i = 0; i < membersMail.length; i++){
        const btn = document.createElement("button")
        btn.innerHTML = membersName[i]
        membersList.append(btn)
        btn.addEventListener("click", function(){
            currUser = members[i]
            membersBox.classList.remove("show-members-box")
            fetchWorkspaceTasks()
            const fName = membersName[i].split(" ")[0]
            if (fName == 'You') workspaceTaskHead.innerHTML = 'Your Todo :'
            else workspaceTaskHead.innerHTML = fName + "'s Todo :"
        })
    }
})

workspaceAddTaskBtn.addEventListener("click", async function(){
    const data = await fetch(baseUrl+"board/tasks", {
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            auth_token:getCookie("auth_token"),
            workArea:"Team"
        },
        body:JSON.stringify({
            workspaceId:workspaces[currWorkspace]._id,
            userId:currUser,
            title:workspaceTaskTitle.value,
            description:"",
            isImportant:false,
            repeatDaily:false
        })
    })

    if (data.status != 200){
        showNotification("Task not added")
        return
    }
    fetchWorkspaceTasks()
    showNotification("Successfully added task")
})

commBtn.addEventListener("click", function(){
    commBody.classList.remove("hide")
    addCommBtn.classList.remove("hide")
    addCommPage.classList.add("hide")
    workspaceDetails.classList.add("hide")
    workspaceAddTask.classList.add("hide")
    fetchCommunities()
})

addCommBtn.addEventListener("click", function(){
    commBody.classList.add("hide")
    addCommBtn.classList.add("hide")
    addCommPage.classList.remove("hide")
    members = []
})

saveCommBtn.addEventListener("click", async function(){
    const currForm = new FormData(commForm, saveCommBtn)
    if (!validForm(currForm)){
        showNotification("Please fill all the required sections !!!")
        return
    }

    const data = await fetch(baseUrl+'/board/workspaces', {
        headers:{
            'Content-Type': 'application/json',
            auth_token:getCookie("auth_token")
        },
        method:'POST',
        body: JSON.stringify({
            workName:currForm.get('commInputName'),
            memberId:members,
            description:currForm.get('commDescription'),
            startDate:new Date(currForm.get('startDate')),
            endDate: new Date(currForm.get('endDate'))
        })
    })

    if (data.status !== 200){
        showNotification("Something went wrong, cannot create workspace properly")
        return;
    }
    showNotification("Workspace Added successfully")
    fetchCommunities()
    
    commBody.classList.remove("hide")
    addCommBtn.classList.remove("hide")
    addCommPage.classList.add("hide")
})

addMemberBtn.addEventListener('click', function(){
    if (addMemberInp.value == "") {
        showNotification("Please provide valid member")
        return
    }
    members.push(addMemberInp.value)
    addMemberInp.value = ""
})

async function fetchCommunities(){
    loadingBar.classList.add("display-loading")
    const data = await fetch(baseUrl+'board/workspaces', {
        method:"GET",
        headers:{
            'Content-Type': 'application/json',
            auth_token:getCookie("auth_token")
        }
    })

    loadingBar.classList.remove('display-loading')

    if (data.status !== 200){
        showNotification("Cannot load Workspaces")
        return
    }
    workspaces = await data.json()
    
    commBody.innerHTML = '<div class="task-box invisible-task-box"></div>'
    for(let i = 0; i < workspaces.length; i++){
        const box = addCommunityBox(workspaces[i].name, workspaces[i].admin, "pending")
        commBody.prepend(box)
        box.children[0].addEventListener("click", function(){
            commBody.classList.add("hide")
            addCommBtn.classList.add("hide")
            workspaceDetails.classList.remove("hide")
            currWorkspace = i
            members = workspaces[currWorkspace].members
            membersMail = workspaces[currWorkspace].membersMail
            membersName = workspaces[currWorkspace].membersName
            currUser = members[0]
            if (workspaces[currWorkspace].admin){
                workspaceAddTask.classList.remove('hide')
            }
            fetchWorkspaceTasks()
        })
    }

}

async function fetchWorkspaceTasks(){
    loadingBar.classList.add("display-loading")
    workspaceTaskHead.innerHTML = 'Your Todo :'
    const data = await fetch(baseUrl+"board/tasks", {
        method:"GET",
        headers:{
            'Content-Type': 'application/json',
            auth_token:getCookie("auth_token"),
            workArea:"Team",
            userId:currUser,
            workspaceId:workspaces[currWorkspace]._id
        }
    })
    loadingBar.classList.remove("display-loading")
    if (data.status != 200){
        showNotification("Cannot load the tasks")
        return
    }
    tasks = await data.json()
    workspaceTasks.innerHTML = ""
    for(let i = 0; i < tasks.length; i++){
        workspaceTasks.append(workspaceTaskBox(tasks[i].title))
    }

}

function workspaceTaskBox(title){
    const box = document.createElement("div")

    box.innerHTML = 
        `<div class="task-det">
            <div class="task-name"> 
                <input type="checkbox">
                ${title}
            </div>
            <div class="other-details">
                <div class="due-date"></div>
                <div class="important-tag"></div>
                <div class="ishabit"></div>
            </div>
        </div>
        <div class="completion-status">pending</div>
        <div class="workspace-task-delete">Delete</div>`


    box.classList.add("task-box")
    return box
}

function addCommunityBox(name, isAdmin, status){
    let admin = ""
    if (isAdmin) admin='admin'
    let access = "leave"
    if (isAdmin) access = "Delete"
    let commBox = document.createElement("div")
    commBox.innerHTML = `
    <div class="comm-det">
        <div class="comm-name"> 
            ${name}
        </div>
        <div class="other-details">
            <div class="isadmin">${admin}</div>
        </div>
    </div>
    <div class="completion-status">${status}</div>
    <div class="comm-box-2">${access}</div>
    `
    commBox.classList.add('comm-box')
    return commBox
}
function validForm(form){
    for (const [key, value] of form) {
        if (key != 'addMember' && value == "") return false
    }
    return true;
}

