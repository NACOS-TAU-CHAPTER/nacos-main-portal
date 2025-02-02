document.addEventListener('DOMContentLoaded', function() {
    eventButton = document.getElementById("events-btn");
    profileButton = document.getElementById("profile-btn");
    eventButton.addEventListener("click", function() {
        document.getElementById("profile").style.display = "none";
        document.getElementById("events").style.display = "block";
        eventButton.classList.add("active");
        profileButton.classList.remove("active");
    });
    profileButton.addEventListener("click", function() {
        document.getElementById("events").style.display = "none";
        document.getElementById("profile").style.display = "block";
        profileButton.classList.add("active");
        eventButton.classList.remove("active");
    });
});