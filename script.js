const toggleBtn = document.querySelector('.side-toggle');
const sidebar = document.querySelector('.side-panel');
const wrapper = document.querySelector('#wrapper');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('sidebar-open');
});

// function reportWindowSize() {
//     let height = window.innerHeight;
//     wrapper.style.height = 100+'px';
// }

// reportWindowSize();
// window.onresize = reportWindowSize;
