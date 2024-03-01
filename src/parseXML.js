export default (response) => {
  const parser = new DOMParser();
  const content = response.data.contents;
  const parsed = parser.parseFromString(content, 'text/xml');
  const errorNode = parsed.querySelector('parsererror');

  if (errorNode) {
    throw new Error('feedback.parseError');
  } else {
    const children = parsed.querySelector('channel').children;
    // console.log(
    //   parsed
    //     .querySelector('channel')
    //     .children
    //   );
    return children;
    // const feedTitle = parsed.documentElement.getElementsByTagName('title')[0].textContent;
    // const feedDescription = parsed.documentElement.getElementsByTagName('description')[0].textContent;

    // const feed = {
    //   title: feedTitle,
    //   description: feedDescription,
    // };

    // const items = parsed.documentElement.getElementsByTagName('item');

    // const postsInit = [...items].map((item) => {
    //   const title = item.querySelector('title').textContent;
    //   const link = item.querySelector('link').textContent;
    //   const description = item.querySelector('description').textContent;

    //   return { title, link, description };
    // });
    // const posts = postsInit.reverse();

    // return { feed, posts };
  }
};

// console.log(parse('https://lorem-rss.hexlet.app/feed?unit=second'));