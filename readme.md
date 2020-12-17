
# About using this

[Pod](https://github.com/mileallen/pod/) is a class that supplies a number of helper methods to manipulate the DOM, to match the way most JS frameworks do. It is specifically meant for lightweight web pages that you would like to design like an app, in a declarative way, but without the costs of a framework. It's a 'vanilla' Pod, get it?

You can design simple 'components' inside templates that will be rendered on demand. Elements can have their text content or an attribute bound to a proxy variable, which you declare right in the markup. For `input` and `textarea` elements, the binding is of-course two-way. You might notice that the markup syntax is influenced by popular frameworks for a quick learning curve.

A demonstration as a word-linking game app is [here](https://pod.js.org/verba/). It is <22 KB in all of uncompressed HTML, CSS and JS (Transfer size ~10 KB.). And of course, the obligatory [todo app](https://pod.js.org/todos/).

[![game screenshot](verba/verba.png "A word linking game")](https://pod.js.org/verba/)

## How it works

Within a webpage, Pod will look for specific declarations within the scope you assign to it. The scope is set by passing the ID of the parent element ('the wrapper') when declaring. This will represent the 'app' portion of your web page or web app.

`<div id="appW" class="">... the rest of your HTML ... </div>`

In your own JS code assign the Pod class to a convenient name. (Include Pod.js before this assignment.) 

`const app = new Pod('appW')`

If you have an initial set of variables to assign, pass them as properties in an object as the second argument.

`const app = new Pod('appW', {todos: arrayVar, theme: 'dark'} )`


## Survey level 1

When initialised thus, the class surveys the children of the wrapper for a number of attributes: 'Survey' looks for `pText`, `pMod`, `pBind`, `pFor`, `pClass` and `pRef`.

### pText

This attribute names a variable that will correspond to innerHTML for the element.

`<span pText="textVar1"> Original text here is boring.</span>`

### pMod

This turns an input or textarea element into a two-way data model. The value is stored in the variable named by the attribute and is maintained in sync with the input value.

`<input type="range" pMod="themeChoice">`

### pBind

This binds the value of another attribute specified to the variable named. The syntax is `'attribute:variable'` , no space. When you set `uriVar1`, the `href` attribute below is updated to the string you pass.

`<a pMod="href:uriVar1">`


### pRefs

This is simply to add meaningful identifiers to elements. Obviously it doesn't do much that `querySelector` cannot. It just serves to add consistency to your app's syntax for readability. 

`<div pRef="scorePanel"></div>`


Now you can use all those watched attributes.

```

app.textVar1 = 'This new text is exciting!' 

app.themeChoice = 'theme0'

app.uriVar1 = `https://lexico.com/en/definition/${app12.searchStringVar1}`

app.scorePanel.style.opacity = 0

```

### pClass

The corresponding `pClass` attribute is slightly different in that it supports multiple comma-separated declarations.

Notice above the `input` element bound to the variable `themeChoice` with `pMod`. Say you want that to reflect in a CSS class assigned to some other part of the app, such that the range `input` can be used to switch that class. 

```
<div id="themedComponent" pClass="darkTheme:themeChoice=dark, lightTheme:themeChoice=light, noPointer:gameOver=true">
<p>   <span>...</span></p>
<button>
</div>
```

Now when the range input is used to set `themeChoice`, the CSS rule takes effect on the `themedComponent` element.


### pFor

This is to handle Array data. Below is an example of usage from the included demo game app. The game looks up word relations on an API from datamuse.com. When the fetch 'promise' is fulfilled, the API retuns JSON with a list of words that meet the criterion, and for each word, a `score` property and another that counts the number of syllables in the word. The JSON list of words is assigned to the variable `qWords`. We want each word to be displayed, with a function invoked `onclick`, to which we pass the selected word. We also wish to assign a couple of conditional classes depending on whether the word was picked to proceed to the next link or not.

Here is how you achieve that:

```

<div class="grid2">

    <template pFor="qWords">
    <div class="fetched" pClass=": pick=true, :kick=true, :matched=true"
        <div class="" pText="qWord.word" pBind="idx=qWord.word" onclick="pickword(this.getAttribute('idx'))"> </div>
    </div> 
    </template>

</div>

```
The template content itended for array items to iteratre through should be inside a single outer container `div`. Above, that is where we have assigned the class `fetched`. The template tag itself should also be enclosed in a single div all its own, with no other content within it. As is the case in the game snippet with the `div` assigned the class `grid2`.

So you want:

```
<div>
    <template>
    <div>
          ... your intended template markup...
    </div> 
    </template>
</div>
```

Note that the template rendered for each item in the array is actually a Pod class in itself, though not exposed to the user directly. As such, the parent `div` in the template is its 'wrapper'. 

To remind you that the Pod variables you use inside the pFor template take values from properties in the Array object and not the parent Pod that you assigned to 'app', the syntax requires the `.`. Hence `pText="qWord.word"` and not `pText="word"` as it would be anywhere outside the pFor template.

To add, delete items or to update individual properties on items, you can use the following methods:

```
app.YourArrayVar.add( {key1: value1, key2: value2...}, [index] )

app.YourArrayVar.delete(index)

app.YourArrayVar.set(index, key, value)

```

With `.add()`, `index` is optional. By default, the item is appended at the end of the array. Examples from the todo app:

```
app.todos.add( { note: "readme example", done: false } )

app.todos.set( 3, 'done', true)
```

Tip: If you don't intend to render templates based on any array data, you can use pod-lite.js, a much lighter Pod class.


## Survey 2

The second part of Pod survey looks for component containers and templates, i.e., `pShow`s, `pComp`s and `pViewid`s.

### pShow

Use this to show or hide a component template in its place. Add the `pShow` attribute to the `div` that will contain the template.

```
<div pShow="componentVar0">
<template>

<div id="componentContainer1">
... your template markup...
</div>

</template>
</div>

```

### pComp & pViewid

The former attribute marks a container `div` that can switch between mutiple components. Each alternative is declared in its own template, in turn marked with a `pViewid` attribute. Note: these `pViewid` templates need to be inside the scope of the wrapper `div` described above.

As with `pFor`, for all templates, be sure to put your component inside a single outer container div. It's ID is immaterial to Pod.

```
<div pComp="componentVar1"> </div>

... other markup ...

<template pViewid="viewVar1"> 
<div id="componentContainer2">
.... your template markup .... 
</div>
<template>

<template pViewid="viewVar2">
<div id="componentContainer">
.... the other template markup .... 
</div>
<template>

</div></body>

```

For both, `pShow` and `pComp`, rendering the template is again, just the simple matter of setting the variable specified. For `pShow`, the variable is boolean. For `pComp`, assign the corresponding `pViewid`.

```
app.componentVar0 = true

app.componentVar1 = viewVar2

```


# Last Word

I'm an amateur JS enthusiast. The primary motivation to put this up was the hope of hearing back from professionals about everything that is wrong with this approach. Really vicious criticism lampooning how a particular line of code is laughably wrong-headed is very welcome! [@sachwry](https://twitter.com/sachwry)
