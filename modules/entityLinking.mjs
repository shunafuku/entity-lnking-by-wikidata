import morphologicalAnalysis from "./morphologicalAnalysis.mjs";

export default async function entityLinking(inputText, settingObj) {
  //形態素解析
  const morphologicalAnalysisResultArray = await morphologicalAnalysis(inputText);
  console.log(morphologicalAnalysisResultArray)
  //mediawiki_API 前方一致(検索ワード,結果取得上限数)
  async function promise_get_action_wbsearchentities(word, limit) {
    return new Promise((resolve) => {
      const urlw = "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" + word + "&limit=" + limit + "&language=ja&format=json&origin=*";
      fetch(urlw)
        .then(function (response) { return resolve(response.json()); })
        .catch(function (error) { console.log(error); });
    })
  }
  console.log(await promise_get_action_wbsearchentities('ネコ', 10))

  //リンキングテキスト
  const entityLinkedText = ''

  return entityLinkedText;
}
