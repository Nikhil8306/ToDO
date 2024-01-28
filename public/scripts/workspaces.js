const commBtn = document.querySelector(".communities")
const commBody = document.querySelector(".comm-body")
const addCommBtn = document.querySelector(".add-comm-btn")
const addCommPage = document.querySelector(".add-community")
const saveCommBtn = document.querySelector("button[value=add-community]")
const commForm = document.querySelector(".add-comm-form")
const addMemberBtn = document.querySelector(".add-member")
const addMemberInp = document.querySelector(".add-member-input")

let members = []
commBtn.addEventListener("click", function(){
    commBody.classList.remove("hide")
    addCommBtn.classList.remove("hide")
    addCommPage.classList.add("hide")
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
    fetchCommunities()
    showNotification("Workspace Added successfully")
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
            auth_token:getCookie("auth_token")
        }
    })

    loadingBar.classList.remove('display-loading')

    if (data.status !== 200){
        showNotification("Cannot load Workspaces")
        return
    }
    const workspaces = await data.json()
    commBody.innerHTML = '<div class="task-box invisible-task-box"></div>'
    for(let i = 0; i < workspaces.length; i++){
        commBody.prepend(addCommunityBox(workspaces[i].name, workspaces[i].admin, "pending"))
    }
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

