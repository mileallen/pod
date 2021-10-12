
const kanjis = [
{ id: 1, char: '的' },
{ id: 2, char: '在' },
{ id: 3, char: '有' },
{ id: 4, char: '谁' },
{ id: 5, char: '请' },
{ id: 6, char: '谢' },
]

const words = [
{ id: 1, mean: 'de - of' },
{ id: 2, mean: 'Zài - in, at' },
{ id: 3, mean: 'Yǒu - have' },
{ id: 4, mean: 'Shéi - who' },
{ id: 5, mean: 'Qǐng - please' },
{ id: 6, mean: 'xie - thanks' },
]

const shuff = () => [...kanjis, ...words]
                    .map( t => { return {...t, content: t.char || t.mean, char: t.mean === undefined, flipped: false, matched: false} })
                    .sort(() => Math.random() - Math.random())

                    
const initVar1 = {
flip1: null, 
flip2: null,
totalMatches: 0,
totMoves: 0,
countFlip: 0
}

const initVar2 = {
kanjis: kanjis,
words: words,
pageVar: 'home',
testChar: kanjis[0].char,
testMean: words[0].mean,
size: { c: { max: 75, min: 10 }, m: { max: 30, min: 10 } },
cTile: "",
mTile: "",
tiles: shuff(),
}


const hnz = new Pod('wrap', {...initVar1, ...initVar2})



function resetGame() {
    transs('pageRef', 0, 'home')
    Object.assign(hnz, {...initVar1, tiles: shuff()} )
}


function afterFlip(ix) {
    hnz.tiles.set(ix,'flipped', true)
    if (hnz.countFlip < 1) {
        hnz.countFlip++
        hnz.flip1 = { ky: ix, idd: hnz.tiles[ix].id }
        return
    }
    else {
        hnz.totMoves++
        hnz.flip2 = { ky: ix, idd: hnz.tiles[ix].id }
        if ( hnz.tiles[ix].id == hnz.flip1.idd ) {
            setTimeout(() => {
                hnz.tiles.set(hnz.flip1.ky, 'matched', true)
                hnz.tiles.set(hnz.flip2.ky, 'matched', true)
                hnz.totalMatches++
                if (hnz.totalMatches > 5) {
                    hnz.pageRef.style.opacity = 0
                    setTimeout(() => {
                        hnz.pageVar = 'gameOver'
                        hnz.pageRef.style.opacity = 1
                    }, 200)
                }
            }, 450)
            hnz.countFlip = 0
        }
        else {
            hnz.countFlip = 0
            setTimeout(() => {
                hnz.tiles.set(hnz.flip1.ky,'flipped', false)
                hnz.tiles.set(hnz.flip2.ky,'flipped', false)
            }, 450)
        }
    }
}


function transs(el, v, sw=false) {
    hnz[el].style.opacity = v
    setTimeout(() => {
        if(sw) sw==='tog' ? hnz.pageVar = hnz.pageVar === 'home' ? 'editChar' : 'home' : hnz.pageVar = sw
        hnz.pageRef.style.opacity = 1
    }, 200)
}


function size(t, dec=true) {
    let eSz = window.getComputedStyle(document.documentElement).getPropertyValue(`--${t}Font`)
    if(dec) {
    document.documentElement.style.setProperty(`--${t}Font`, `${parseFloat(eSz) - 5}px`)
    parseFloat(eSz) - 5 < hnz.size[t].min ? hnz[`${t}Tile`] = 'min' : hnz[`${t}Tile`] = ''
    }
    else {
    document.documentElement.style.setProperty(`--${t}Font`, `${parseFloat(eSz) + 5}px`)
    parseFloat(eSz) + 5 > hnz.size[t].max ? hnz[`${t}Tile`] = 'max' : hnz[`${t}Tile`] = ''
    }
}


document.onreadystatechange = () => { if (document.readyState === 'complete') transs('title', 1) }








