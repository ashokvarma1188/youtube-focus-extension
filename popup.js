const button = document.getElementById("toggleBtn");

let enabled = true;

button.innerText = "Disable Focus";

button.addEventListener("click", () => {

    enabled = !enabled;

    chrome.storage.local.set({
        focusMode: enabled
    });

    if (enabled) {
        button.innerText = "Disable Focus";
    } else {
        button.innerText = "Enable Focus";
    }

});


//Timer
const timer = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
let timeLeft = 25 * 60;
let interval;


// START TIMER
startBtn.addEventListener("click", () => {
    clearInterval(interval);
    interval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        timer.innerText = `${minutes}:${seconds}`;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(interval);
            timer.innerText = "Time's Up!";
        }
    }, 1000);
});



// STOP TIMER
stopBtn.addEventListener("click", () => {
    clearInterval(interval);
});



// RESET TIMER
resetBtn.addEventListener("click", () => {
    clearInterval(interval);
    timeLeft = 25 * 60;
     timer.innerText = "25:00";
});