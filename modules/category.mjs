/*
SELECT DISTINCT ?type WHERE {
  wd:Q169960 wdt:P31/wdt:P279* ?type .
}LIMIT 300
*/
import fetchSparql from './sparql.mjs';

async function fetchCategory(id) {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  const sparqlQuery =
    'SELECT DISTINCT ?type WHERE { wd:' +
    id +
    ' wdt:P31/wdt:P279* ?type . }LIMIT 300';
  const category = await fetchSparql(endpointUrl, sparqlQuery);
  return category['results']['bindings'].map((binding) => {
    return binding['type']['value'].match(/Q[0-9]*/)[0];
  });
}

export default async function addCategory(decideResults){
  console.log('Category追加開始')
  const sleep = ms => new Promise(reserve => setTimeout(reserve, ms));
  let cache = new Map();
  let resultArray = [];

  for(const x of decideResults){
    if (x["linkedEntity"] != null) {
      const wikidataId = x["linkedEntity"]["id"];
      if(cache.get(wikidataId) == null){
        x["category"] = await fetchCategory(wikidataId);
        cache.set(wikidataId, x["category"]);
        await sleep(50);
      }else{
        x["category"] = cache.get(wikidataId);
      }
      console.log(x["category"]);
    }
    resultArray.push(x)
  }
  return await Promise.all(
    resultArray
    // decideResults.map(async (x) => {
    //   if (x["linkedEntity"] != null) {
    //     x["category"] = await fetchCategory(x["linkedEntity"]["id"]);
    //   }
    //   return x;
    // })
  );
}