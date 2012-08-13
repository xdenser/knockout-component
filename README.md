knockout-component
==================

Proposal of simple reusable components for knockoutjs (knockout > 2.1.0 needed)

See this simple [fiddle](http://jsfiddle.net/YdK6k/1/) on how to use
or that [fiddle](http://jsfiddle.net/fURk7/2/) for nested components and data transformation.


Component is just combination of ViewModel and Template.
To create or rather register component use following call:

`kc.component(componentName,templateName,viewModelFunction)`

* `componentName` - name of component to rafer later in HTML;
* `templateName` - name of template used to render component;
* `viewModelFunction: function(options)` - function returning new instance of component View Model.

To use component apply `component` binding in HTML:
```HTML
<div data-bind="component: componentName[, componentOptions: optionsObject][,componentBinding: bindObject][,componentAssignTo: assignProperty]">
</div>
```
* `componentOptions` - allows set options for viewModelFunction;
* `componentBinding` - allows to bind component View Model properties to parent View Model properties(observables),
                  so that changes in parent View Model are applied to component View Model and back;
* `componentAssignTo` - allows to assign created component ViewModel instance to parent ViewModel property.

                                        
                                         