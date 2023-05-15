export default class EntityDecider{
    constructor(searchResult) {
        this.searchResult = searchResult;
    }
    arrayFront(){
        if(this.searchResult == null){
            return this.searchResult;
        }else{
            return this.searchResult[0];
        }
        
    }
}