import morphologicalAnalysis from './morphologicalAnalysis.mjs';
import EntityLinkingCandidateSearcher from './search.mjs'

export default async function entityLinking(inputText, settingObj) {
  //形態素解析
  const morphologicalAnalysisResultArray = await morphologicalAnalysis(inputText);
  console.log(morphologicalAnalysisResultArray)
  //検索
  const searcher = new EntityLinkingCandidateSearcher('ネコ', 10);
  if(settingObj.searchType == 'exactMatchSearch'){
    const neko = await searcher.exactMatchSearch();
    console.log(neko)
  }else if(settingObj.searchType == 'prefixSearch'){
    const neko = await searcher.prefixSearch();
    console.log(neko)
  }else if(settingObj.searchType == 'approximateSearch'){
    const neko = await searcher.approximateSearch();
    console.log(neko)
  }


  //リンキングテキスト
  const entityLinkedText = ''

  return entityLinkedText;
}
