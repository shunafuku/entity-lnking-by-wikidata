import morphologicalAnalysis from "./morphologicalAnalysis.mjs";

export default async function entityLinking(inputText, settingObj) {
  //形態素解析
  const morphologicalAnalysisResultArray = await morphologicalAnalysis(inputText);
  console.log(morphologicalAnalysisResultArray)
  
  //リンキングテキスト
  const entityLinkedText = ''

  return entityLinkedText;
}
