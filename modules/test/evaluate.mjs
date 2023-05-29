import fetchWikipedhiaUrlFromWikidataUrl from './convertUrl.mjs';
export default async function evaluate(answerArray, entityLinkingResultArray) {
  return await Promise.all(
    answerArray.map(async (x) => {
      //-----------------開始位置と終了位置が同じものが存在するか確認（存在しない場合、不正解）
      //1文字目が答えと同じ位置の単語のindexを取得する
      const sameStartPositionOfEntityLinking = ((entityLinkingResultArray) => {
        for (const [index, y] of Object.entries(entityLinkingResultArray)) {
          if (x['startPosition'] == y['startPosition']) {
            return index;
          } else if (x['startPosition'] < y['startPosition']) {
            return -1;
          }
        }
        return -1;
      })(entityLinkingResultArray);
      console.log(sameStartPositionOfEntityLinking);
      //１文字目が同じ位置のものがなかった場合、不正解
      if (sameStartPositionOfEntityLinking == -1) {
        return ['incorrect', [x, null]];
      } else if (
        entityLinkingResultArray[sameStartPositionOfEntityLinking][
          'endPosition'
        ] != x['endPosition']
      ) {
        //最後の文字が同じ位置でなかった場合、不正解
        return ['incorrect', [x, null]];
      }
      //-----------------URLが同じか確認（同じ場合：正解）（違う場合：人手による検討が必要）
      const wikipediaUrl = await fetchWikipedhiaUrlFromWikidataUrl(
        entityLinkingResultArray[sameStartPositionOfEntityLinking]['link']
      );
      console.log(wikipediaUrl);
      //aタグに付与されているurlが相対パスになっているので、絶対パスに変換する
      x['link'] = 'https://www.wikipedia.org' + x['link']
    //   if (wikipediaUrl != null) {
    //     const regex = RegExp('(/wiki/.*)');
    //     const afterWiki = regex.exec(wikipediaUrl)[1];
    //     entityLinkingResultArray[sameStartPositionOfEntityLinking]['link'] =
    //     afterWiki;
    //   }

      if (
        x['link'] ==
        entityLinkingResultArray[sameStartPositionOfEntityLinking]['link']
      ) {
        return [
          'correct',
          [x, entityLinkingResultArray[sameStartPositionOfEntityLinking]],
        ];
      } else {
        return [
          'needConsideration',
          [x, entityLinkingResultArray[sameStartPositionOfEntityLinking]],
        ];
      }
    })
  );
}
