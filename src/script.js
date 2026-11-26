class Wordle {
    static MAX_ROWS = 6;
    static WORD_LENGTH = 5;
    static FLIP_DELAY = 150;
    static FLIP_HALF = 250;

    tile_id =
    [["a0", "a1", "a2", "a3", "a4"],
    ["b0", "b1", "b2", "b3", "b4"],
    ["c0", "c1", "c2", "c3", "c4"],
    ["d0", "d1", "d2", "d3", "d4"],
    ["e0", "e1", "e2", "e3", "e4"],
    ["f0", "f1", "f2", "f3", "f4"]];

    key_id = [
        ["key_q", "key_w", "key_e", "key_r", "key_t", "key_y", "key_u", "key_i", "key_o", "key_p"],
        ["key_a", "key_s", "key_d", "key_f", "key_g", "key_h", "key_j", "key_k", "key_l"],
        ["key_enter", "key_z", "key_x", "key_c", "key_v", "key_b", "key_n", "key_m", "key_backspace"]
    ];
    constructor() {
        this.reset();
    }

    reset() {
        this.answer = pickWord();
        this.buffer = Array(Wordle.MAX_ROWS).fill("");
        this.currentIndex = 0;
        this.gameOver = false;
        this.startTime = performance.now();
        // back to the board
        document.getElementById("winscreen").classList.add("hidden");
        document.getElementById("keyboard").style.display = "";
        // clear the board so a new game can flip its tiles again
        for (const row of this.tile_id) for (const id of row) {
            const t = document.getElementById(id);
            t.className = "tile";
            t.textContent = "";
            t.style.animationDelay = "";
        }
        // and clear the key colours (keeps "wide" on enter/backspace)
        for (const row of this.key_id) for (const id of row) {
            document.getElementById(id).classList.remove("correct", "present", "absent");
        }
    }

    showEnd(won) {
        const secs = Math.round((performance.now() - this.startTime) / 1000);
        const m = Math.floor(secs / 60);
        const s = String(secs % 60).padStart(2, "0");
        const guesses = this.currentIndex + 1;
        document.getElementById("wintitle").textContent = won ? "You win!" : "You lose";
        document.getElementById("wintime").textContent = won
            ? `Solved in ${m}:${s} - ${guesses} ${guesses === 1 ? "guess" : "guesses"}`
            : `Out of guesses in ${m}:${s} - the word was ${this.answer.toUpperCase()}`;
        document.getElementById("winscreen").classList.toggle("lost", !won);
        this.buildMini();
        document.getElementById("keyboard").style.display = "none";
        document.getElementById("winscreen").classList.remove("hidden");
    }

    // the share grid: one small square per letter, colour only
    buildMini() {
        const wrap = document.getElementById("minigrid");
        wrap.innerHTML = "";
        const lastRow = Math.min(this.currentIndex, Wordle.MAX_ROWS - 1);
        for (let r = 0; r <= lastRow; r++) {
            if (this.buffer[r].length === 0) continue;
            const row = document.createElement("div");
            row.className = "minirow";
            for (let i = 0; i < Wordle.WORD_LENGTH; i++) {
                const letter = this.buffer[r][i];
                const cell = document.createElement("div");
                cell.className = "minicell " + (letter === this.answer[i] ? "correct"
                              : this.answer.includes(letter) ? "present" : "absent");
                row.appendChild(cell);
            }
            wrap.appendChild(row);
        }
    }

    checkCharacter() {
        //show Letter Colors
        // - Correct color Green
        // - Correct letter but wrong position Yellow
        // - Wrong letter Gray
        for (let i = 0; i < Wordle.WORD_LENGTH; i++) {
            const tile = document.getElementById(this.tile_id[this.currentIndex][i]);
            const letter = this.buffer[this.currentIndex][i];
            const cls = letter === this.answer[i] ? "correct"
                      : this.answer.includes(letter) ? "present" : "absent";
            // flip this tile, then reveal the colour when it is edge-on (half way)
            tile.style.animationDelay = (i * Wordle.FLIP_DELAY / 1000) + "s";
            tile.classList.add("flip");
            setTimeout(() => {
                tile.classList.add(cls);
                this.paintKey(letter, cls);
            }, Wordle.FLIP_HALF + i * Wordle.FLIP_DELAY);
        }
    }

    // correct beats present beats absent: a green key never goes grey again
    paintKey(letter, cls) {
        const key = document.getElementById("key_" + letter);
        if (!key) return;
        const rank = { absent: 0, present: 1, correct: 2 };
        const has = ["correct", "present", "absent"].find(c => key.classList.contains(c));
        if (has && rank[has] >= rank[cls]) return;
        key.classList.remove("correct", "present", "absent");
        key.classList.add(cls);
    }

    update(event) {
        if(!event) event = {key: ""};
        if(this.gameOver) {                  // game finished: Enter starts a new one
            if(event.key === "Enter") {
                document.querySelector("h1").textContent = "Wordle";
                this.reset();
            }
            return;
        }
        if(this.currentIndex >= Wordle.MAX_ROWS) {
            return;
        }
        if(event.key === "Enter" && this.buffer[this.currentIndex].length == Wordle.WORD_LENGTH) {
            if(this.buffer[this.currentIndex] === this.answer) { // WINNING CONDITION
                this.checkCharacter();
                this.gameOver = true;
                // let the flip finish before covering the board
                setTimeout(() => this.showEnd(true), 900);
                return;
            } else if(ALLOWED.includes(this.buffer[this.currentIndex]) === true) { //NEXT GUESS
                this.checkCharacter();
                this.currentIndex++;
                if(this.currentIndex >= Wordle.MAX_ROWS) { // LOSING CONDITION
                    this.gameOver = true;
                    setTimeout(() => this.showEnd(false), 900);
                }
                return; // new row is empty, nothing to draw
            }
        }
        if(event.key.match(/^[a-zA-Z]$/)) {
            if(this.buffer[this.currentIndex].length >= Wordle.WORD_LENGTH) return;
            this.buffer[this.currentIndex] += event.key.toLowerCase();
        }
        if(event.key === "Backspace") {
            this.buffer[this.currentIndex] = this.buffer[this.currentIndex].slice(0, -1);
        }

        let count = 0;
        this.tile_id[this.currentIndex].forEach((id) => {
            document.getElementById(id).textContent = this.buffer[this.currentIndex].at(count) || "";
            count++;
        });


       

    }
}

let app = new Wordle();
addEventListener("keydown", (e) => app.update(e));
document.getElementById("resetbtn").addEventListener("click", () => app.reset());
