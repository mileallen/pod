
# Workflow

Pod is a class that supplies a number of helper methods to manipulate the DOM. You can design components inside templates that will be rendered on demand. Elements can have their innerHTML or an attribute bound to a proxy variable, which you declare right in the markup. For input and textarea elements, the binding is of-course two-way.

Within a webpage, Pod will look for these within the scope you assign to it. You do that by including the attribite 'podwrap' on the parent element. This will represent the reactive portion of your web page or web app.

`<div podwrap id="app" class="">... the rest of your HTML ... </div>`

In your own code assign the Pod class to a convenient name. 

`const app = Pod()`

When initialised thus, the class surveys the children of the wrapper for a number of attributes: Survey 1 looks for pText, pMod, pBind, PFor and pRef.

### pText

This attribute names a variable that will corespond to innerHTML for the element.

`<span pText="textVar1">Original text here was boring.</span>`

### pMod

This attribute turns an input or textarea element itno a two-way data model, the value is stored in the variable named by the attribute and is maintained in sync with the input value.

`<input type="range" pMod="classVar1">`

### pBind

This attribute binds the value of another attribute specified to the variable named. The syntax is 'attribute:variable' , no space. When you set uriVar1, the 'href' attribute below is updated to the string value you pass.

`<a pMod="href:uriVar1">`


### pRefs


Now you can set all the watched attributes.

```

app.textVar1 = 'This new text is exciting!' 

app.classVar1 = 'classTheme2'

app.uriVar1 = `https://google.com/q=${app12.searchStringVar1}`

```

## Survey 2

Survey 2 looks for component containers and templates, i.e., pShows, pComps and compids.

### pShow

Use this to show or hide a component template in its place. Add the pShow attribute to the div that will contain the template.

```
<div pShow="componentVar0"><template> 
... your template markup...
</template></div>

```

### pComp & compid

The former attribute marks a container div that can switch between mutiple components. Each alternative is declared in its own template, in turn marked with a 'compid' attribute. Note: these compid templates need to be inside the scope of the wrapper 'podwrap' div.

```
<div pComp="componentVar1"> </div>

... other markup ...

<template compid="viewVar1">.... your template markup .... <template>

<template compid="viewVar2">.... the other template markup .... <template>

</div></body>

```

For both, pShow and pComp, rendering the template is again, just the simple matter of setting the variable specified. For, pShow the variable is boolean. For pComp, assign the corresponding 'compid'.

```
app.componentVar0 = true

app.componentVar1 = viewVar2

```

