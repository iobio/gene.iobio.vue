export default class CivicEndpoint {
    constructor() {
        this.api = 'https://civicdb.org/api';
        this.linkUrl = 'https://civicdb.org/links'
    }

    /* Wraps getGeneInfo in a promise */
    promiseGetGeneInfo(geneName) {
        let self = this;
        return new Promise((resolve,reject) => {
            self.getGeneInfo(geneName)
                .done(response => {
                    resolve(response.data);
                })
                .fail(error => {
                    console.log("Unable to get gene info from CIViC for " + geneName);
                    reject(error);
                })
        })
    }

    /* Queries the CIVIC API for information, including annotated variants, about a gene.
     * The geneName parameter must be the official entrez symbol for reliable queries.
     * Example query: curl https://civicdb.org/api/genes/ALK?identifier_type=entrez_symbol */
    getGeneInfo(geneName) {
        let self = this;
        return $.ajax({
            url: self.api + '/genes/' + geneName + '?identifier_type=entrez_symbol',
            type: 'GET',
            contentType: 'application/json',
            headers: {}
        });
    }

    /* Wraps getVariantInfo in a promise */
    promiseGetVariantInfo(varId) {
        let self = this;
        return new Promise((resolve,reject) => {
            self.getVariantInfo(varId)
                .done(response => {
                    resolve(response.data);
                })
                .fail(error => {
                    console.log("Unable to get variant info from CIViC for " + varId);
                    reject(error);
                })
        })
    }

    /* Queries the CIVIC API for information about a specific variant.
     * The variantId must be a CIVIC ID for reliable queries.
     * Example query: curl https://civicdb.org/api/variants/8 */
    getVariantInfo(varId) {
        let self = this;
        return $.ajax({
            url: self.api + '/variants/' + varId,
            type: 'GET',
            contentType: 'application/json',
            headers: {}
        });
    }

    /* Returns a CIVIC link to a variant page.
     * The variantId must be a CIVIC ID for reliable queries. */
    getVariantLink(varId) {
        let self = this;
        return self.linkUrl + '?idtype=variant&id=' + varId;
    }
}