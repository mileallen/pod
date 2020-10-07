/* Assign Const 'yourAppName' to Class Pod. Pass the ID of the parent element for the app as the first
argument. If there is a set of intial values to assign, pass that object as the second argument. */

class Pod {
    constructor(e=null, i=null, w = document.getElementById(e)) {
        this.dat = { _wrap: w, setVar: this.setVar.bind(this) }
        this._vrObj = {}
        this._elArr = []
        this._cArr = Object.keys(w.dataset)

    /* elArr is an array of all elements with 'watched' Pod attributes. cArr is an array of data- 
    attributes on the wrapper element, used to set classes on children through StyleSheet rules and 
    selectors. vrObj records those key-value pairs for quick access. .dat provides the proxy to 
    manipulate those values from outside. The Pod class returns this proxy.
    */
        this.survey1(w, ar)
        this.survey2(w)
        if(i) this.refresh(i)

        return new Proxy(this.dat, {
            set(t, k, v) {  t.setVar(k,v)    
                            return true   },
            get(t, k) { return t[`_${k}`] }
        })
    }
    survey1(tar, a) {    // look up all the children for any of Pod's watched attributes. Add them to elArr.
        let xs = tar.querySelectorAll('[pText]')
        let ds = tar.querySelectorAll('[pMod]')
        let bs = tar.querySelectorAll('[pBind]')
        this._refs = tar.querySelectorAll('[pRef]')
        xs.forEach( e => {
            this._elArr.push( { var: e.getAttribute('pText'), el: e, typ: "T", scp: tar} )
        }) 
        ds.forEach( e => {
            let elOb = { var: e.getAttribute('pMod'), el: e, typ: "M", scp: tar }
            this._elArr.push(elOb)
            e.addEventListener('input', () => { 
                if(a) a[this.dat._key][elOb.var] = e.type ==='checkbox' ? e.checked : e.value
                this.setVar(e.getAttribute('pMod'), e.type ==='checkbox' ? e.checked : e.value) 
            })
        })
        bs.forEach( e => {
            let bnd = e.getAttribute('pBind').split(':')                
            this._elArr.push( { var: bnd[1], el: e, typ: "B", scp: tar, att: bnd[0]} )
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
        if( w && all ) w.forEach( w1 => this.update(w1, va) )
        else if(w) w.forEach( w1 => { if(w1.typ !== 'C' && w1.typ !== 'N') this.update(w1, va) } )
    }
    update(it, va) {
        switch(it.typ) { // check type of attribute to act on, then update the DOM
            case "T": it.el.innerHTML = va
                break
            case "M": it.el.type==='checkbox' ? it.el.checked = va : it.el.value = va
                break
            case "B": it.el.setAttribute(it.att, va)
                break
            case "N": va ? this.render(it) : this.nix(it)
                break
            case "C": this.render(it, true, va)
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
        this.survey1(itl.ky)          // run level 1 survey (for pTexts, pMods, pBinds & pFors) in template
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
}


/* 
sample helper for smoother transitions between views. Call dot(app, pRef var, pShow var / compid var)
pRef var is assigned to the template's parent div.
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



