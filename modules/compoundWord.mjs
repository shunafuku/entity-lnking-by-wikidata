import searchEntityCandidate from './searchEntity.mjs';

function weldCompoundWordCandidate(morphologicalAnalysisResult) {
  let kouhoArray = new Array();
  let isExNoun = false;
  let currentNum = -1;
  morphologicalAnalysisResult.forEach((x) => {
    if (x['pos'] == '名詞') {
      if (isExNoun) {
        kouhoArray[currentNum].push(x);
      } else {
        ++currentNum;
        kouhoArray[currentNum] = [x];
      }
      isExNoun = true;
    } else {
      isExNoun = false;
      ++currentNum;
      kouhoArray[currentNum] = [x];
    }
  });
  return kouhoArray;
}

async function exists(word) {
  const hoge = await searchEntityCandidate(word, {
    apiLimit: 1,
    searchType: 'exactMatchSearch',
  });
  return hoge.length;
}

async function decideCompoundWord(inputTextArray) {
  inputTextArray.forEach((x) => {
    x['flag'] = false;
  });
  let array = [];

  for (
    let compoundWordNum = inputTextArray.length;
    0 < compoundWordNum;
    compoundWordNum--
  ) {
    const patternCount = inputTextArray.length - compoundWordNum + 1;
    for (let i = 0; i < patternCount; i++) {
      const flagsArray = inputTextArray
        .slice(i, i + compoundWordNum)
        .map((x) => x['flag']);
      if (flagsArray.length == 1) {
        if (!flagsArray[0]) {
          const compoundWord = inputTextArray
            .slice(i, i + compoundWordNum)
            .map((x) => x['surface_form'])
            .join('');
          array.push({
            pos: '名詞',
            pos_detail_1: '*',
            pos_detail_2: '*',
            pos_detail_3: '*',
            surface_form: compoundWord,
            word_position: i + inputTextArray[0]['word_position'],
          });
        }
      } else if (flagsArray.every((flag) => !flag)) {
        //flagが全部falseなら実行
        const compoundWord = inputTextArray
          .slice(i, i + compoundWordNum)
          .map((x) => x['surface_form'])
          .join('');
        await exists(compoundWord).then((result) => {
          if (result) {
            array.push({
              pos: '名詞',
              pos_detail_1: '*',
              pos_detail_2: '*',
              pos_detail_3: '*',
              surface_form: compoundWord,
              word_position: i + inputTextArray[0]['word_position'],
            });
            for (let j = i; j < i + compoundWordNum; j++) {
              inputTextArray[j]['flag'] = true;
            }
          }
        });
      }
    }
  }
  const hogehoge = array.sort((a, b) => {
    return a['word_position'] - b['word_position'];
  });
  return hogehoge;
}

export default async function searchCompoundWord(inputTextArray) {
  const compoundWordCandidate = weldCompoundWordCandidate(inputTextArray);
  console.log('複合語候補')
  console.log(compoundWordCandidate)
  let resultArray = [];
  // for (const x of compoundWordCandidate) {
  //   if (x.length == 1) {
  //     resultArray.push(x[0]);
  //   } else {
  //     resultArray = resultArray.concat(await decideCompoundWord(x));
  //   }
  // }

  const sleep = (ms) => new Promise((reserve) => setTimeout(reserve, ms));
  const splitTo2DArray = (array, num) => {
    const length = Math.ceil(array.length / num);
    return new Array(length)
      .fill()
      .map((_, i) => array.slice(i * num, (i + 1) * num));
  };
  const hoge = splitTo2DArray(compoundWordCandidate, 100);
  let hogeResult = [];
  for (const hogehoge1 of hoge) {
    hogeResult.push(
      await Promise.all(
        hogehoge1.map(async (x) => {
          if (x.length == 1) {
            return x;
          } else {
            return await decideCompoundWord(x);
          }
        })
      )
    );
    await sleep(50);
  }
  resultArray = hogeResult
    .reduce((accumulator, currentArray) => {
      accumulator.push(...currentArray);
      return accumulator;
    }, [])
    .reduce((accumulator, currentArray) => {
      accumulator.push(...currentArray);
      return accumulator;
    }, []);

  return resultArray;
}
