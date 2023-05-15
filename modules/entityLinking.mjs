import morphologicalAnalysis from './morphologicalAnalysis.mjs';
import EntityCandidateSearcher from './entitySearch.mjs';
import EntityDecider from './entityDecide.mjs';

async function entityCandidateSearch(word, settingObj){
  const searcher = new EntityCandidateSearcher(word, settingObj.apiLimit);
  let result;
  if(settingObj.searchType == 'exactMatchSearch'){
    result = await searcher.exactMatchSearch();
  }else if(settingObj.searchType == 'prefixSearch'){
    result = await searcher.prefixSearch();
  }else if(settingObj.searchType == 'approximateSearch'){
    result = await searcher.approximateSearch();
  }
  return result;
}
function createLinkedText(textArray, displayPage){
  if(displayPage == 'kgs'){
    return textArray.map(x => {
      if(x['linkedEntity'] == null){
        return x['word']
      }else{
        const kgsLink =  "'https://kgs.hozo.jp/sample/details.html?key=wd:" + x['linkedEntity']['id'] + "'"
        return '<a ' + 'href="javascript:ShowDetails(' + kgsLink + ')"' + '>' + x['word'] + '</a>' + ' '
      }
    }).join('')
  }else{
    return textArray.map(x => {
      if(x['linkedEntity'] == null){
        return x['word']
      }else{
        return '<a ' + 'href="' + x['linkedEntity']['wikidataUrl'] + '" ' + 'target="_blank" rel="noopener noreferrer" ' + '>' + x['word'] + '</a>' + ' '
      }
    }).join('')
  }
  
}
function removeDuplicates(linkedArray){
  let appearedcombinationList = [];
  linkedArray.map(
    x => {
      
      if(x['linkedEntity'] != null){
        console.log(x)
        if(appearedcombinationList.indexOf(x['linkedEntity']['id']) == -1){
          appearedcombinationList.push(x['linkedEntity']['id'])
        }else{
          x['linkedEntity'] = null;
        }
      }
      return x;
    }
  )
  return linkedArray;
}

export default async function entityLinking(inputText, settingObj) {
  //形態素解析
  const morphologicalAnalysisResults = await morphologicalAnalysis(inputText);
  console.log(morphologicalAnalysisResults)

  //エンティティ候補取得
  const searchResults = await Promise.all(morphologicalAnalysisResults.map(async (result) => {
    if(result.pos == '名詞'){
      result['candidate'] = await entityCandidateSearch(result['surface_form'], settingObj)
    }else{
      result['candidate'] = null
    }
    return result;
  }))
  console.log('候補取得後')
  console.log(searchResults)

  //エンティティ決定
  const decider = new EntityDecider(searchResults);
  const decideResults = await Promise.all(searchResults.map(async (result) => {
    const decider = new EntityDecider(result['candidate']);
    result['linkedEntity'] = decider.arrayFront();
    return {
      word: result['surface_form'],
      linkedEntity: decider.arrayFront()
    };
  }))
  console.log('エンティティ決定後');
  console.log(decideResults);
  //重複削除
  const removeDuplicatesResult = removeDuplicates(decideResults);

  //リンキングテキスト生成
  const entityLinkedText = createLinkedText(removeDuplicatesResult, settingObj['displayPage'])
  return entityLinkedText;
}
