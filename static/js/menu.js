const flipButton = document.getElementById('flip-button');
const canvasContainer = document.querySelector('.canvas-container');

const menu = document.getElementById('menu');
const mainContainer = document.querySelector('.main-container');
const menuBtn = document.getElementById("open-menu");
const openMenuBtn = document.getElementById('open-menu');

window.addEventListener('load', () => {

    const isMenuActive = localStorage.getItem('menu_active') === 'true';

    mainContainer.classList.add('no-animation');

    if (isMenuActive) {
        menu.classList.add('menu_active', 'no-animation');
        mainContainer.classList.add('content_active', 'no-animation');
        openMenuBtn.checked = "checked";
    } else {
        menu.classList.remove('menu_active');
        mainContainer.classList.remove('content_active');
    }

    setTimeout(() => {
        menu.classList.remove('no-animation');
        mainContainer.classList.remove('no-animation');
    }, 500);
});


menuBtn.addEventListener('click', () => {

    const isCurrentlyActive = menu.classList.contains('menu_active');

    menu.classList.toggle('menu_active');
    mainContainer.classList.toggle('content_active');

    localStorage.setItem('menu_active', !isCurrentlyActive);
});


const folderList = document.querySelector(".nn-list");
const trashIconUrl = folderList.dataset.trashIcon;

folderList.querySelectorAll(".trash-icon").forEach(icon => {

    icon.src = trashIconUrl;

});

folderList.addEventListener("click", (event) => {

    let liToPageGet = event.target.closest('li');

    if (liToPageGet && !event.target.closest('img.trash-icon')) {

        window.location.href = `/AI/${liToPageGet.querySelector('a').textContent.trim()}`;
        
    }

});