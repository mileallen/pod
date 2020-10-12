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
  wrdy.qWords.forEach((obj, ky) => obj.word === choice ? wrdy.qWords.set(ky, 'pick', true) : wrdy.qWords.set(ky, 'kick', true) )
  wrdy[`link${wrdy.stage}`] = choice
  wrdy[`picked${wrdy.stage}`] = true
}


function setLevel(){
  wrdy.level === '1' ? wrdy.level = '2' : wrdy.level = '1'
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


const wordPairs = {

  level1: [
      {word1: "dream", word2: "case"},
      {word1: "divine", word2: "rant"},
      {word1: "music", word2: "humble"},
      {word1: "candor", word2: "trouble"},
      {word1: "cognition", word2: "arbitrary"},
      {word1: "weather", word2: "sentimental"},
      {word1: "cant", word2: "regale"},
      {word1: "nuance", word2: "style"},
      {word1: "novel", word2: "bride"},
      {word1: "weather", word2: "odd"},
      ],
  level2: [
      {word1: "recalcitrant", word2: "prospective"},
      {word1: "querulous", word2: "anterior"},
      {word1: "inveigh", word2: "raccoon"},
      {word1: "ken", word2: "nettle"},
      {word1: "affect", word2: "vetting"},
      {word1: "demur", word2: "sequestered"},
      {word1: "fatuous", word2: "theological"},
      {word1: "imbue", word2: "fervent"},
      {word1: "ribald", word2: "dire"},
      {word1: "elegiac", word2: "intensify"},
      ]
  }
  

