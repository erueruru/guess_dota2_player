const input = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const suggestionsList = document.getElementById("suggestions");
const guessesDiv = document.getElementById("guesses");
const attemptsDiv = document.getElementById("attempts");
const messageDiv = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

let composing = false;
let gameOver = false;

input.addEventListener("compositionstart", () => { composing = true; });
input.addEventListener("compositionend", () => { composing = false; });

input.addEventListener("input", async () => {
    if (gameOver) return;
    const query = input.value.trim();
    if (!query) { suggestionsList.innerHTML = ""; return; }
    const res = await fetch(`/suggest?q=${query}`);
    const suggestions = await res.json();
    suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join("");
});

suggestionsList.addEventListener("click", (e)=>{
    if(e.target.tagName==="LI"){
        input.value = e.target.innerText;
        suggestionsList.innerHTML = "";
        submitGuess();
    }
});

input.addEventListener("keydown",(e)=>{
    if(e.key==="Enter" && !composing && !gameOver){
        e.preventDefault();
        submitGuess();
    }
});

guessBtn.addEventListener("click", ()=>{
    submitGuess();
});

async function submitGuess(){
    if(gameOver) return;
    const guess_id = input.value.trim();
    if(!guess_id) return;

    const res = await fetch("/guess", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({id: guess_id})
    });
    const data = await res.json();
    if(data.error){ alert(data.error); return; }

    const card = document.createElement("div");
    card.className = "guess-card";

    const attrs = ["id","team","country","age","ti_count","position"];

    attrs.forEach(key=>{
        const div = document.createElement("div");
        let value = data.guess_player[key];

        // 年龄箭头 + 接近黄色
        if(key==="age"){
            if(data.guess_player.age === data.target_player.age){
                div.classList.add("correct");
            } else {
                value += data.guess_player.age < data.target_player.age ? "⬇️" : "⬆️";
                // 接近 ±2 标黄色
                if(Math.abs(data.guess_player.age - data.target_player.age) <= 2){
                    div.classList.add("close");
                } else {
                    div.classList.add("wrong");
                }
            }
        }

        // TI 次数箭头 + 接近黄色
        if(key==="ti_count"){
            if(data.guess_player.ti_count === data.target_player.ti_count){
                div.classList.add("correct");
            } else {
                value += data.guess_player.ti_count < data.target_player.ti_count ? "⬇️" : "⬆️";
                if(Math.abs(data.guess_player.ti_count - data.target_player.ti_count) <= 1){
                    div.classList.add("close");
                } else {
                    div.classList.add("wrong");
                }
            }
        }

        // 其他字段
        if(key==="team" || key==="country" || key==="position"){
            if(data.result[key] === "correct") div.classList.add("correct");
            else if(data.result[key] === "close") div.classList.add("close");
            else div.classList.add("wrong");
        }

        div.innerText = value;
        card.appendChild(div);
    });

    guessesDiv.prepend(card);
    attemptsDiv.innerText = `剩余机会: ${data.attempts_left}`;
    input.value = "";
    suggestionsList.innerHTML = "";

    if(data.correct){
        messageDiv.innerText = "恭喜你猜对了！🎉";
        gameOver = true;
        restartBtn.style.display = "inline-block";
    } else if(data.attempts_left <= 0){
        messageDiv.innerText = "机会用完，游戏结束！";
        gameOver = true;
        restartBtn.style.display = "inline-block";
    }
}

restartBtn.addEventListener("click", ()=>{
    location.reload();
});
