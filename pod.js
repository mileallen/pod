/* Assign Const 'yourAppName' to Class Pod. Pass the ID of the parent element for the app as the first
argument. If there is a set of intial values to assign, pass that object as the second argument. */

class Pod {
    constructor(e=null, i=null, w = document.getElementById(e), l=1, ar=null) {
        this.dat = { _wrap: w, setVar: this.setVar.bind(this) }
        this.vrObj = {}
        this.elArr = []
        this.daArr = Object.keys(w.dataset)

        /* elArr is an array of all elements with 'watched' Pod attributes. daArr is an array of data- 
    attributes on the wrapper element, used to set classes on children through StyleSheet rules and 
    selectors. vrObj records those key-value pairs for quick access. .dat provides the proxy to 
    manipulate those values from outside. The Pod class returns this proxy.
    */
        this.survey1(w, ar)
        if(l) this.survey2(w)
        if(i) this.refresh(i)

        return new Proxy(this.dat, {
            set(t, k, v) {  t.setVar(k,v)    
                            return true   },
            get(t, k) { return t[`_${k}`] }
        })
    }
    survey1(tar, a) {    // query tar's children for any watched attributes. Add them to elArr.
        let [t, m, b, f, r] = ['Text','Mod','Bind','For','Ref'].map( i => tar.querySelectorAll(`[p${i}]`) )
        t.forEach( e => this.elArr.push( { var: e.getAttribute('pText'), el: e, typ: "T", scp: tar} ) ) 
        m.forEach( e => {
            let elOb = { var: e.getAttribute('pMod'), el: e, typ: "M", scp: tar }
            this.elArr.push(elOb)
            e.addEventListener('input', () => { 
                if(a) a[this.dat._key][elOb.var] = e.type ==='checkbox' ? e.checked : e.value
                this.setVar(elOb.var, e.type ==='checkbox' ? e.checked : e.value) 
            })
        })
        b.forEach( e => {
            let bnd = e.getAttribute('pBind').split(':')                
            this.elArr.push( { var: bnd[1], el: e, typ: "B", scp: tar, att: bnd[0]} )
        })
        f.forEach( e => {
            let elOb = { var: e.getAttribute('pFor'), el: e, typ: "L", scp: tar, in: false} 
            this.elArr.push(elOb)
            this.loop(elOb)
        })
        r.forEach( e => this.dat[`_${e.getAttribute('pRef')}`] = e )
    }
    survey2(el){ // If called, also survey for components and their containers.
        let [s, c, v] = ['[pShow]','[pComp]','template[compid]'].map( j => el.querySelectorAll(j) )
        s.forEach( e => this.elArr.push( { var: e.getAttribute('pShow'), el: e, typ: "N", scp: el, in: false, ky: null, vw: e.querySelector('template') } ) )
        c.forEach( e => this.elArr.push( { var: e.getAttribute('pComp'), el: e, typ: "C", scp: el, in: false, ky: null} ) )
        v.forEach( e => this.elArr.push( { var: e.getAttribute('compid'), el: e, typ: "V", scp: el} ) )         
    }
    setVar(ky, va, all=true){ // the core method the Proxy leverages, which calls the next
        if(this.daArr.includes(ky)) this.dat._wrap.dataset[ky] = va
        this.dat[`_${ky}`] = va
        this.vrObj[ky] = va
        let w = this.elArr.filter( i => i.var === ky )
        if( w && all ) w.forEach( w1 => this.update(w1, va) )
        else if(w) w.forEach( w1 => { if(w1.typ !== "C" && w1.typ !== "N") this.update(w1, va) } )
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
            case "L": this.loop(it, va)
                break        
        }
    }
    render(itl, co=false, vl=null) {  // Clone the compoment from its template and render it
        let vw
        if(co) {
            this.nix(itl)
            vw = this.elArr.find(m => m.var === vl).el 
        }
        else vw = itl.vw
        let c = vw.content.firstElementChild.cloneNode(true)
        itl.ky = itl.el.appendChild(c)
        itl.in = true
        this.survey1(itl.ky)          // run level 1 survey (for pTexts, pMods, pBinds & pFors) in template
        this.refresh(this.vrObj, false)
    }
    nix(itl){           // remove the component
        if(itl.in) {
        this.elArr = this.elArr.filter( mm => mm.scp !== itl.ky )
        itl.ky.remove()
        itl.in = false
        } 
    }   
    refresh(oj, s=true) { for( const [ke, vl] of Object.entries(oj) ) this.setVar(ke, vl, s)
    }
    loop(itl, v=[]){       // 4 methods to deal with pFor loops declared in markup
        let ar = `_${itl.var}`
        if(itl.in) this[ar].forEach( m => m.wrap.remove() )
        this[ar] = []
        this.dat[ar] = v                    
        let par = itl.el.parentElement
        this.dat[ar].add = (ob, l = this[ar].length) => {
            if (this[ar].length === 0) itl.in = true
            this.insert(ob, l, itl, par, ar)
            this.reKey(ar)
            this.dat[ar].splice(l, 0, ob)
            }
        this.dat[ar].del = (i) => {   
            this[ar][i].wrap.remove()
            this[ar].splice(i, 1)
            this.reKey(ar)
            if( this[ar].length === 0 ) itl.in = false
            this.dat[ar].splice(i, 1)
            }
        this.dat[ar].set = (i, kk, vv) => {
            this[ar][i][kk] = vv
            this.dat[ar][i][kk] = vv
        }
        if(v.length) {        // For each item in array...
            v.forEach( (itm, key) => this.insert(itm, key, itl, par, ar) )
            itl.in = true
            this.reKey(ar)
        }
        else itl.in =  false
    }
    insert(ent, ij, it, pa, aa){  // ... render the template tagged 'pFor'
        let c = it.el.content.firstElementChild.cloneNode(true)
        let e = pa.insertBefore(c, pa.children[ij])               
        this.reformat(e)
        this[aa].splice(ij, 0, new Pod(null, ent, e, 0, this.dat[aa]) )
    }
    reKey(av){          // update the key for each item
        this[av].forEach( (j, k) => j.key = k )
    }
    reformat(cln) {     // match the attribute syntax for Pod
        let [t, m, b] = ['Text', 'Mod','Bind'].map( m => cln.querySelectorAll(`[p${m}]`) )
        for ( const [k, v] of [[t,'pText'], [m,'pMod']] ) k.forEach( el => {
            let st = el.getAttribute(v).split('.')
            el.setAttribute(v, st[1] )
        } )
        b.forEach( el => {
            let st = el.getAttribute('pBind').split(':'), bnd = st[1].split('.')                
            el.setAttribute('pBind', `${st[0]}:${bnd[1]}`)
        } )
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



