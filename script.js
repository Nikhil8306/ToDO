const toggleBtn = document.querySelector('.side-toggle');
const sidebar = document.querySelector('.side-panel');
const wrapper = document.querySelector('#wrapper');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('sidebar-open');
});
