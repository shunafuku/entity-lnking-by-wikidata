import morphologicalAnalysis from "./morphologicalAnalysis.mjs";
import searchEntityCandidate from "./searchEntity.mjs";
import decideEntity from "./decideEntity.mjs";
import addCategory from "./category.mjs";
import createLinkedText from "./createLinkedText.mjs";

//検索条件に適合する（検索する必要のある）単語の場合にTrueを返す
function needsSearch(morphologicalAnalysisResult, settingObj) {
  //NGWrod
  if (
    settingObj["ngWords"].indexOf(
      morphologicalAnalysisResult["surface_form"]
    ) != -1
  ) {
    // NGwordsのリストに含まれているとき
    return false;
  }
  //品詞選択
  if (settingObj["selectNounType"] == "nounOnly") {
    // 名詞のみの場合
    return !(morphologicalAnalysisResult["pos"] != "名詞");
  } else if (settingObj["selectNounType"] == "properNounOnly") {
    // 固有名詞のみの場合
    return !(morphologicalAnalysisResult["pos_detail_1"] != "固有名詞");
  } else if (settingObj["selectNounType"] == "whiteList") {
    //ホワイトリストの場合
    if (
      settingObj["whiteList"].indexOf(
        morphologicalAnalysisResult["pos_detail_1"]
      ) == -1
    ) {
      // pos_detail_1の値がホワイトリストになかった場合
      return false;
    } else if (
      settingObj["whiteList"].indexOf(
        morphologicalAnalysisResult["pos_detail_2"]
      ) == -1
    ) {
      // pos_detail_2の値がホワイトリストになかった場合
      return false;
    } else if (
      settingObj["whiteList"].indexOf(
        morphologicalAnalysisResult["pos_detail_3"]
      ) == -1
    ) {
      // pos_detail_3の値がホワイトリストになかった場合
      return false;
    }
  } else if (settingObj["selectNounType"] == "blackList") {
    // ブラックリストの場合
    if (
      settingObj["blackList"].indexOf(
        morphologicalAnalysisResult["pos_detail_1"]
      ) != -1
    ) {
      // pos_detail_1の値がブラックリストになかった場合
      return false;
    } else if (
      settingObj["blackList"].indexOf(
        morphologicalAnalysisResult["pos_detail_2"]
      ) != -1
    ) {
      // pos_detail_2の値がブラックリストになかった場合
      return false;
    } else if (
      settingObj["blackList"].indexOf(
        morphologicalAnalysisResult["pos_detail_3"]
      ) != -1
    ) {
      // pos_detail_3の値がブラックリストになかった場合
      return false;
    }
  } else {
    return true;
  }
  return true;
}

//EntityLinkingを行う関数
export default async function entityLinking(inputText, settingObj) {
  performance.mark("start");
  //設定
  console.log("設定情報");
  console.log(settingObj);

  //形態素解析
  const morphologicalAnalysisResults = await morphologicalAnalysis(inputText);
  performance.mark("morphologicalAnalysis");
  console.log("形態素解析");
  console.log(morphologicalAnalysisResults);

  //エンティティ候補取得
  const searchResults = await Promise.all(
    morphologicalAnalysisResults.map(async (result) => {
      if (needsSearch(result, settingObj)) {
        result["candidate"] = await searchEntityCandidate(
          result["surface_form"],
          settingObj
        );
      } else {
        result["candidate"] = null;
      }
      return result;
    })
  );
  performance.mark("searchEntity");
  console.log("候補取得後");
  console.log(searchResults);

  //エンティティ決定
  const decideResults = await decideEntity(searchResults, settingObj);
  performance.mark("decideEntity");
  console.log("エンティティ決定後");
  console.log(decideResults);

  //category付与
  const addCategoryResult = await addCategory(decideResults);
  performance.mark("addCategory");
  console.log("category追加");
  console.log(addCategoryResult);

  // //category頻度
  // const frequencyOfCategories = new Map();
  // addCategoryResult.forEach((x) => {
  //   if (x["category"] == null) {
  //   } else {
  //     x["category"].map((y) => {
  //       if (frequencyOfCategories.get(y) == null) {
  //         frequencyOfCategories.set(y, 1);
  //       } else {
  //         frequencyOfCategories.set(y, frequencyOfCategories.get(y) + 1);
  //       }
  //     });
  //   }
  // });
  // console.log("Category頻度");
  // for (const x of [...frequencyOfCategories.entries()].sort((a, b) => {
  //   return a[1] - b[1];
  // })) {
  //   console.log(x);
  // }

  //リンキングテキスト生成
  const entityLinkedText = createLinkedText(
    addCategoryResult,
    settingObj["checkedCategories"],
    settingObj["displayPage"],
    {
      siteNameDisplayingEntity: settingObj["displayPage"],
      checkedCategories: settingObj["checkedCategories"],
    }
  );
  performance.mark("end");

  performance.measure(
    "morphologicalAnalysisTime",
    "start",
    "morphologicalAnalysis"
  );
  performance.measure(
    "searchEntityTime",
    "morphologicalAnalysis",
    "searchEntity"
  );
  performance.measure("decideEntityTime", "searchEntity", "decideEntity");
  performance.measure("addCategoryTime", "decideEntity", "addCategory");
  performance.measure("createLinkedTextTime", "addCategory", "end");
  performance.measure("allTime", "start", "end");
  console.log(performance.getEntriesByType("measure"));

  performance.clearMarks();
  performance.clearMeasures();

  return entityLinkedText;
}
