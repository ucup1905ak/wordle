# Wordle

A Wordle clone built with plain HTML, CSS and JavaScript — no framework, no build step.

**Live:** https://wordle.farelino.cloud

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

Then visit http://127.0.0.1:8000.

## How to play

Type with your keyboard, or tap the on-screen keys. Six guesses, five letters each.
Green means the letter is in the right spot, yellow means it is in the word but
somewhere else, grey means it is not in the word. Press Enter to submit a guess,
Backspace to delete a letter. After the game ends, press Enter or the Play Again
button to start a new round.

## Files

```
index.html          markup: 6x5 board, on-screen keyboard, end screen
styles/style.css    theme, tile flip animation, phone layout
src/words.js        two word lists: ANSWERS and ALLOWED
src/word-picker.js  chooses the answer, plus word frequency data
src/script.js       the Wordle class: state, input, scoring, win/lose
CNAME               custom domain for GitHub Pages
```

## How the answer is chosen

Not a plain `Math.random()` over the word list — English starting letters are
wildly uneven (S starts 16% of common five-letter words), so the picker:

1. picks a first letter, uniform over the 25 letters that have answers
2. picks a last letter, uniform over the endings that exist for that first letter
3. filters to words matching both, samples up to 50
4. sorts that sample by how common the word is and returns the one matching the
   requested difficulty (`easy` = commonest, `hard` = rarest, none = random)

Commonness comes from `wordfreq` Zipf scores; `FREQ` in `word-picker.js` holds the
raw corpus counts so the ranking is computed in the browser.

## The word lists

`ALLOWED` (14,855 words) is every guess the game accepts. `ANSWERS` (2,015 words)
is the narrower pool an answer can come from, filtered by:

- frequency — wordfreq Zipf >= 2.6, so obscure words are out
- no sexual or political terms
- no word whose only meaning is a proper noun (words like `china` and `turkey`
  stay, because they are also ordinary nouns)
- no regular plurals (`foxes`) and no regular `-ed` past forms (`tried`)
- American spelling

Words removed from `ANSWERS` can still be typed as guesses.

## Deploy

Static files on GitHub Pages, behind Cloudflare at `wordle.farelino.cloud`
(CNAME record proxied, zone SSL mode `Full`, Always Use HTTPS on). Pushing to
`main` rebuilds the site. Asset links carry a `?v=` query string — bump it when
changing CSS or JS so browsers and the CDN pick up the new file.
