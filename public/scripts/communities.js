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

    const data = await fetch('/board/communities', {
        headers:{
            'Content-Type': 'application/json',
            auth_token:getCookie("auth_token")
        },
        method:'POST',
        body: JSON.stringify({
            commName:currForm.get('commInputName'),
            memberId:members,
            description:currForm.get('commDescription'),
            startDate:new Date(currForm.get('startDate')),
            endDate: new Date(currForm.get('endDate'))
        })
    })

    if (data.status !== 200){
        showNotification("Something went wrong, cannot create community properly")
        return;
    }
    showNotification("Community Added successfully")
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

function validForm(form){
    for (const [key, value] of form) {
        if (key != 'addMember' && value == "") return false
    }
    return true;
}

