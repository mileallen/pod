/*
Single-use version only allows for one 'pod' per document. This is the parent element 
with the attribute 'podwrap' applied. You assign class Pod with just one argument, IF you have
a set of intial variables to assign. Otherwise, you can just invoke it with onreadystatechange!
*/

class Pod {
    constructor(i=null, w = document.querySelector('[podwrap]'), l=1) {
        this.dat = { _wrap: w, setVar: this.setVar.bind(this) }
        this._vrObj = {}
        this._elArr = []
        this._cArr = Object.keys(w.dataset)
        
        this.survey0(w)
        if(l) this.survey1(w)
        if(i) this.refresh(i)

        return new Proxy(this.dat, {
            set(t, k, v) {  t.setVar(k,v)    
                            return true   },
            get(t, k) { return t[`_${k}`] }
        })
    }
    survey0(tar) {
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
            let bnd = e.getAttribute('pBind').split('=')                
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
    survey1(el){
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
    update(it, va) {
        switch(it.typ) { // check which kind of attribute to act on
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
    render(itl, co=false, vl=null) {
        let vw, pa
        if(co) {
            this.nix(itl)
            vw = this._elArr.find(m => m.var === vl).el 
        }
        else vw = itl.vw
        let c = vw.content.firstElementChild.cloneNode(true)
        itl.ky = itl.el.appendChild(c)
        itl.in = true
        this.survey0(itl.ky) 
        this.refresh(this._vrObj, false)
    }
    nix(itl){  
        if( itl.in ) {
        this._elArr = this._elArr.filter( mm => mm.scp !== itl.ky )
        itl.ky.remove()
        itl.in = false
        } 
    }
    loop(itl, v=[]){
        let arv = `_vu_${itl.var}`
        let aa = `_${itl.var}`
        if(itl.in) { this[arv].forEach( m => m.wrap.remove() ) }

        this[arv] = []
        this.dat[aa] = v                    // redundant in one case. test if(v===[]) this.dat[aa]=[]
        let par = itl.el.parentElement
        this.dat[aa].add = (ob) => { 
            let l = this[arv].length
            this.insert(ob, l, itl, par, arv)
            this.reKey(arv)
            if(l===0) itl.in = true
            this.dat[aa].push(ob)
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
        if(v.length) {
            v.forEach( (itm, key) => { this.insert(itm, key, itl, par, arv) } )
            itl.in = true
            this.reKey(arv)
        }
        else itl.in =  false
    }
    insert(ent, ij, it, pa, ar){
        let c = it.el.content.firstElementChild.cloneNode(true)
        let e = pa.appendChild(c)               
        this.reformat(e)
        this[ar][ij] = new Pod(ent, e, 0)
    }
    reKey(ar){
        this[ar].forEach( (j, k) => j.key = k )
    }
    reformat(cln) {
        let e = cln.querySelectorAll('[pText]')
        //console.log(e)
        e.forEach( el => {
            let st = el.getAttribute('pText').split('.')
            el.setAttribute('pText', st[1] )
        } )
        let f = cln.querySelectorAll('[pBind]')
        f.forEach( el => {
            let st = el.getAttribute('pBind').split('=')
            let bnd = st[1].split('.')                
            el.setAttribute('pBind', `${st[0]}=${bnd[1]}`)
        } )
        let g = cln.querySelectorAll('[pMod]')
        g.forEach( e => {
            let st = el.getAttribute('pMod').split('.')
            el.setAttribute('pMod', st[1] )
        } )
    }
    _vals = () => { return this._vrObj    // maybe don't need this outside?
    }
    refresh(oj, s=true) { for( const [ke, vl] of Object.entries(oj) ) this.setVar(ke, vl, s)
    }
    setVar(ky, va, all=true){
        if(this._cArr.includes(ky)) this.dat._wrap.dataset[ky] = va
        this.dat[`_${ky}`] = va
        this._vrObj[ky] = va
        let w = this._elArr.filter( i => i.var === ky )
        if( w && all ) w.forEach( w1 => this.update( w1, va ) )
        else if( w && w.typ !== 'C' && w.typ !== 'N') this.update( w, va )
    }
}


    /*
    let nms = {}
    let pds = document.querySelectorAll('[podwrap]')
    pds.forEach( (e,k) => nms[`pod${k}`] = empod(null, e) ) 
    */