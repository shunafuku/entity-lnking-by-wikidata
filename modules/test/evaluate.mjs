import fetchWikipedhiaUrlFromWikidataUrl from './convertUrl.mjs';
export default async function evaluate(answerArray, entityLinkingResultArray) {
  for (const entityLinkingResult of entityLinkingResultArray) {
    const wikipediaUrl = await fetchWikipedhiaUrlFromWikidataUrl(
      entityLinkingResult['link']
    );
    if (wikipediaUrl != null) {
      entityLinkingResult['link'] = wikipediaUrl;
    }
  }
  answerArray.forEach((x) => {
    //aタグに付与されているurlが相対パスになっているので、絶対パスに変換する
    x['link'] = 'https://ja.wikipedia.org' + x['link'];
  });
  const TPAndFNArray = await Promise.all(
    answerArray.map(async (answer) => {
      //-----------------開始位置と終了位置が同じものが存在するか確認（存在しない場合、不正解）
      //1文字目が答えと同じ位置の単語のindexを取得する
      const sameStartPositionOfEntityLinking = ((entityLinkingResultArray) => {
        for (const [index, entityLinkingResult] of Object.entries(
          entityLinkingResultArray
        )) {
          if (answer['startPosition'] == entityLinkingResult['startPosition']) {
            return index;
          } else if (
            answer['startPosition'] < entityLinkingResult['startPosition']
          ) {
            return -1;
          }
        }
        return -1;
      })(entityLinkingResultArray);
      //１文字目が同じ位置のものがなかった場合、不正解
      if (sameStartPositionOfEntityLinking == -1) {
        return {
          confusionMatrix: 'FN',
          answer: answer,
          ELResult: null,
        };
      } else if (
        entityLinkingResultArray[sameStartPositionOfEntityLinking][
          'endPosition'
        ] != answer['endPosition']
      ) {
        //最後の文字が同じ位置でなかった場合、不正解
        return {
          confusionMatrix: 'FN',
          answer: answer,
          ELResult: null,
        };
      }
      //-----------------URLが同じか確認（同じ場合：正解）（違う場合：人手による検討が必要）
      if (
        answer['link'] ==
        entityLinkingResultArray[sameStartPositionOfEntityLinking]['link']
      ) {
        return {
          confusionMatrix: 'TP',
          answer: answer,
          ELResult: entityLinkingResultArray[sameStartPositionOfEntityLinking],
        };
      } else {
        return {
          confusionMatrix: 'needConsideration',
          answer: answer,
          ELResult: entityLinkingResultArray[sameStartPositionOfEntityLinking],
        };
      }
    })
  );
  //EL結果には存在するが正解データにはないものを探す
  const TPAndFPArray = await Promise.all(
    entityLinkingResultArray.map(async (entityLinkingResult) => {
      //-----------------開始位置と終了位置が同じものが存在するか確認（存在しない場合、不正解）
      //1文字目が答えと同じ位置の単語のindexを取得する
      const sameStartPositionOfEntityLinking = ((answerArray) => {
        for (const [index, y] of Object.entries(answerArray)) {
          if (entityLinkingResult['startPosition'] == y['startPosition']) {
            return index;
          } else if (
            entityLinkingResult['startPosition'] < y['startPosition']
          ) {
            return -1;
          }
        }
        return -1;
      })(answerArray);
      //１文字目が同じ位置のものがなかった場合、不正解
      if (sameStartPositionOfEntityLinking == -1) {
        return {
          confusionMatrix: 'FP',
          answer: null,
          ELResult: entityLinkingResult,
        };
      } else if (
        answerArray[sameStartPositionOfEntityLinking]['endPosition'] !=
        entityLinkingResult['endPosition']
      ) {
        //最後の文字が同じ位置でなかった場合、不正解
        return {
          confusionMatrix: 'FP',
          answer: null,
          ELResult: entityLinkingResult,
        };
      }
      //-----------------URLが同じか確認（同じ場合：正解）（違う場合：人手による検討が必要）
      if (
        entityLinkingResult['link'] ==
        answerArray[sameStartPositionOfEntityLinking]['link']
      ) {
        return {
          confusionMatrix: 'TP',
          answer: answerArray[sameStartPositionOfEntityLinking],
          ELResult: entityLinkingResult,
        };
      } else {
        return {
          confusionMatrix: 'needConsideration',
          answer: answerArray[sameStartPositionOfEntityLinking],
          ELResult: entityLinkingResult,
        };
      }
    })
  );
  const FPArray = TPAndFPArray.filter((x) => x[0] == 'FP');

  return TPAndFNArray.concat(FPArray);
}
