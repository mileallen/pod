
const h = {
    tofro: {from: "Confucius", to: "Juliette Binoche"},
    picked: null,
    menuOn: false,
    hops: 2,
    getel: el => document.getElementById(el),
    qSel: el => document.querySelector(el),
    getSty: el => document.querySelector(el).style,
    trimVal: el => document.getElementById(el).value.trim(),
    togCls: (el, cts) => { for([c,t] of cts) el.classList.toggle(c, t) }
}

const checklink = async function (i)  {

    const topicFrom =  i === 0 ? h.tofro.from : h.trimVal(`inputArt-${i}`)
    const topicTo = i === h.hops-1 ? h.tofro.to : h.trimVal(`inputArt-${i+1}`)
    //console.log( 'fr: ' + topicFrom + '   to: ' + topicTo)
    const pi = h.getel('indict')
    const butn = h.getel(`lnk${i}`)
    h.togCls(pi, [['fetching', true]])

    const apiurl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=links&titles=${topicFrom}&redirects=1&formatversion=2&plnamespace=0&pllimit=5&pltitles=${topicTo}`

    const res = await fetch(apiurl)
    const resDat = await res.json()
    const result = resDat.query.pages

    if ( result[0].links ) { 
        if(i === h.hops-1) seeMenu(3, true)
        h.togCls(butn, [['success', true]])
        butn.innerHTML = '&#10004;'
    }
    else {
        h.togCls(butn, [['fail', true]])
        butn.innerHTML = '&#10006;'
    }
    h.togCls(pi, [['fetching', false]])
    pi.style.width='0%'
    h.togCls(butn, [ ['enab', false], ['disab', true] ])
}

const enabl = (i) => {
    const b = h.getel(`lnk${i}`)
    h.togCls(b, [ ['disab', false], ['enab', true], ['success', false], ['fail', false] ] )
    b.innerHTML = '&#10968;&#10968;'
}

const picked = i => {
    h.tofro.from = h.getel(`fromArt`).innerText = linked[i].from
    h.tofro.to = h.getel(`toArt`).innerText = linked[i].to
    numHop( linked[i].in )
    h.picked = i
    seeMenu(1, false)     // ? setTimeout(seeMenu(1), 500)
}

const numHop = count => { 
    document.querySelectorAll('.hop').forEach( (el, i) => i<count-2 ? el.style.display='flex' : el.style.display='none' )
    document.querySelectorAll('.mid').forEach( el => el.value="" )
    h.hops = count
    h.getSty('.gamearea').fontSize = `${1-(0.05*(count-2))}rem`
}

const reveal = () => {
    if (linked[h.picked]) document.querySelectorAll('.mid').forEach( (el,j) => { if (j < linked[h.picked].ans.length) el.value = linked[h.picked].ans[j] } )
    seeMenu(1, false)
}

const resetAll = () => {
    if(h.picked) numHop(linked[h.picked].in)
    else document.querySelectorAll('.mid').forEach( el => el.value = "" )
    for(j=0; j<7; j++) enabl(j)
    seeMenu(1, false)
}

const seeMenu = (i=0, v=false) => {
    if(i>0) h.getel('openmenu').checked = v
    if(v) fillNav(i)
    h.menuOn = !h.menuOn
    h.getSty(`.menu-pg`).opacity = h.menuOn ? 0.8 : 0 
    h.getSty(`.menu-pg`).zIndex = h.menuOn ? 3 : -1
}

const fillNav = (n) => {
    let m = h.qSel('.menu-pg')
    let p= h.getel(`menu-page-${n}`)
    h.qSel('.menu-blk').remove()
    let c = p.content.firstElementChild.cloneNode(true)
    if(n==='1') c.querySelectorAll('.picks').forEach( (e,j) => e.innerHTML = `<b>${linked[j].from}</b> to <b>${linked[j].to}</b> in ${linked[j].in} hops.` )
    if(n==='2') c.querySelector('#hopNum').value = h.hops
    m.insertBefore(c, m.children[0])
}

const linked = [
    { from: "Alexander the Great", to: "Pink Floyd", in: 4, ans: ['Bucephalus','Horse','Cello'] },
    { from: "Toumani Diabaté", to: "Jeff Bezos", in: 3, ans: ['Mali', 'Mansa Musa'] },
    { from: "German Shepherd", to: "Jimmy Kimmel", in: 3, ans: ['Rin Tin Tin', 'Academy Awards'] },
    { from: "Statue of Liberty", to: "Ernest Hemingway", in: 3, ans: ['Joseph Pulitzer', 'Pulitzer Prize'] },
    { from: "Angela Merkel", to: "Technological singularity", in: 4, ans: ['Quantum Chemistry', 'Enrico Fermi', 'Fermi paradox'] },
    { from: "German Shepherd", to: "Jimmy Kimmel", in: 3, ans: ['Rin Tin Tin', 'Academy Awards'] }
]


/* TO DO 
  -   - 

should lookup check whether the link text from Wiki page contains the input phrase?

s => s.toLowerCase().includes( val.toLowerCase() )

then 'Presidency of Barack Obama' will match 'Barack Obama'

*/
