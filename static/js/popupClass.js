class Popup {
    constructor(id, type, title, message, confirmText = "Yes", cancelText = "No", placeholder, onConfirm, onCancel) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.confirmText = confirmText;
        this.cancelText = cancelText;
        this.placeholder = placeholder;
        this.onConfirmFunc = onConfirm;
        this.onCancelFunc = onCancel;

        this.removeExistingPopup();
        this.createPopup();
        this.initEvents();
    }

    removeExistingPopup() {
        document.querySelectorAll(`#${this.id}`).forEach(el => el.remove());
    }

    createPopup() {
        this.popup = document.createElement("div");
        this.popup.id = this.id;
        this.popup.classList.add(`popup${this.type === "confirm" ? "-confirm" : ""}`);
        this.popup.style.display = "none";

        let content = this.type === "confirm" 
            ? `<div class="popup-confirm-content">
                    <span class="closeConfirm">&times;</span>
                    <p>${this.message}</p>
                    <button class="delete-confirm-btn">${this.confirmText}</button>
                    <button class="delete-cancel-btn">${this.cancelText}</button>
               </div>`
            : `<div class="popup-content">
                    <span class="close">&times;</span>
                    <h2>${this.title}</h2>
                    <input type="text" placeholder="${this.placeholder}" />
                    <button class="action-button">${this.confirmText}</button>
               </div>`;

        this.popup.innerHTML = content;
        document.body.appendChild(this.popup);
    }

    initEvents() {
        const closeBtn = this.popup.querySelector(".close") || this.popup.querySelector(".closeConfirm");
        const confirmBtn = this.popup.querySelector(".delete-confirm-btn") || this.popup.querySelector(".action-button");
        const cancelBtn = this.popup.querySelector(".delete-cancel-btn");
        const inputField = this.popup.querySelector("input");

        if (closeBtn) closeBtn.addEventListener("click", () => this.close());
        if (confirmBtn) confirmBtn.addEventListener("click", () => {
            const value = inputField ? inputField.value : null;
            if (this.onConfirmFunc) this.onConfirmFunc(value);
            this.close();
        });

        if (cancelBtn) cancelBtn.addEventListener("click", () => {
            if (this.onCancelFunc) this.onCancelFunc();
            this.close();
        });

        window.addEventListener("click", (e) => {
            if (e.target === this.popup) this.close();
        });
    }

    open() {
        this.popup.style.display = "flex";
    }

    close() {
        this.popup.style.display = "none";
    }
}

export { Popup };
