import fetchSparql from '../sparql.mjs'

export default async function fetchWikipedhiaUrlFromWikidataId(wikidataUrl) {
    const regex1 = RegExp('wiki/(Q[0-9]*)');
    const wikidataId = regex1.exec(wikidataUrl)[1];
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const query = `PREFIX schema: <http://schema.org/>
    PREFIX wd: <http://www.wikidata.org/entity/>
    select ?s where {
      ?s schema:about wd:${wikidataId} ;
         schema:inLanguage 'ja' ;
         schema:isPartOf <https://ja.wikipedia.org/> .
    }LIMIT 1
    `;
    const result = await fetchSparql(endpointUrl, query);
    if(result['results']['bindings'][0]['s']['value'] != null){
        return result['results']['bindings'][0]['s']['value']
    }else {
        return null;
    }
    

}