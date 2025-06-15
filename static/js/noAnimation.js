window.addEventListener('resize', () => {
    const allElements = document.querySelectorAll('*');

    allElements.forEach(el => {
        const animationName = window.getComputedStyle(el).animationName;
        const transitionName = window.getComputedStyle(el).transitionProperty;

        if (animationName !== 'none' || transitionName !== 'none') {
            el.classList.add('no-animation');
        }
    });

    setTimeout(() => {
        allElements.forEach(el => {

            el.classList.remove('no-animation');
            
        });
    }, 300);
});