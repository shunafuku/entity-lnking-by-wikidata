import morphologicalAnalysis from './modules/morphologicalAnalysis'

export default function entityLinking(inputText, settingObj){

    const outputText = morphologicalAnalysis(inputText);

    return outputText;
}