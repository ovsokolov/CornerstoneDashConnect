/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import urlUtils from './common/url-utils';
import { classifyForm } from './common/form-utils';

import utils from '@bigcommerce/stencil-utils';


export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$productOptions = this.context.productOptions;

        this.$optionViewSet = false;
        this.$templateNumber = "";

        console.log("product constructor");

        this.setUpProductView = this.setUpProductView.bind(this);
        this.setOptionsView = this.setOptionsView.bind(this);
        this.setAccesoriesView = this.setAccesoriesView.bind(this);

        $('body').on('submit', '[data-wishlist-add]', (event) => {
                console.log("submit add wisg list");
                if(this.context.currentCustomer == null) {
                    return false;
                }else{
                    return true;
                }
        });

    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        const productCustomFields = this.context.productCustomFields;
        for (const customField in productCustomFields) {
            if(productCustomFields[customField].name == 'ACCESSORIES_LIST'){
                $('#accListBtn').show();            
            }
            if(productCustomFields[customField].name == 'TEMPLATE_NUMBER'){
                this.$templateNumber = "LIST_" +  productCustomFields[customField].value;           
            }
        }

        $('body').on('click', '[data-customize-button="customize-button"]', () => {
            //this.setOptionsView();
            this.setAccesoriesView();
        });


        //params.permit(:id, :user_email, :user_type, :req_type, :make, :model, :year, :option, :interface, :brand, :description)
        $('body').on('click', '[data-notify-back-button="notify-back"]', () => {
            const productCustomFields = this.context.productCustomFields;
            console.log(productCustomFields);
            var urlEncodedData = "";
            var urlEncodedDataPairs = [];
            urlEncodedDataPairs.push(encodeURIComponent('user_email') + '=' + encodeURIComponent('test@gmail.com'));
            urlEncodedDataPairs.push(encodeURIComponent('user_type') + '=' + encodeURIComponent('GUEST'));
            urlEncodedDataPairs.push(encodeURIComponent('req_type') + '=' + encodeURIComponent('S'));
            urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
            const XHR = urlUtils.createCORSRequest('POST', 'http://localhost:3000/wishlists');
            // Add the required HTTP header for form data POST requests
            XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            // Finally, send our data.
            XHR.send(urlEncodedData);
            //this.setOptionsView();
            //var person = prompt("Please provide your email:", "");
            //console.log(person);
            console.log("notify back");
            console.log(this.context.currentCustomer);
        });
        $('body').on('click', '[data-notify-back-button="add-whishlist"]', () => {
            const productCustomFields = this.context.productCustomFields;
            console.log(productCustomFields);
            var urlEncodedData = "";
            var urlEncodedDataPairs = [];
            urlEncodedDataPairs.push(encodeURIComponent('user_email') + '=' + encodeURIComponent('test@gmail.com'));
            urlEncodedDataPairs.push(encodeURIComponent('user_type') + '=' + encodeURIComponent('GUEST'));
            urlEncodedDataPairs.push(encodeURIComponent('req_type') + '=' + encodeURIComponent('W'));
            urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
            const XHR = urlUtils.createCORSRequest('POST', 'http://localhost:3000/wishlists');
            // Add the required HTTP header for form data POST requests
            XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            // Finally, send our data.
            XHR.send(urlEncodedData);
            //this.setOptionsView();
            //var person = prompt("Please provide your email:", "");
            //console.log(person);
            console.log("add wishlist");
            console.log(this.context.currentCustomer);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        next();
    }

    after(next) {
        console.log("in after");
        this.productReviewHandler();

        next();

        this.setUpProductView();
        //this.setOptionsPrice();

    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.click();
        }
    }

    setUpProductView() {
        console.log("in setUpProductView: 1");
        const productCustomFields = this.context.productCustomFields;
        console.log("in setUpProductView: ", productCustomFields);
        let setName = '';
        let features = '';
        let tempalte = this.$templateNumber;
        /*
        for (const customField in productCustomFields) {
            if(productCustomFields[customField].name == 'FeaturesList'){
                features = productCustomFields[customField].value;             
            }
        }
        */
        console.log('Feature: ', this.$templateNumber);
        $.ajax({
            url : 'http://ovsokolov-gmail-com2.mybigcommerce.com/content/optionsetconfig.json',
            type : 'GET',
            async: false,
            dataType: "json",
            success: function(data){
                // console.log('Set: ', data.optionsets[setName]);
                //const fList = features.split('_');
                console.log("Template Number: " + tempalte);
                const fList = data.featureslist[tempalte];
                console.log(data.featureslist);
                console.log(fList);
                Object.keys(fList).forEach(function(key,index) {
                    // key: the name of the object key
                    console.log("Key: " + key + " Value: " + fList[key]);
                    // index: the ordinal position of the key within the object
                    let keyValue = fList[key];
                    if(keyValue != 1){
                        console.log(data.features);
                        const featureImg = data.features[key].image;
                        const featureHd = data.features[key].heading;
                        const featureCnt = data.features[key].contents;
                        const note = data.features["NOTE"].contents;
                        $('<div class="DescpTab_Wrap"><div class="TabCircle"><img class="__mce_add_custom__" title="" src="'+featureImg+'" alt="" width="256" height="256"></div><div class="TabText">'+featureHd+'</div></div>').appendTo('#icon-list'); 
                        if(keyValue == 3){
                            $('<div class="DescpContent_Wrap"><div class="DescpContent_img"><img src="'+featureImg+'" /></div><div class="DescpContent_txt"><h6>'+featureHd+'</h6><p>'+featureCnt+'</p><p><font color="red">'+note+'</font></p></div></div>').appendTo('#features-list');  
                        }else{
                            $('<div class="DescpContent_Wrap"><div class="DescpContent_img"><img src="'+featureImg+'" /></div><div class="DescpContent_txt"><h6>'+featureHd+'</h6><p>'+featureCnt+'</p></div></div>').appendTo('#features-list');                              
                        }
                    }
                });
                /*     
                $.each(fList, function (index, value) {
                    console.log('#### FEATURE ####: ', value);
                    const featureImg = data.features[value].image;
                    const featureHd = data.features[value].heading;
                    const featureCnt = data.features[value].contents;
                    console.log('#### featureImg ####: ', featureImg);
                    console.log('#### featureHd ####: ', featureHd);
                    console.log('#### featureCnt ####: ', featureCnt);
                    $('<div class="DescpTab_Wrap"><div class="TabCircle"><img class="__mce_add_custom__" title="" src="'+featureImg+'" alt="" width="256" height="256"></div><div class="TabText">'+featureHd+'</div></div>').appendTo('#icon-list'); 
                    $('<div class="DescpContent_Wrap"><div class="DescpContent_img"><img src="'+featureImg+'" /></div><div class="DescpContent_txt"><h6>'+featureHd+'</h6><p>'+featureCnt+'</p></div></div>').appendTo('#features-list'); 
                });

                $('#options-categories').show();
                */
                //console.log('Categories: ', data.categories);
                //console.log('Set 1:', data.optionsets['S1']);
                console.log('#####Custom Fields Names#######');
                console.log(data.customfields);
                for (const customField in productCustomFields) {
                    if(data.customfields[productCustomFields[customField].name] !== undefined){
                        const customFieldName = data.customfields[productCustomFields[customField].name];
                        console.log(data.customfields[productCustomFields[customField].name]);
                        //$('<div class="product_custom_field_box"><div class="product_custom_fields productView-info-name">'+data.customfields[productCustomFields[customField].name+'</div><div class="product_custom_fields productView-info-value">'+productCustomFields[customField].value+'</div></div>').appendTo('#custom_field_wrap');
                        $('<div class="product_custom_field_box"><div class="product_custom_fields productView-info-name">'+customFieldName+'</div><div class="product_custom_fields productView-info-value">'+productCustomFields[customField].value+'</div></div>').appendTo('#custom_field_wrap');
                    }
                }
            },
            error: function(xhr, ajaxOptions, thrownError){
                console.log('ERROR = ' + xhr.status + ' - ' + thrownError);
            }       
        });
    }

    setAccesoriesView() {
        if( this.$optionViewSet ==  true ){
            console.log('Option already set');
            return;
        }
        const productCustomFields = this.context.productCustomFields;
        // console.log(productCustomFields);
        let setName = '';
        let features = '';
        for (const customField in productCustomFields) {
            // console.log(productCustomFields[customField]);
            if(productCustomFields[customField].name == 'ACCESSORIES_LIST'){
                setName = "LIST_" + productCustomFields[customField].value;  
                // console.log(setName);           
            }
        }
        console.log('Feature: ', features);
        $.ajax({
            url : 'http://ovsokolov-gmail-com2.mybigcommerce.com/content/optionsetconfig.json',
            type : 'GET',
            async: false,
            dataType: "json",
            success: function(data){
                console.log('Set: ', data);
                //console.log(data.accessorieslist[setName]);  
                data.accessorieslist[setName].categories.forEach((category) => {
                    console.log('Category: ' + category.NAME);
                    // console.log(data.categories[category.name]);
                    const cIcon = data.accessories_categories[category.NAME].icon;
                    const cTitle = data.accessories_categories[category.NAME].description;
                    const cName = data.accessories_categories[category.NAME].name; // take it from json
                    console.log('CNAME: ' + cName);
                    if(category.OPTIONS.length > 0){
                        $('<div class="optionSet"><div class="optionheading optionbox"><span class="hdIcon"><img src="'+cIcon+'" /></span><span class="labeltxt">'+cTitle+'</span><span class="selectedoption"></span><i class="icon" aria-hidden="true"><svg><use xlink:href="#icon-remove"></use></svg></i></div><div class="optionStep optionRadioSet" id="DIV-'+cName+'"></div></div>').insertBefore('#options-categories');  
                        [].forEach.call(category.OPTIONS, value => {
                            console.log("OPTION VALUE");
                            console.log(value);
                            let optionType = value;
                            const accDivId = '#DIV-' + cName;
                            $('<div id="DIV-'+optionType+'"></div>').appendTo(accDivId);
                            const optionId = data.accessories[value];
                            console.log(optionId);
                            utils.api.product.getById(
                                optionId,
                                { template: 'products/_nt-product-list' },
                                //{ template: 'products/_nt-product-option-view-json' },
                                (err, resp) => {
                                    //const result = JSON.parse(resp.replace(/&quot;/g, '"'));
                                    //console.log(result);
                                    
                                    const divId = '#DIV-' + optionType;
                                    $(resp).appendTo(divId);   
                                    // attach event listener
                                    const buttonId = 'btn_option_details_'.concat(optionId);
                                    // console.log("buttonId: ", buttonId);
                                    const buttonEllement = document.getElementById(buttonId);
                                    // console.log(buttonEllement);
                                    const productId = optionId;
                                    // console.log("Calling with", productId)
                                    buttonEllement.addEventListener('click', (event) => {
                                        console.log("Product: ", productId);
                                        let $modal = $('#previewModal'),
                                        $modalContent = $('.modal-content', $modal),
                                        $modalOverlay = $('.loadingOverlay', $modal),
                                        modalModifierClasses = 'modal--large';
                                        utils.api.product.getById(
                                            productId,
                                            //{ params: { debug: "bar" } },
                                            { template: 'products/_nt-product-option-view' },
                                            //{ template: 'products/_nt-product-option-view-json' },
                                            (err, resp) => {
                                                //const result = JSON.parse(resp.replace(/&quot;/g, '"'));
                                                //console.log(result);
                                                event.preventDefault();
                                                // clear the modal
                                                $modalContent.html('');
                                                $modalOverlay.show();
                                                $modal.foundation('reveal', 'open');
                                                $modalOverlay.hide();
                                                $modalContent.html(resp);
                                            }
                                        );
                                    }); 
                                }                
                            ); //util
                        }); //end [].forEach 
                    }
                }); //data.accessorieslist[setName].categories.forEach((category) 

            },
            error: function(xhr, ajaxOptions, thrownError){
                console.log('ERROR = ' + xhr.status + ' - ' + thrownError);
            }       
        }); // ajax
        
        $('[data-product-category-change]').show();
        this.$optionViewSet = true;

        $(function() {
            //$('.optionheading + div').hide();
            $('.optionheading').click(function(){
                if($(this).next().is(':hidden')) {
                    //$('.optionheading').removeClass('current').next().slideUp('slow');
                    $(this).toggleClass('current').next().slideDown('slow');
                    $(this).find("use").attr("xlink:href", "#icon-remove");
                }
                else{
                    $(this).next().slideToggle('slow');
                    //$(".optionheading + div").not($(this).next()).slideUp('slow');
                    $('.optionheading').removeClass('current');
                    $(this).find("use").attr("xlink:href", "#icon-add");
                }
            });
        });       
    }

    setOptionsView() {
        if( this.$optionViewSet ==  true ){
            console.log('Option already set');
            return;
        }
        const productCustomFields = this.context.productCustomFields;
        // console.log(productCustomFields);
        let setName = '';
        let features = '';
        for (const customField in productCustomFields) {
            // console.log(productCustomFields[customField]);
            if(productCustomFields[customField].name == 'OptionsSet'){
                setName = productCustomFields[customField].value;             
            }
        }
        console.log('Feature: ', features);
        $.ajax({
            url : 'http://ovsokolov-gmail-com2.mybigcommerce.com/content/optionsetconfig.json',
            type : 'GET',
            async: false,
            dataType: "json",
            success: function(data){
                // console.log('Set: ', data.optionsets[setName]);
                data.optionsets[setName].categories.forEach((category) => {
                    // console.log('Category Name: ' + category.name);
                    // console.log(data.categories[category.name]);
                    const cIcon = data.categories[category.name].icon;
                    const cTitle = data.categories[category.name].name;
                    const cName = data.categories[category.name].category; // take it from json
                    console.log('CNAME: ' + cName);
                    $('<div class="optionSet"><div class="optionheading optionbox"><span class="hdIcon"><img src="'+cIcon+'" /></span><span class="labeltxt">'+cTitle+'</span><span class="selectedoption"></span><i class="icon" aria-hidden="true"><svg><use xlink:href="#icon-remove"></use></svg></i></div><div class="optionStep optionRadioSet" id="DIV-'+cName+'"></div></div>').insertBefore('#options-categories');  
                    const optionsEllements = document.querySelectorAll('[data-step-name]');
                    console.log('##################');
                    console.log('optionsEllements:', optionsEllements);
                    [].forEach.call(optionsEllements, value => {
                    //optionsEllements.forEach((value) => {
                        const stepName = value.getAttribute('data-step-name');
                        console.log('stepName: ', stepName);
                        if(stepName.indexOf(cName) == 0){
                            console.log('appends to step name');
                            const divId = '#DIV-' + cName;
                            $(value).appendTo(divId);
                        }
                        // console.log("Div Name: ", value.dataset.stepName);
                    });
                });

            },
            error: function(xhr, ajaxOptions, thrownError){
                console.log('ERROR = ' + xhr.status + ' - ' + thrownError);
            }       
        });

        // console.log('before this.$productOptions.forEach');

        let optionCounter = 0;
        this.$productOptions.forEach((optionSet) => {
            // console.log('inside this.$productOptions.forEach');
            const values = optionSet.values;
            // console.log('L2: ',optionSet);
            values.forEach((value) => {
                const spanId = '#price_'.concat(value.data);
                // console.log('L2: ',value.data);
                utils.api.product.getById(
                    value.data,
                    // { params: { debug: "context" } },
                    { template: 'products/_nt-product-price-json' },
                    (err, resp) => {
                        const result = JSON.parse(resp.replace(/&quot;/g, '"'));
                        // console.log(result);
                        optionSet.price = result.price.without_tax.formatted;
                        $(spanId).html('<s>'.concat('Regular Price: +', result.price.without_tax.formatted, '</s> <span class="bundle_price">Bundle Price: +<span id="data-bundle-price-', value.id, '">', result.price.without_tax.formatted, '</span></span>' ));
                    }
                );
                // attach event listener
                const buttonId = 'btn_option_details_'.concat(value.data);
                // console.log("buttonId: ", buttonId);
                const buttonEllement = document.getElementById(buttonId);
                // console.log(buttonEllement);
                const productId = value.data;
                // console.log("Calling with", productId)
                buttonEllement.addEventListener('click', (event) => {
                    console.log("Product: ", productId);
                    let $modal = $('#previewModal'),
                    $modalContent = $('.modal-content', $modal),
                    $modalOverlay = $('.loadingOverlay', $modal),
                    modalModifierClasses = 'modal--large';
                    utils.api.product.getById(
                        productId,
                        //{ params: { debug: "bar" } },
                        { template: 'products/_nt-product-option-view' },
                        //{ template: 'products/_nt-product-option-view-json' },
                        (err, resp) => {
                            //const result = JSON.parse(resp.replace(/&quot;/g, '"'));
                            //console.log(result);
                            event.preventDefault();

                            // clear the modal

                            $modalContent.html('');
                            $modalOverlay.show();
                            $modal.foundation('reveal', 'open');
                            $modalOverlay.hide();
                            $modalContent.html(resp);
                        }
                    );
                });
            });
        });
        console.log(this.$productOptions);

        $('[data-product-category-change]').show();
        this.$optionViewSet = true;

        $(function() {
            //$('.optionheading + div').hide();
            $('.optionheading').click(function(){
                if($(this).next().is(':hidden')) {
                    //$('.optionheading').removeClass('current').next().slideUp('slow');
                    $(this).toggleClass('current').next().slideDown('slow');
                    $(this).find("use").attr("xlink:href", "#icon-remove");
                }
                else{
                    $(this).next().slideToggle('slow');
                    //$(".optionheading + div").not($(this).next()).slideUp('slow');
                    $('.optionheading').removeClass('current');
                    $(this).find("use").attr("xlink:href", "#icon-add");
                }
            });
        });
    }
}
