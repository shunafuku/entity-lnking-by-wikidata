export default function evaluate(answerArray, entityLinkingResultArray){
    return answerArray.map((x) => {
        //-----------------開始位置と終了位置が同じものが存在するか確認（存在しない場合、不正解）
        //1文字目が答えと同じ位置の単語のindexを取得する
        const sameStartPositionOfEntityLinkingR = (
            (entityLinkingResultArray)=>{
                for(const [index, y] of Object.entries(entityLinkingResultArray)){
                    if(x['startPosition'] == y['startPosition']){
                        return index;
                    }else if(x['startPosition'] < y['startPosition']){
                        return -1;
                    }
                }
                return -1;
            }
        )(entityLinkingResultArray);
        console.log(sameStartPositionOfEntityLinkingR)
        //１文字目が同じ位置のものがなかった場合、不正解
        if(sameStartPositionOfEntityLinkingR == -1){
            return ['incorrect', x];
        }else if(entityLinkingResultArray[sameStartPositionOfEntityLinkingR]['endPosition'] != x['endPosition'] ){//最後の文字が同じ位置でなかった場合、不正解
            return ['incorrect', x];
        }
        //-----------------URLが同じか確認（同じ場合：正解）（違う場合：人手による検討が必要）
        if(x['link'] == entityLinkingResultArray[sameStartPositionOfEntityLinkingR]['link']){
            return ['correct', x];
        }else{
            return ['needConsideration', x];
        }   
    });
}

