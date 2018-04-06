import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import $ from 'jquery';
import FacetedSearch from './common/faceted-search';

export default class Category extends CatalogPage {
    loaded() {
        console.log(this.context.categoryBreadCrumb);
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }
        let isInterfaceCategory = false;
        let namesArray = [];
        [].forEach.call(this.context.categoryBreadCrumb, value => {
            if(isInterfaceCategory){
                namesArray.push(value.name);
            }
            if(value.name.toUpperCase() == 'INTERFACES'){
                isInterfaceCategory = true;
            }
        });
        if(isInterfaceCategory){
            $('#categoryNameCustom').html(namesArray.join(' '));
        }
        var brands = {};
        $('[data-brand-label]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const brandId = $attribute.data('brand-label');
            if (brandId.length > 0){
                brands[brandId] = 1;
                console.log("BRAND: " + brandId);
            }

        });
        let key;
        for (key in brands) {
            if (brands.hasOwnProperty(key)) {
                let brand = {}
                $($('[data-brand-label='+key+']', this.$scope)[0]).show();       
            }
        }

    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }
}
