document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal-content');
    const resizeHandle = document.querySelector('.resize-handle');

    let isResizing = false;
    let startY;
    let startHeight;
    let startTop;
    const minHeight = 200;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = modal.offsetHeight;
        startTop = modal.getBoundingClientRect().top;

        document.body.style.cursor = 'ns-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const deltaY = startY - e.clientY;
            const maxHeight = window.innerHeight;
            let newHeight = startHeight + deltaY;
            let newTop = startTop - deltaY;

            if (newHeight < minHeight) {
                newHeight = minHeight;
                newTop = startTop - (minHeight - startHeight);
            }

            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newTop = startTop - (maxHeight - startHeight);
            }

            modal.style.height = `${newHeight}px`;
            modal.style.top = `${newTop}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
        }
    });
});
