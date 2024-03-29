//linkをwikidataIdに変換
async function fetchSparql(endpointUrl, sparqlQuery) {
  const fullUrl = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery);
  const headers = {
    Accept: 'application/sparql-results+json',
  };
  return fetch(fullUrl, { headers, method: 'GET', mode: 'cors' })
    .then((body) => {
      if (!body.ok) {
        console.error('サーバーエラー');
      }
      return body.json();
    })
    .catch((error) => {
      console.error('通信に失敗しました', error);
    });
}
function extractWikidataId(url) {
  const regex = /(Q\d+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  } else {
    console.log('一致する部分が見つかりませんでした');
    return null;
  }
}
async function fetchWikidataIdFromWikipediaUrl(wikipedhiaUrl) {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  const query = `PREFIX schema: <http://schema.org/>
      PREFIX wd: <http://www.wikidata.org/entity/>
      select ?o where {
        <${wikipedhiaUrl}> schema:about ?o ;
           schema:inLanguage 'ja' ;
           schema:isPartOf <https://ja.wikipedia.org/> .
      }LIMIT 1
      `;
  const result = await fetchSparql(endpointUrl, query);
  console.log('neko');
  console.log(query);
  console.log(result);
  if (result['results']['bindings'][0] != null) {
    return result['results']['bindings'][0]['o']['value'];
  } else {
    return null;
  }
}

function convert2TestObject(inputText) {
  let outputText = '';
  let ELResultArray = [];
  const regexATag = RegExp('(<a.*?>.*?</a>)');
  const splits = inputText.split(regexATag);
  splits.forEach((x) => {
    if (regexATag.test(x)) {
      //aタグの値を取得
      const regexATagValue = RegExp('<a.*?>(.*?)</a>');
      const aTagValue = regexATagValue.exec(x)[1];
      //aタグのurlを取得
      const regexATagHref = RegExp('<a.*?href=[\'"](.*?)[\'"].*?>.*?</a>');
      const aTagHref = regexATagHref.exec(x)[1];
      //aタグの値の開始位置と終了位置を取得
      const startPosition = outputText.length;
      const endPosition = startPosition + aTagValue.length - 1;
      //ELの結果を設定
      const ELResult = {
        startPosition: startPosition,
        endPosition: endPosition,
        link: aTagHref,
        label: aTagValue,
      };
      //出力テキストに、aタグの値を追加
      outputText += aTagValue;
      //ELの結果の配列に追加
      ELResultArray.push(ELResult);
    } else {
      //出力テキストに、aタグの値を追加
      outputText += x;
    }
  });
  return {
    outputText: outputText,
    ELResultArray: ELResultArray,
  };
}

const answerText = document.getElementById('answerText').value;
const answerTestObject = convert2TestObject(answerText);
console.log(answerTestObject);
const link2wikidataIdResultArray = await Promise.all(
  answerTestObject['ELResultArray'].map(async (x) => {
    const wikidataUrl = await fetchWikidataIdFromWikipediaUrl(
      'https://ja.wikipedia.org' + x['link']
    );
    const wikidataId = extractWikidataId(wikidataUrl);
    return {
      startPosition: x['startPosition'],
      endPosition: x['endPosition'],
      wikidataId: wikidataId,
      label: x['label'],
    };
  })
);
const link2wikidataIdResult = {
  outputText: answerTestObject['outputText'],
  ELResultArray: link2wikidataIdResultArray,
};
console.log(link2wikidataIdResult);
