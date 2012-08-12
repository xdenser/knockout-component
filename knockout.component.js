/**
 * Copyright: Denys Khanzhiyev
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

var  kc = {};
(function(kc){


    var
        components = {};


    function BindComponentProperty(name,instance,binding,parentContext) {
        var
            blockMine = false, blockOther = false, bindToObj, subscriptions=[];

        if (ko.isSubscribable(instance[name])){
            if (ko.isWriteableObservable(binding) ) subscriptions.push(instance[name].subscribe(function (val) {
                if (blockMine) return;
                blockMine = true;
                binding(val);
                blockMine = false;
            }));
        } else instance[name] = ko.unwrapObservable(binding);

        if (ko.isSubscribable(binding)){
          if( ko.isWriteableObservable(instance[name])) subscriptions.push(binding.subscribe(function (val) {
            if (blockOther) return;
            blockOther = true;
            instance[name](val);
            blockOther = false;
          }))
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
                componentBind = bindings['componentBind'],
                componentOptions = bindings['componentOptions'],
                subscriptions=[],
                oldInstance = ko.utils.domData.get(element, componentVMInstanceDomDataKey),
                newInstance = components[name].factory(componentOptions);
                // if(oldInstance) make something with it
                ko.utils.domData.set(element, componentVMInstanceDomDataKey,newInstance);


            if(componentBind && (typeof componentBind == 'object' && componentBind != null)){
                for(var prop in componentBind) {
                    if(componentBind.hasOwnProperty(prop)) {
                        subscriptions = subscriptions.concat(BindComponentProperty(prop,newInstance,componentBind[prop],bindingContext));
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

            var  val = valueAccessor(), name;

            valueUnwrapped = ko.utils.unwrapObservable(val);
            if(typeof valueUnwrapped == "string") {
                name = valueUnwrapped;
            }
            else throw new Error('component binding value must be component name');
            if(!components[name]) throw new Error('component not found '+name);


            templateSubscription = ko.renderTemplate(components[name].template, childBindingContext, {}, element);
            disposeOldSubscriptionAndStoreNewOne(element, templateSubscription);
        }
    }




    function Component(name,factory,template)
    {
        components[name] = this;
        this.factory = factory;
        this.template = template;
    }


    kc.component = function(name,template,viewModelFactory){
           return new Component(name,viewModelFactory,template);
    };
    // kc.components = components;

})(kc);


