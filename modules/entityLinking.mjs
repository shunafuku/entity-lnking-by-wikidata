import morphologicalAnalysis from "./morphologicalAnalysis.mjs";
import entityCandidateSearch from "./entitySearch.mjs";
import entityDecide from "./entityDecide.mjs";
import fetchCategory from "./category.mjs";
import createLinkedText from "./createLinkedText.mjs";

function isNgWord(word, ngWords) {
  if (ngWords.indexOf(word) != -1) {
    return true;
  }
  return false;
}
//検索条件に適合する（検索する必要のある）単語の場合にTrueを返す
function needsSearch(morphologicalAnalysisResult, settingObj) {
  //NGWrod
  if (
    isNgWord(morphologicalAnalysisResult["surface_form"], settingObj["ngWords"])
  ) {
    return false;
  }
  //品詞選択
  if (settingObj["selectNounType"] == "nounOnly") {
    if (morphologicalAnalysisResult["pos"] != "名詞") {
      return false;
    }
  } else if (settingObj["selectNounType"] == "properNounOnly") {
    if (morphologicalAnalysisResult["pos_detail_1"] != "固有名詞") {
      return false;
    }
  } else if (settingObj["selectNounType"] == "whiteList") {
    if (
      settingObj["whiteList"].indexOf(
        morphologicalAnalysisResult["pos_detail_1"]
      ) == -1
    ) {
      return false;
    } else if (
      settingObj["whiteList"].indexOf(
        morphologicalAnalysisResult["pos_detail_2"]
      ) == -1
    ) {
      return false;
    } else if (
      settingObj["whiteList"].indexOf(
        morphologicalAnalysisResult["pos_detail_3"]
      ) == -1
    ) {
      return false;
    }
  } else if (settingObj["selectNounType"] == "blackList") {
    if (
      settingObj["blackList"].indexOf(
        morphologicalAnalysisResult["pos_detail_1"]
      ) != -1
    ) {
      return false;
    } else if (
      settingObj["blackList"].indexOf(
        morphologicalAnalysisResult["pos_detail_2"]
      ) != -1
    ) {
      return false;
    } else if (
      settingObj["blackList"].indexOf(
        morphologicalAnalysisResult["pos_detail_3"]
      ) != -1
    ) {
      return false;
    }
  } else {
    return true;
  }
  return true;
}

//EntityLinkingを行う関数
export default async function entityLinking(inputText, settingObj) {
  //設定
  console.log(settingObj);

  //形態素解析
  const morphologicalAnalysisResults = await morphologicalAnalysis(inputText);
  console.log(morphologicalAnalysisResults);

  //エンティティ候補取得
  const searchResults = await Promise.all(
    morphologicalAnalysisResults.map(async (result) => {
      if (needsSearch(result, settingObj)) {
        result["candidate"] = await entityCandidateSearch(
          result["surface_form"],
          settingObj
        );
      } else {
        result["candidate"] = null;
      }
      return result;
    })
  );
  console.log("候補取得後");
  console.log(searchResults);

  //エンティティ決定
  const decideResults = await entityDecide(searchResults, settingObj);
  console.log("エンティティ決定後");
  console.log(decideResults);

  //category付与
  const addCategoryResult = (settingObj['checkedCategories'].length == 0) ? decideResults : await Promise.all(
    decideResults.map(async (x) => {
      if (x["linkedEntity"] != null) {
        x["category"] = await fetchCategory(x["linkedEntity"]["id"]);
      }
      return x;
    })
  );

  //リンキングテキスト生成
  const entityLinkedText = createLinkedText(
    addCategoryResult,
    settingObj["checkedCategories"],
    settingObj["displayPage"],
    {
      siteNameDisplayingEntity: settingObj["displayPage"],
      checkedCategories: settingObj['checkedCategories']
    }
  );
  return entityLinkedText;
}
