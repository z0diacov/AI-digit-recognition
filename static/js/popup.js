import { createFolder as createFolderFunc, deleteFolder } from "./requests.js";
import { Popup } from "./popupClass.js";

function isValidFolderName(folderName) {
    const folderNameRegex = /^(?!\.{1,2}$)[^<>:"/\\|?*\x00-\x1F]+$/;
    return folderNameRegex.test(folderName);
}

const createFolderBtn = document.getElementById("create-folder-btn");
const folderList = document.querySelector(".nn-list");

let liToRemove = null;
let createPopup = null;
let deletePopup = null;

if (createFolderBtn) {
    createFolderBtn.addEventListener("click", () => {
        if (!createPopup) {
            createPopup = new Popup(
                "createFolderPopup",
                "input",
                "Create Folder",
                "",
                "Create",
                "Cancel",
                "Folder name",
                (folderName) => {
                    if (!folderName) return;

                    if (folderName.length > 25) {
                        alert("The name is too long (maximum 25 characters)");
                        return;
                    }

                    if (!isValidFolderName(folderName)) {
                        alert("Invalid name");
                        return;
                    }

                    createFolderFunc(folderName)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === "created") {
                                const li = document.createElement("li");
                                const img = document.createElement("img");
                                img.className = "trash-icon";
                                img.src = folderList.dataset.trashIcon;
                                li.innerHTML = `<a>${folderName}</a>`;
                                li.appendChild(img);
                                folderList.appendChild(li);
                            }
                        })
                        .catch(error => alert("Error: " + error.message));
                }
            );
        }

        createPopup.open();
    });
}

if (folderList) {
    folderList.addEventListener("click", (event) => {
        if (event.target.closest("img.trash-icon")) {
            liToRemove = event.target.closest("li");

            if (!deletePopup) {
                deletePopup = new Popup(
                    "deleteFolderPopup",
                    "confirm",
                    "Delete Folder",
                    "Are you sure you want to delete this folder?",
                    "Yes",
                    "No",
                    "",
                    async () => {
                        if (liToRemove) {
                            await deleteFolder(liToRemove.querySelector("a").textContent.trim())
                            .then(response => {
                                if (response.ok) {
                                    return response.json();
                                }
                            })
                            .then(data => {
                                if (data.status === 'redirect') {
                                    window.location.href = data.url;
                                } else if (data.status === 'notExist') {
                                    alert(data.message);
                                }
                            })
                            .catch(error => {
                                console.error("Error:", error);
                                alert("Error: " + error.message);
                            });
                        }
                    }
                );
            }

            deletePopup.open();
        }
    });
}
