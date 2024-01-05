const toggleBtn = document.querySelector('.side-toggle');
const sidebar = document.querySelector('.side-panel');
toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('sidebar-open');
});

function reportWindowSize() {
    let height = window.innerHeight;
    const wrapper = document.querySelector('#wrapper');
    wrapper.style.height = height+'px';
}
reportWindowSize();
window.onresize = reportWindowSize;
