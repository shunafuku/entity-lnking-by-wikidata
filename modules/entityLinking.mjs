import morphologicalAnalysis from "./morphologicalAnalysis.mjs";

export default function entityLinking(inputText, settingObj) {
  const outputText = morphologicalAnalysis(inputText);

  return outputText;
}
