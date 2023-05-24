//エンティティ候補の並び替え
function matchTypeFiltering(searchResults, selectMatchLabelType) {
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
  } else if(selectMatchLabelType == "default")
  return searchResults;
}

class EntityDecider {
  constructor(searchResult) {
    this.searchResult = searchResult;
  }
  arrayFront() {
    if (this.searchResult == null) {
      return this.searchResult;
    } else {
      return this.searchResult[0];
    }
  }
}

export default async function decideEntity(searchResults, settingObj) {
  //並び替え
  const matchTypeFilteringResult = matchTypeFiltering(
    searchResults,
    settingObj["selectMatchLabelType"]
  );
  console.log("matchTypeFilteringResult");
  console.log(matchTypeFilteringResult);
  return await Promise.all(
    matchTypeFilteringResult.map(async (result) => {
      const decider = new EntityDecider(result["candidate"]);
      result["linkedEntity"] = decider.arrayFront();
      return {
        word: result["surface_form"],
        linkedEntity: decider.arrayFront(),
      };
    })
  );
}
