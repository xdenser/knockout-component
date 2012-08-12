knockout-component
==================

Proposal of simple reusable components for knockoutjs

See this [fiddle](http://jsfiddle.net/YdK6k/) on how to use.


Component is just combination of ViewModel and Template.
To create or rather register component use following call:

`kc.component(componentName,templateName,viewModelFunction)`

* `componentName` - name of component to rafer later in HTML;
* `templateName` - name of template used to render component;
* `viewModelFunction: function(options)` - function returning new instance of component View Model.

To use component apply `component` binding in HTML:
```HTML
<div data-bind="component: componentName[, componentOptions: optionsObject][,componentBind: bindObject]">
</div>
```
* `componentOptions` - allows set options for viewModelFunction;
* `componentBind` - allows to bind component View Model properties to parent View Model properties(observables),
                  so that changes in parent View Model are applied to component View Model and back.

                                        
                                         