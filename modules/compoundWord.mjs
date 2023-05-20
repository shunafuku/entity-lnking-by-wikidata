import entityCandidateSearch from "./entitySearch.mjs";

// //wikidataに一致するラベルが存在するか確認する
// async function exists(word) {
//     const candidate = await entityCandidateSearch(word, {apiLimit: 1, searchType:'exactMatchSearch'});
//     if(candidate.length == 0){
//         return false;
//     }else{
//         return true;
//     }
// }

//複合語
const inputTextArray = [
    {
        pos:"名詞",
        pos_detail_1:"一般",
        pos_detail_2:"*",
        pos_detail_3:"*",
        surface_form: "先進",
        word_position: 1,
        flag: false 
    }, 
    {
        pos:"名詞",
        pos_detail_1:"一般",
        pos_detail_2:"*",
        pos_detail_3:"*",
        surface_form: "国",
        word_position: 3,
        flag: false
    }, 
    {
        pos:"名詞",
        pos_detail_1:"一般",
        pos_detail_2:"*",
        pos_detail_3:"*",
        surface_form: "首脳",
        word_position: 4,
        flag: false ,
    }, 
    {
        pos:"名詞",
        pos_detail_1:"一般",
        pos_detail_2:"*",
        pos_detail_3:"*",
        surface_form: "会議",
        word_position: 6,
        flag: false ,
        
    }
];
const answerTextArray = ["国首脳", "先進", "国", "首脳", "会議"]
function exists(word) {
    return answerTextArray.includes(word);
}

let array = [];

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
            const compoundWord = inputTextArray.slice(i, i + compoundWordNum).map(x => x["surface_form"]).join("");
            console.log(flagsArray);
            console.log(compoundWord);
            if (exists(compoundWord)) {
                array.push({
                    pos:"名詞",
                    pos_detail_1:"*",
                    pos_detail_2:"*",
                    pos_detail_3:"*",
                    surface_form:compoundWord,
                    word_position: i + inputTextArray[0]['word_position']
                });
                for (let j = i; j < i + compoundWordNum; j++) {
                    inputTextArray[j]["flag"] = true;
                }
            }
        }
    }
}
console.log("dog-------------------")
console.log(array)