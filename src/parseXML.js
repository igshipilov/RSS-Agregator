export default (response) => {
  const parser = new DOMParser();
  const content = response.data.contents;
  const parsed = parser.parseFromString(content, 'text/xml');
  const errorNode = parsed.querySelector('parsererror');

  if (errorNode) {
    throw new Error('parseError');
  } else {
    const { children } = parsed.querySelector('channel');
    return children;
  }
};

// console.log(parse('https://lorem-rss.hexlet.app/feed?unit=second'));
