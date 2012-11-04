knockout-component
==================

Simple reusable components for knockoutjs

See this [fiddle](http://jsfiddle.net/xdenser/YdK6k/5/) on how to use.


Component is just combination of ViewModel and Template.
To create or rather register component use following call:

`kc.component(componentName,templateName,viewModelFunction)` 
 or
`kc.component({
      name:componentName,
      template: templateName,
      create: viewModelFunction
})`


* `componentName` - name of component to refer later in HTML;
* `templateName` - name of template used to render component;
* `viewModelFunction: function(options)` - function returning new instance of component View Model.

To use component apply `component` binding in HTML:
```HTML
<div data-bind="kc.<componentName>: bindObject, kc.options: optionsObject, kc.assign: assignToParentProperty">
</div>
```
or alternative syntax
```HTML
<div data-bind="component: componentName[, componentOptions: optionsObject][,componentBinding: bindObject][,componentAssignTo: assignToParentProperty]">
</div>
```
* `componentOptions` - allows to set options for viewModelFunction;
* `componentBinding` - allows to bind component View Model properties to parent View Model properties(observables),
                  so that changes in parent View Model are applied to component View Model and back,
* `componentAssignTo`- you would probably want to refer to the component from parent Viewmodel. componentAssignTo binding allows to assign newly created component viewmodel to parent context property.

  
                                        
                                         