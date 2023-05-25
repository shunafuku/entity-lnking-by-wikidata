export default function removeHtmlTag(htmlText) {
  const regexHtmlTag = RegExp('<.*?>(.*?)</.*?>', 'g');
  return htmlText.replaceAll(regexHtmlTag, '$1');
}
