/* Assign Const 'yourAppName' to Class Pod. Pass the ID of the parent element for the app as the first
argument. If there is a set of intial values to assign, pass that object as the second argument. */

class Pod {
    constructor(e=null, i=null, w = document.getElementById(e), s=1) {
        this.elArr = [] // an array of all elements with 'watched' Pod attributes
        this.vrObj = {} // records those key-value pairs, when set
        this.dat = { _wräp: w, setVar: this.setVar.bind(this) } // object proxied to manipulate those values from outside
      
        this.survey(w, i, s)

        return new Proxy( this.dat, {   // The Pod class returns this proxy.
            set(t, k, v){   
                t.setVar(k,v)    
                return true   
            },
            get(t, k){ 
                return t[`_${k}`] 
            }
        })
    }
    survey(l, o=null, y=0) {    // query for any watched attributes. Add them to elArr.
        let [b, t, m, c, r, s, p, v] = ['Bind','Text','Mod','Class','Ref','Show','Comp','Viewid'].map( i => l.matches(`[p${i}]`) ? [...l.querySelectorAll(`[p${i}]`), l] : l.querySelectorAll(`[p${i}]`) )
        b.forEach( e => {
            let [d,f] = e.getAttribute('pBind').split(':')                
            this.elArr.push( { var: f, scp: l, act: va => e.setAttribute(d, va)} )
        })
        t.forEach( e => this.elArr.push( { var: e.getAttribute('pText'), scp: l, act: va => typeof va == 'string' || typeof va == 'number' ? e.innerHTML = va : console.error('Invalid value!' ) } ) )  
        m.forEach( e => {
            let eVr = e.getAttribute('pMod')
            this.elArr.push( { var: eVr, scp: l, act: va => e.type==='checkbox' ? e.checked = va : e.value = va } )
            e.addEventListener('input', () => { 
                this.setVar(eVr, e.type ==='checkbox' ? e.checked : e.value) 
            })
        })
        r.forEach( e => this.dat[`_${e.getAttribute('pRef')}`] = e )
        c.forEach(e => { 
            for(const bt of e.getAttribute('pClass').split(',') ) {
            let [s,q] = bt.trim().split(':'), [v,b] = q.split('='), vl = b === 'true' ? true : b === 'false' ? false : b
            this.elArr.push( { var: v, scp: l, act: va => e.classList.toggle(s, vl == va)} )
            }
        })
        if(y){       // If called, also survey for components and their containers.
            s.forEach( e => {
                e.pod = { in: false, ky: null, vw: e.querySelector('template') }
                this.elArr.push( { var: e.getAttribute('pShow'), scp: l, typ: 'ex', act: va => typeof va == "boolean" ? this.render(e, va) : console.error('pShow requires a boolean!')  } ) 
            })
            p.forEach( e => {
                e.pod = { in: false, ky: null } 
                this.elArr.push( { var: e.getAttribute('pComp'), scp: l, typ: 'ex', act: va => this.elArr.some(m => m.var === va) ? this.render(e, va, true) : console.error(`Oops! Invalid pViewid: '%s'`, va) } ) 
            }) 
            v.forEach( e => this.elArr.push( { var: e.getAttribute('pViewid'), el: e, scp: l} ) )         
        }
        if(o) for( const [ke, vl] of Object.entries(o) ) this.setVar(ke, vl, y)   // set initial values if provided
    }
    setVar(ky, va, all=1){ // the core method the Proxy setter calls
        this.dat[`_${ky}`] = this.vrObj[ky] = va
        all ? this.elArr.forEach( i => { if(i.var === ky) i.act(va) } ) : this.elArr.forEach( i => { if(i.typ !== "ex" && i.var === ky) i.act(va) } )
    }
    render(et, vl=null, co=false) { 
        if(et.pod.in) {                 // remove the template content
            this.elArr = this.elArr.filter( mm => mm.scp !== et.pod.ky )
            et.pod.ky.remove()
        } 
        if(vl || (co && vl.length) ) {  // Clone the content of template and render it
            let vw = co ? this.elArr.find(m => m.var === vl).el : et.pod.vw
            let c = vw.content.firstElementChild.cloneNode(true)
            et.pod.ky = et.appendChild(c)
            this.survey(et.pod.ky, this.vrObj)    // run level 1 survey (for pText, pMod, pBind, pFor, pClass, pRef) in clone just rendered
        }
        et.pod.in = vl ? true : false
    }   
}




/* 
sample helper for smoother transitions between views. Call dot(app, pRef var, pShow / pComp var, [compid var])
pRef is assigned same el as pComp template's parent div.
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