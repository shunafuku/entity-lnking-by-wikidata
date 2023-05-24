function removeDuplicates(linkedArray) {
  let appearedcombinationList = [];
  linkedArray.map((x) => {
    if (x['linkedEntity'] != null) {
      if (appearedcombinationList.indexOf(x['linkedEntity']['id']) == -1) {
        appearedcombinationList.push(x['linkedEntity']['id']);
      } else {
        x['linkedEntity'] = null;
      }
    }
    return x;
  });
  return linkedArray;
}

function getCategoryClass(categoryArray, selectCategories) {
  const category = {
    'category-0': {
      value: '活動',
      color: '255, 143, 143',
      wikidataId: 'Q1914636',
    },
    'category-1': {
      value: '解剖学的構造',
      color: '220, 220, 220',
      wikidataId: 'Q112826905',
    },
    'category-2': {
      value: '疾患',
      color: '117, 214, 161',
      wikidataId: 'Q12136',
    },
    'category-3': {
      value: '薬',
      color: '255, 255, 0',
      wikidataId: 'Q8386',
    },
    'category-4': {
      value: '組織',
      color: '204, 179, 255',
      wikidataId: 'Q43229',
    },
    'category-5': {
      value: '人物',
      color: '255, 165, 0',
      wikidataId: 'Q5',
    },
    'category-6': {
      value: '場所',
      color: '255, 218, 185',
      wikidataId: 'Q17334923',
    },
    'category-7': {
      value: '化学物質',
      color: '0, 255, 255',
      wikidataId: 'Q79529',
    },
    'category-8': {
      value: '生物',
      color: '0, 255, 0',
      wikidataId: 'Q7239',
    },
    'category-9': {
      value: '仕事',
      color: '255, 192, 203',
      wikidataId: 'Q386724 ',
    },
  };
  if (categoryArray != null) {
    for (const checkedCategory of selectCategories) {
      if (
        categoryArray.indexOf(category[checkedCategory]['wikidataId']) != -1
      ) {
        return checkedCategory;
      }
    }
  }
  return '';
}

function createStringOfAnchorElement(href, className = '', value, displayPage, typesOfOpeningTabs) {
  if(displayPage == 'kgs'){//別のウィンドウで開く
    return (
      '<a ' +
      'class="' +
      className +
      '" ' +
      'href="javascript:ShowDetails(' +
      "'" +
      href +
      "'" +
      ')"' +
      '>' +
      value +
      '</a>'
    );
  }else if(displayPage == 'wikidata'){
    return (
      '<a ' +
      'class="' +
      className +
      '" ' +
      'href="' +
      href +
      '" ' + 
      'target="_blank" rel="noopener noreferrer" ' +
      '>' +
      value +
      '</a>'
    );
  }else{
    return (
      '<a ' +
      'class="' +
      className +
      '" ' +
      'href="' +
      href +
      '"' +
      '>' +
      value +
      '</a>'
    );
  }
  
}
function wikidataId2TargetsiteUrl(targetSite, wikidataId) {
  if (targetSite == 'kgs') {
    return 'https://kgs.hozo.jp/sample/details.html?key=wd:' + wikidataId;
  } else if (targetSite == 'wikidata') {
    return 'https://www.wikidata.org/wiki/' + wikidataId;
  } else {
    return '';
  }
}

export default function createLinkedText(
  textArray,
  selectCategories,
  displayPage,
  settingObj
) {
  textArray = removeDuplicates(textArray);
  if (selectCategories.length == 0) {
    //カテゴリーが選択されていない
    return textArray
      .map((x) => {
        if (x['linkedEntity'] == null) {
          return x['word'];
        } else {
          const wikidataId = x['linkedEntity']['id'];
          const url = wikidataId2TargetsiteUrl(displayPage, wikidataId);
          const categoryClass = '';
          return (
            createStringOfAnchorElement(url, categoryClass, x['word'], displayPage)// + ' '
          );
        }
      })
      .join('');
  } else {
    //カテゴリーが１つ以上選択されている
    return textArray
      .map((x) => {
        if (x['linkedEntity'] == null) {
          return x['word'];
        } else {
          const wikidataId = x['linkedEntity']['id'];
          const url = wikidataId2TargetsiteUrl(displayPage, wikidataId);
          const categoryArray = x['category'];
          const categoryClass = getCategoryClass(
            categoryArray,
            selectCategories
          );
          return (
            createStringOfAnchorElement(url, categoryClass, x['word'], displayPage)// + ' '
          );
        }
      })
      .join('');
  }
}
