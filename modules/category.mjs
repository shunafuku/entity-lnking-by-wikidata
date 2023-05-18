/*
SELECT DISTINCT ?type WHERE {
  wd:Q169960 wdt:P31/wdt:P279* ?type .
}LIMIT 300
*/
import fetchSparql from './sparql.mjs';

export default async function fetchCategory(id) {
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