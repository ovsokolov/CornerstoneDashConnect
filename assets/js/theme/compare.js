import PageManager from './page-manager';
import $ from 'jquery';
import swal from 'sweetalert2';

export default class Compare extends PageManager {
    loaded() {
        const message = this.context.compareRemoveMessage;

        $('body').on('click', '[data-comparison-remove]', (event) => {
            if (this.context.comparisons.length <= 2) {
                swal({
                    text: message,
                    type: 'error',
                });
                event.preventDefault();
            }
        });
        console.log(this.context.productComparisons);
        const comparisonList = this.context.productComparisons;
        let customFields = {};
        [].forEach.call(comparisonList, value => {
            //console.log(value.custom_fields);
            [].forEach.call(value.custom_fields, field => {
                //console.log(field);
                //console.log(field.name);
                if(customFields.hasOwnProperty(field.name)){
                    //console.log("has Property");
                    customFields[field.name][value.id] = field;
                }else{
                    //console.log("has Property");
                    customFields[field.name] = {};
                    customFields[field.name][value.id] = field;
                }
            });
        });
        console.log(customFields);
        $.ajax({
            url : 'http://ovsokolov-gmail-com2.mybigcommerce.com/content/optionsetconfig.json',
            type : 'GET',
            async: false,
            dataType: "json",
            success: function(data){
                Object.keys(data.customfields).forEach(function(key,index) {
                    console.log(key);
                    if(customFields.hasOwnProperty(key)){
                        let customRow = '<tr class="compareTable-row"><th class="compareTable-heading"><span class="compareTable-headingText">' + data.customfields[key] + '</th>';
                        console.log(customFields[key]);
                        [].forEach.call(comparisonList, value => {
                            if(customFields[key].hasOwnProperty(value.id)){
                                customRow = customRow +'<td class="compareTable-item">'+ customFields[key][value.id].value +'</td>';
                            }else{
                                customRow = customRow +'<td class="compareTable-item">N/A</td>';
                            }
                        });
                        customRow = customRow + '</tr>'
                        $(customRow).insertAfter($('.compareTable-row').last());
                    }
                });
            },
            error: function(xhr, ajaxOptions, thrownError){
                console.log('ERROR = ' + xhr.status + ' - ' + thrownError);
            }       
        });
    }
}
