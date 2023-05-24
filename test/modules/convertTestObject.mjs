function convert2TestObject(inputText) {
    let outputText = '';
    let ELResultArray = [];
    const regexATag = RegExp('(<a.*?>.*?</a>)');
    const splits = inputText.split(regexATag);
    splits.forEach((x) => {
      if (regexATag.test(x)) {
        //aタグの値を取得
        const regexATagValue = RegExp('<a.*?>(.*?)</a>');
        const aTagValue = regexATagValue.exec(x)[1];
        //aタグのurlを取得
        const regexATagHref = RegExp('<a.*?href=[\'"](.*?)[\'"].*?>.*?</a>');
        const aTagHref = regexATagHref.exec(x)[1];
        //aタグの値の開始位置と終了位置を取得
        const startPosition = outputText.length;
        const endPosition = startPosition + aTagValue.length - 1;
        //ELの結果を設定
        const ELResult = {
          startPosition: startPosition,
          endPosition: endPosition,
          link: aTagHref,
          label: aTagValue,
        };
        //出力テキストに、aタグの値を追加
        outputText += aTagValue;
        //ELの結果の配列に追加
        ELResultArray.push(ELResult);
      } else {
        //出力テキストに、aタグの値を追加
        outputText += x;
      }
    });
    return {
      'outputText': outputText,
      'ELResultArray': ELResultArray,
    };
  }