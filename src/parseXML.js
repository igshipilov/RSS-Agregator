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

    // return { ...getChannel(contentIterable), getItems(contentIterable) }

    const channelTitle = contentIterable.find((el) => el.tagName === 'title').textContent;
    const channelDescription = contentIterable.find((el) => el.tagName === 'description').textContent;
    const itemsXML = contentIterable.filter((el) => el.tagName === 'item');

    const items = [...itemsXML].map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;

      return { title, link, description };
    });

    return { channelTitle, channelDescription, items };
  }
};
