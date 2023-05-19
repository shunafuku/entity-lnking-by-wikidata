import morphologicalAnalysis from "./morphologicalAnalysis.mjs";
import entityCandidateSearch from "./entitySearch.mjs";
import EntityDecider from "./entityDecide.mjs";
import fetchCategory from "./category.mjs";

function getCategoryClass(categoryArray, selectCategories) {
  const category = {
    "category-0": {
      value: "活動",
      color: "255, 143, 143",
      wikidataId: "Q1914636",
    },
    "category-1": {
      value: "解剖学的構造",
      color: "220, 220, 220",
      wikidataId: "Q112826905",
    },
    "category-2": {
      value: "疾患",
      color: "117, 214, 161",
      wikidataId: "Q12136",
    },
    "category-3": {
      value: "薬",
      color: "255, 255, 0",
      wikidataId: "Q8386",
    },
    "category-4": {
      value: "組織",
      color: "204, 179, 255",
      wikidataId: "Q43229",
    },
    "category-5": {
      value: "人物",
      color: "255, 165, 0",
      wikidataId: "Q5",
    },
    "category-6": {
      value: "場所",
      color: "255, 218, 185",
      wikidataId: "Q17334923",
    },
    "category-7": {
      value: "化学物質",
      color: "0, 255, 255",
      wikidataId: "Q79529",
    },
    "category-8": {
      value: "生物",
      color: "0, 255, 0",
      wikidataId: "Q7239",
    },
    "category-9": {
      value: "仕事",
      color: "255, 192, 203",
      wikidataId: "Q386724 ",
    },
  };
  if(categoryArray != null){
    for (const checkedCategory of selectCategories) {
      if (categoryArray.indexOf(category[checkedCategory]["wikidataId"]) != -1) {
        return checkedCategory;
      }
    }
  }
  return "";
}

function createLinkedText(textArray, selectCategories, displayPage) {
  console.log(selectCategories);
  console.log(selectCategories.length);
  if (displayPage == "kgs") {
    return textArray
      .map((x) => {
        if (x["linkedEntity"] == null) {
          return x["word"];
        } else {
          const wikidataId = x["linkedEntity"]["id"];
          const categoryArray = x["category"];
          const categoryClass = getCategoryClass(categoryArray, selectCategories);
          const kgsLink =
            "'https://kgs.hozo.jp/sample/details.html?key=wd:" +
            x["linkedEntity"]["id"] +
            "'";
          return (
            "<a " +
            'class="' +
            categoryClass +
            '" ' +
            'href="javascript:ShowDetails(' +
            kgsLink +
            ')"' +
            ">" +
            x["word"] +
            "</a>" +
            " "
          );
        }
      })
      .join("");
  } else {
    return textArray
      .map((x) => {
        if (x["linkedEntity"] == null) {
          return x["word"];
        } else {
          return (
            "<a " +
            'href="' +
            x["linkedEntity"]["wikidataUrl"] +
            '" ' +
            'target="_blank" rel="noopener noreferrer" ' +
            ">" +
            x["word"] +
            "</a>" +
            " "
          );
        }
      })
      .join("");
  }
}
function removeDuplicates(linkedArray) {
  let appearedcombinationList = [];
  linkedArray.map((x) => {
    if (x["linkedEntity"] != null) {
      console.log(x);
      if (appearedcombinationList.indexOf(x["linkedEntity"]["id"]) == -1) {
        appearedcombinationList.push(x["linkedEntity"]["id"]);
      } else {
        x["linkedEntity"] = null;
      }
    }
    return x;
  });
  return linkedArray;
}
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

  //エンティティ候補の並び替え
  function matchTypeFiltering(selectMatchLabelType, searchResults) {
    if (selectMatchLabelType == "labelpriority") {
      return searchResults.map((result) => {
        if (result["candidate"] != null) {
          result["candidate"].sort((a, b) => {
            if (a["matchType"] == "label" && b["matchType"] == "alias") {
              return -1;
            }
            if (a["matchType"] == "label" && b["matchType"] == "alias") {
              return 1;
            }
            return 0;
          });
        }
        return result;
      });
    } else if (selectMatchLabelType == "labelOnly") {
      return searchResults.map((result) => {
        if (result["candidate"] != null) {
          result["candidate"] = result["candidate"].filter(
            (x) => x["matchType"] == "label"
          );
        }
        return result;
      });
    } else if (selectMatchLabelType == "aliasOnly") {
      return searchResults.map((result) => {
        if (result["candidate"] != null) {
          console.log(result["candidate"]);
          result["candidate"] = result["candidate"].filter(
            (x) => x["matchType"] == "alias"
          );
        }
        return result;
      });
    }
    return searchResults;
  }
  console.log(settingObj["selectMatchLabelType"]);
  const matchTypeFilteringResult = matchTypeFiltering(
    settingObj["selectMatchLabelType"],
    searchResults
  );
  console.log("matchTypeFilteringResult");
  console.log(matchTypeFilteringResult);

  //エンティティ決定
  const decider = new EntityDecider(matchTypeFilteringResult);
  const decideResults = await Promise.all(
    matchTypeFilteringResult.map(async (result) => {
      const decider = new EntityDecider(result["candidate"]);
      result["linkedEntity"] = decider.arrayFront();
      return {
        word: result["surface_form"],
        linkedEntity: decider.arrayFront(),
      };
    })
  );
  console.log("エンティティ決定後");
  console.log(decideResults);

  //重複削除
  const removeDuplicatesResult = removeDuplicates(decideResults);
  console.log("重複削除後");
  console.log(removeDuplicatesResult);

  //category付与
  const addCategoryResult = (settingObj['checkedCategories'].length == 0) ? removeDuplicatesResult : await Promise.all(
    removeDuplicatesResult.map(async (x) => {
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
    settingObj["displayPage"]
  );
  return entityLinkedText;
}
