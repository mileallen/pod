const initVr = {
  level: "L",
  wordA: "",
  link1: "",
  link2: "",
  link3: "",
  wordB: "",

  levelPicked: false,
  fetching: false,
  picked1: false,
  picked2: false,
  picked3: false,

  stage: 0,
  matchFound: false,
  noResults: false,
  qWords: []
}

const wrdy = new Pod('verba', initVr)
wrdy.showExplain = true


function getStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function giveJSON(response) {
  return response.json()
}


async function getList(rel, verbum) {
  wrdy.results.style.opacity = 0
  document.documentElement.style.setProperty('--progCol', `var(--clr_${rel})`)
  wrdy.levelPicked = true
  wrdy.fetching = true
  wrdy.qWords = []
  wrdy.dialogue.innerText = "Thinking..."

  wrdy.qWords = await fetch(`https://api.datamuse.com/words?rel_${rel}=${verbum}&max=5`)
    .then(getStatus)
    .then(giveJSON)
    .catch(function (error) {
      console.log('Request failed', error)
      wrdy.dialogue.innerText = "So sorry, there was some error."
    })
  let wSize = wrdy.qWords.length
  wrdy.results.style.opacity = 1

  if (wSize === 0) {
    if (!wrdy.noResults) wrdy.noResults = true
    wrdy.dialogue.innerText = "Sorry, found no words!"
    wrdy.fetching = false
  } 
  else {
    wrdy.noResults = false
    switch (wrdy.stage) {
      case 3:
        wrdy.qWords.forEach((item, ky) => {
          if (item.word === wrdy.wordB) {
            wrdy.matchFound = true
            wrdy.qWords.set(ky, 'matched', true)
            wrdy.dialogue.innerText = "Cool! You completed the chain!"
          }
        })
        if (wrdy.matchFound === false) wrdy.dialogue.innerText = "Nope, there is a different chain!"
      break
      default:
        wrdy.dialogue.innerText = (wSize > 1 ? "There. Found these " + wSize + " words." : "There. Found this " + wSize + " word.")
      break
    }
  }
  wrdy.fetching = false
}


function pickword(choice) {
  wrdy.stage++
  wrdy.qWords.forEach((obj, ky) => {
    if (obj.word === choice) {
      wrdy.qWords.set(ky, 'pick', true)
    }
    else {
      wrdy.qWords.set(ky, 'kick', true)
    }
  })
  wrdy[`link${wrdy.stage}`] = choice
  wrdy[`picked${wrdy.stage}`] = true
}


function setLevel(){
  if(wrdy.level === '1') wrdy.level = '2'
  else wrdy.level = '1'
  let ix = Math.floor(Math.random() * 10)
  wrdy.wordA = wordPairs[`level${wrdy.level}`][ix].word1
  wrdy.wordB = wordPairs[`level${wrdy.level}`][ix].word2
}

function resetAll() {
  Object.assign(wrdy, initVr)
  wrdy.dialogue.innerText = "OK, let's start over!"
}

function goBack(n) {
  wrdy.stage = n
  n++
  wrdy[`link${n}`] = ""
  wrdy[`picked${n}`] = false
}

