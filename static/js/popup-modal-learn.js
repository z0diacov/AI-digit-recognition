document.addEventListener("DOMContentLoaded", () => {
    const deleteModal = document.getElementById("deleteModal");
    const closeModal = document.getElementById("closeDeleteModal");
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    const cancelDeleteBtn = document.getElementById("cancelDelete");
    let targetToDelete = null;

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-canvas")) {
            targetToDelete = event.target.closest(".canvas-wrapper");
            deleteModal.style.display = "flex";
        }
    });

    closeModal.addEventListener("click", () => {
        deleteModal.style.display = "none";
    });

    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.style.display = "none";
    });

    confirmDeleteBtn.addEventListener("click", () => {
        if (targetToDelete) {
            targetToDelete.remove();
            targetToDelete = null;
        }
        deleteModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === deleteModal) {
            deleteModal.style.display = "none";
        }
    });
});
