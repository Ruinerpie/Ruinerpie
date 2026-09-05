const topBar = document.querySelector('.top-bar');
const SCROLL_THRESHOLD = 150;
let ticking = false;

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            if (window.scrollY > SCROLL_THRESHOLD) {
                topBar.classList.add('is-collapsed');
            } else {
                topBar.classList.remove('is-collapsed');
            }
            ticking = false;
        });
        ticking = true;
    }
});