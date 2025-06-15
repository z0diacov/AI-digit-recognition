document.getElementById("backButton").addEventListener("click", () => {
    window.history.back();
});

document.getElementById("learning-btn").addEventListener("click", function () {
    let urlParts = window.location.href.split("/");
    urlParts[urlParts.length - 1] = "learning"; 
    
    window.location.href = urlParts.join("/");
});