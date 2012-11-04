/**
 * Copyright: Denys Khanzhiyev
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
!function($){
!function(factory){
    // Support three module loading scenarios
    // stolen from knockoutjs source
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        var target = module['exports'] || exports; // module.exports is for Node.js
        factory(target);
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        define(['exports'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['kc'] = {});
    }
}(function(kcExports){

    
    var
        kc = typeof kcExports !== 'undefined' ? kcExports : {};
        components = {};
        

    function bindComponentProperty(name,instance,binding,parentContext) {
        var
            blockMine = false, blockOther = false, bindToObj, subscriptions=[];

        if (ko.isSubscribable(instance[name])){
            if (ko.isWriteableObservable(binding) ) subscriptions.push(instance[name].subscribe(function (val) {
                if (blockMine) return;
                blockMine = true;
                binding(val);
                blockMine = false;
            }));
        } else instance[name] = ko.utils.unwrapObservable(binding);

        if (ko.isSubscribable(binding)){
          if( ko.isWriteableObservable(instance[name])){
              subscriptions.push(binding.subscribe(function (val) {
                  if (blockOther) return;
                  blockOther = true;
                  instance[name](val);
                  blockOther = false;
              }));
              blockOther = true;
              instance[name](binding());
              blockOther = false;
          }
          else subscriptions.push(binding.subscribe(function (val) {
              instance[name] = val;
          }))
        }
        else if(ko.isWriteableObservable(instance[name])) instance[name](binding);

        return subscriptions;
    }



    var componentVMInstanceDomDataKey = '__kc__componentVMInstanceDomDataKey__';
    var templateSubscriptionDomDataKey = '__kc__templateSubscriptionDomDataKey__';
    function disposeOldSubscriptionAndStoreNewOne(element, newSubscription) {
        var oldSubscription = ko.utils.domData.get(element, templateSubscriptionDomDataKey);
        if (oldSubscription && (typeof(oldSubscription.dispose) == 'function'))
            oldSubscription.dispose();
        ko.utils.domData.set(element, templateSubscriptionDomDataKey, newSubscription);
    }
    ko.bindingHandlers.component = {
        init:function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
            var  val = valueAccessor(), name;

            valueUnwrapped = ko.utils.unwrapObservable(val);
            if(typeof valueUnwrapped == "string") {
                name = valueUnwrapped;
            }
            else throw new Error('component binding value must be component name');
            if(!components[name]) throw new Error('component not found '+name);

            var
                bindings = allBindingsAccessor(),
                componentBinding = bindings['componentBinding'],
                componentOptions = bindings['componentOptions']||bindings['kc.options'],
                componentAssignTo = bindings['componentAssignTo']||bindings['kc.assign'],
                subscriptions=[],
                oldInstance = ko.utils.domData.get(element, componentVMInstanceDomDataKey),
                newInstance = components[name].factory(componentOptions,element);
                // if(oldInstance) make something with it
                ko.utils.domData.set(element, componentVMInstanceDomDataKey,newInstance);
                
                

            if(typeof componentAssignTo == 'function') componentAssignTo(newInstance);


            if(componentBinding && (typeof componentBinding == 'object')){
                for(var prop in componentBinding) {
                    if(componentBinding.hasOwnProperty(prop)) {
                        subscriptions = subscriptions.concat(bindComponentProperty(prop,newInstance,componentBinding[prop],bindingContext));
                    }
                }
                if(subscriptions.length) ko.utils.domNodeDisposal.addDisposeCallback(element,function(){
                    ko.utils.arrayForEach(subscriptions,function(s){s.dispose();});
                });
            }


            return  { controlsDescendantBindings: true };

        },
        update:function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
            var
              templateSubscription,
              componentVM = ko.utils.domData.get(element, componentVMInstanceDomDataKey),
              childBindingContext = bindingContext.createChildContext(componentVM);

            var  val = valueAccessor(), name,
                 bindings = allBindingsAccessor();

            valueUnwrapped = ko.utils.unwrapObservable(val);
            if(typeof valueUnwrapped == "string") {
                name = valueUnwrapped;
            }
            else throw new Error('component binding value must be component name');
            if(!components[name]) throw new Error('component not found '+name);

            if(components[name].templateReady) components[name].templateReady(function(template){ 
              if (template) {
                   templateSubscription = ko.renderTemplate(template, childBindingContext, bindings.templateOptions||{}, element);
                   disposeOldSubscriptionAndStoreNewOne(element, templateSubscription);
              }
            });  
        }
    }

    ko.virtualElements.allowedBindings['component'] = true;


    function Component(name,factory,template)
    {
        components[name] = this;
        this.factory = factory;
        this.template = template;
        
        if( (typeof template == 'string') || (typeof template == 'function')){
            this.templateReady = function(cb){
                cb(template);
            }
        } else if(template && template.url && $){
            var tname = 'kc.'+name,
                _promise = $.get(url,function(data){
                   $('body').append('<script id="'+tname+'" type="text/html">'+data+'</script>');
                });
            this.templateReady = function(cb){
               _promise.then(function(){ cb(tname); });
            };
        } else if(template && template.templateReady){
            this.templateReady = template.templateReady;
        }
        
        ko.bindingHandlers['kc.'+name] = {
            init:function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
               var  val = valueAccessor(),
                    valueUnwrapped = ko.utils.unwrapObservable(val),
                    bindings = allBindingsAccessor();
               bindings.componentBinding = valueUnwrapped;   
               return ko.bindingHandlers['component'].init(element,function(){return name;},function(){return bindings;},viewModel,bindingContext);     
            },
            update:function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
               var  val = valueAccessor(),
                    valueUnwrapped = ko.utils.unwrapObservable(val),
                    bindings = allBindingsAccessor();
               bindings.componentBinding = valueUnwrapped;                         
               return ko.bindingHandlers['component'].update(element,function(){return name;},function(){return bindings;},viewModel,bindingContext);     
            }
        }
        ko.virtualElements.allowedBindings['kc.'+name] = true; 
    }


    kc.component = function(name,template,viewModelFactory){
            var obj = name;
            if(name && (typeof name == 'object')){
                name = obj.name;
                template = obj.template;
                viewModelFactory = obj.create;
            }
           return new Component(name,viewModelFactory,template);
    };
    // kc.components = components;
    
    return kc;
});
}(window["jQuery"]);
