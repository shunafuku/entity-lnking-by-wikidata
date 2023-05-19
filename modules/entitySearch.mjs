/*
完全一致検索 - mediawiki_API(https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities)
前方一致検索 - mediawiki_API(https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities)
あいまい検索 - mediawiki_API(https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bsearch)
*/

class EntityCandidateSearcher {
    constructor(searchWord, apiLimit) {
        this.searchWord = searchWord;
        this.apiLimit = apiLimit;
    }
    //完全一致検索
    exactMatchSearch() {
        return new Promise((resolve) => {
            const url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" + this.searchWord + "&limit=" + this.apiLimit + "&language=ja&format=json&origin=*";
            fetch(url)
                .then((response) => response.json())
                .then((searchResult) => {
                    return resolve(searchResult['search'].filter(x => x['match']['text'] == this.searchWord).map(x => {
                        return {
                            wikidataUrl: x['url'],
                            id: x['id'],
                            matchType: x['match']['type']
                       }
                    }))
                })
                .catch((error) => { console.log(error); });
        })
    }

    //前方一致検索
    prefixSearch() {
        return new Promise((resolve) => {
            const url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" + this.searchWord + "&limit=" + this.apiLimit + "&language=ja&format=json&origin=*";
            fetch(url)
                .then((response) => response.json())
                .then((searchResult) => {
                    return resolve(searchResult['search'].map(x => {
                        return {
                            wikidataUrl: x['url'],
                            id: x['id'],
                            matchType: x['match']['type']
                        }
                    }))
                })
                .catch((error) => { console.log(error); });
        })
    }

    //あいまい検索
    approximateSearch() {
        return new Promise((resolve) => {
            const urlw = "https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=" + this.searchWord + "&srlimit=" + this.apiLimit + "&sroffset=0&format=json&origin=*";
            fetch(urlw)
                .then((response) => response.json())
                .then((searchResult) => {
                    console.log('searchResult');
                    console.log(searchResult);
                    return resolve(searchResult['query']['search'].map(x => {
                        return {
                            wikidataUrl: 'http://www.wikidata.org/wiki/' + x['title'],
                            id: x['title'],
                            matchType: null
                        }
                    }))
                })
                .catch(function (error) { console.log(error); });
        })
    }

}

export default async function entityCandidateSearch(word, settingObj) {
    const searcher = new EntityCandidateSearcher(word, settingObj.apiLimit);
    let result;
    if (settingObj.searchType == 'exactMatchSearch') {
        result = await searcher.exactMatchSearch();
    } else if (settingObj.searchType == 'prefixSearch') {
        result = await searcher.prefixSearch();
    } else if (settingObj.searchType == 'approximateSearch') {
        result = await searcher.approximateSearch();
    }
    return result;
}