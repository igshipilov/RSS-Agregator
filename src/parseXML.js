export default (response) => {
  const parser = new DOMParser();
  const content = response.data.contents;
  const parsed = parser.parseFromString(content, 'text/xml');
  const errorNode = parsed.querySelector('parsererror');

  if (errorNode) {
    throw new Error('parseError');
  } else {
    const { children } = parsed.querySelector('channel');
    const contentIterable = Array.from(children);

    const title = contentIterable.find((el) => el.tagName === 'title').textContent;
    const description = contentIterable.find((el) => el.tagName === 'description').textContent;
    const items = contentIterable.filter((el) => el.tagName === 'item');

    return { title, description, items };
  }
};
