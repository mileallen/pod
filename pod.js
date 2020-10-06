/* Assign Const 'yourAppName' to Class Pod. Pass the ID of the parent element for the app as the first
argument. If there is a set of intial values to assign, pass that object as the second argument. */

class Pod {
    constructor(e=null, i=null, w = document.getElementById(e), l=1) {
        this.dat = { _wrap: w, setVar: this.setVar.bind(this) }
        this._vrObj = {}
        this._elArr = []
        this._cArr = Object.keys(w.dataset)

    /* elArr is an array of all elements with 'watched' Pod attributes. cArr is an array of elements 
    with variables that set data- attributes on the wrapper element, used to set classes on children 
    through StyleSheet rules and selectors. vrObj records those key-value pairs for quick access. .dat 
    provides the proxy to manipulate those values from outside. The Pod class returns this proxy.
    */
        this.survey1(w)
        if(l) this.survey2(w)
        if(i) this.refresh(i)

        return new Proxy(this.dat, {
            set(t, k, v) {  t.setVar(k,v)    
                            return true   },
            get(t, k) { return t[`_${k}`] }
        })
    }
    survey1(tar) {    // look up all the children for any of Pod's watched attributes. Note them in elArr.
        let xs = tar.querySelectorAll('[pText]')
        let ds = tar.querySelectorAll('[pMod]')
        let bs = tar.querySelectorAll('[pBind]')
        this._fors = tar.querySelectorAll('[pFor]')
        this._refs = tar.querySelectorAll('[pRef]')
        xs.forEach( e => {
            this._elArr.push( { var: e.getAttribute('pText'), el: e, typ: "T", scp: tar} )
        }) 
        ds.forEach( e => {
            this._elArr.push( { var: e.getAttribute('pMod'), el: e, typ: "M", scp: tar} )
            e.addEventListener('input', () => this.setVar(e.getAttribute('pMod'), e.value) )
        })
        bs.forEach( e => {
            let bnd = e.getAttribute('pBind').split(':')                
            this._elArr.push( { var: bnd[1], el: e, typ: "B", scp: tar, att: bnd[0]} )
        })
        this._fors.forEach( e => {
            let elOb = { var: e.getAttribute('pFor'), el: e, typ: "L", scp: tar, in: false} 
            this._elArr.push(elOb)
            this.loop(elOb)
        })
        this._refs.forEach( e => {
            let rfid = e.getAttribute('pRef')                
            this.dat[`_${rfid}`] = e
        })
    }
    survey2(el){ // If called, also survey for components and their containers.
        this._shows = el.querySelectorAll('[pShow]')
        this._comps = el.querySelectorAll('[pComp]')
        this._views = el.querySelectorAll('template[compid]')
        this._shows.forEach( e => {
            this._elArr.push( { var: e.getAttribute('pShow'), el: e, typ: "N", scp: el, in: false, ky: null, vw: e.querySelector('template') } )
        })
        this._comps.forEach( e => {
            this._elArr.push( { var: e.getAttribute('pComp'), el: e, typ: "C", scp: el, in: false, ky: null} )
        })
        this._views.forEach( e => {
            this._elArr.push( { var: e.getAttribute('compid'), el: e, typ: "V", scp: el} )
        })         
    }
    setVar(ky, va, all=true){ // the core method the Proxy leverages, which calls the next
        if(this._cArr.includes(ky)) this.dat._wrap.dataset[ky] = va
        this.dat[`_${ky}`] = va
        this._vrObj[ky] = va
        let w = this._elArr.filter( i => i.var === ky )
        if( w && all ) w.forEach( w1 => this.update( w1, va ) )
        else if(w) w.forEach( w1 => { if(w1.typ !== 'C' && w1.typ !== 'N') this.update( w1, va ) } )
    }
    update(it, va) {
        switch(it.typ) { // check type of attribute to act on, then update the DOM
            case "T": it.el.innerHTML = va
                break
            case "M": it.el.value = va
                break
            case "B": it.el.setAttribute(it.att, va)
                break
            case "N": if(va) this.render(it)
                      else this.nix(it)
                break
            case "C": this.render(it, true, va)
                break
            case "L": this.loop(it, va)
                break        
        }
    }
    render(itl, co=false, vl=null) {  // Clone the compoment from its template and render it
        let vw, pa
        if(co) {
            this.nix(itl)
            vw = this._elArr.find(m => m.var === vl).el 
        }
        else vw = itl.vw
        let c = vw.content.firstElementChild.cloneNode(true)
        itl.ky = itl.el.appendChild(c)
        itl.in = true
        this.survey1(itl.ky)          // run level 0 survey (for pTexts, pMods and pBinds) in template
        this.refresh(this._vrObj, false)
    }
    nix(itl){   // remove the component
        if( itl.in ) {
        this._elArr = this._elArr.filter( mm => mm.scp !== itl.ky )
        itl.ky.remove()
        itl.in = false
        } 
    }
    refresh(oj, s=true) { for( const [ke, vl] of Object.entries(oj) ) this.setVar(ke, vl, s)
    }
    loop(itl, v=[]){       // 4 methods to deal with For loops declared in markup
        let arv = `_vu_${itl.var}`
        let aa = `_${itl.var}`
        if(itl.in) { this[arv].forEach( m => m.wrap.remove() ) }

        this[arv] = []
        this.dat[aa] = v                    /* redundant in one case. test if(v===[]) this.dat[aa]=[] */
        let par = itl.el.parentElement
        this.dat[aa].add = (ob, l = this[arv].length) => {
            if (this[arv].length === 0) itl.in = true
            this.insert(ob, l, itl, par, arv)
            this.reKey(arv)
            this.dat[aa].splice(l, 0, ob)
            }
        this.dat[aa].del = (i) => {   
            this[arv][i].wrap.remove()
            this[arv].splice(i, 1)
            this.reKey(arv)
            if( this[arv].length === 0 ) itl.in = false
            this.dat[aa].splice(i, 1)
            }
        this.dat[aa].set = (i, kk, vv) => {
            this[arv][i][kk] = vv
            this.dat[aa][i][kk] = vv
        }
        if(v.length) {        // For each item in array...
            v.forEach( (itm, key) => { this.insert(itm, key, itl, par, arv) } )
            itl.in = true
            this.reKey(arv)
        }
        else itl.in =  false
    }
    insert(ent, ij, it, pa, ar){  // ... render the template tagged 'pFor'
        let c = it.el.content.firstElementChild.cloneNode(true)
        let e = pa.insertBefore(c, pa.children[ij])               
        this.reformat(e)
        this[ar].splice(ij, 0, new Pod(null, ent, e, 0) )
    }
    reKey(ar){
        this[ar].forEach( (j, k) => j.key = k )
    }
    reformat(cln) {
        let e = cln.querySelectorAll('[pText]')
        e.forEach( el => {
            let st = el.getAttribute('pText').split('.')
            el.setAttribute('pText', st[1] )
        } )
        let f = cln.querySelectorAll('[pBind]')
        f.forEach( el => {
            let st = el.getAttribute('pBind').split(':')
            let bnd = st[1].split('.')                
            el.setAttribute('pBind', `${st[0]}:${bnd[1]}`)
        } )
        let g = cln.querySelectorAll('[pMod]')
        g.forEach( e => {
            let st = el.getAttribute('pMod').split('.')
            el.setAttribute('pMod', st[1] )
        } )
    }
}


/* 
sample helper for smoother transitions between views. Call dot(pod, panel, peek)
*/

function dot(cls, el, vr, on=true, d=10) {  
    if(on) { 
        if(typeof on === 'string') {
            d = 300
            cls[el].style.opacity = 0
        }         
        setTimeout(() => { 
            cls[vr] = on
            cls[el].style.opacity = 1 }, d)
    }
    else{
        cls[el].style.opacity = 0
        setTimeout(() => {
            cls[vr] = false
        }, 600)
    }
}



