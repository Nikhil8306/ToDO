const toggleBtn = document.querySelector('.side-toggle');
const sidebar = document.querySelector('.side-panel');
toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('sidebar-open');
});