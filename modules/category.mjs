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

export default async function addCategory(decideResults) {
  console.log('Category追加開始');
  const sleep = (ms) => new Promise((reserve) => setTimeout(reserve, ms));
  const splitTo2DArray = (array, num) => {
    const length = Math.ceil(array.length / num);
    return new Array(length)
      .fill()
      .map((_, i) => array.slice(i * num, (i + 1) * num));
  };

  const hoge = splitTo2DArray(decideResults, 20);
  let cache = new Map();
  let addCategoryArrays = [];
  for (const neko of hoge) {
    addCategoryArrays.push(
      await Promise.all(
        neko.map(async (x) => {
          if (x['linkedEntity'] != null) {
            const wikidataId = x['linkedEntity']['id'];
            if (cache.get(wikidataId) == null) {
              x['category'] = await fetchCategory(wikidataId);
              cache.set(wikidataId, x['category']);
            } else {
              x['category'] = cache.get(wikidataId);
            }
          }
          return x;
        })
      )
    );
    await sleep(50);
  }
  const resultArray = addCategoryArrays.reduce((accumulator, currentArray) => {
    accumulator.push(...currentArray);
    return accumulator;
  }, []);

  return await Promise.all(resultArray);
}
