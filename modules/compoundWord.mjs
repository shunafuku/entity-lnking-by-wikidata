//複合語
const inputTextArray = [{ word: "先進", flag: false }, { word: "国", flag: false }, { word: "首脳", flag: false }, { word: "会議", flag: false }];
const answerTextArray = ["国首脳", "先進", "国", "首脳", "会議"]
function exists(word) {
    return answerTextArray.includes(word);
}

for (let compoundWordNum = inputTextArray.length; 0 < compoundWordNum; compoundWordNum--) {
    const isAllfalse = () => {
        return 0;
    }
    const patternCount = inputTextArray.length - compoundWordNum + 1;
    console.log("neko-------------------")
    for (let i = 0; i < patternCount; i++) {
        const flagsArray = inputTextArray.slice(i, i + compoundWordNum).map(x => x["flag"]);
        //flagが全部falseなら実行
        if (flagsArray.every(flag => !flag)) {
            const compoundWord = inputTextArray.slice(i, i + compoundWordNum).map(x => x["word"]).join("");
            console.log(flagsArray);
            console.log(compoundWord);
            if (exists(compoundWord)) {
                for (let j = i; j < i + compoundWordNum; j++) {
                    inputTextArray[j]["flag"] = true;
                }
            }
        }
    }
}