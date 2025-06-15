function deleteCanvas(button) {
    const canvasWrapper = button.closest('.canvas-wrapper');
    if (canvasWrapper) {
        canvasWrapper.remove();
    }
}
