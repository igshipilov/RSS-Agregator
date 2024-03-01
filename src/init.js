/* eslint-disable

no-param-reassign

*/

import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from './render.js';
import parseXML from './parseXML.js';




const run = (initialState, i18nInstance) => {
  const elements = {
    mainInterface: {
      title: document.querySelector('.display-3'),
      subtitle: document.querySelector('.lead'),
      formPlaceholder: document.querySelector('[for="url-input"]'),
      postsTitle: document.querySelector('.posts > div > div > h2'),
      feedsTitle: document.querySelector('.feeds > div > div > h2'),
    },
    buttons: {
      add: document.querySelector('[aria-label="add"]'),
    },
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    textHint: document.querySelector('.text-muted'),
    textFeedback: document.querySelector('.feedback'),
    content: {
      container: document.querySelector('.container-xxl'),
      posts: document.querySelector('.posts'),
      feeds: document.querySelector('.feeds'),
    },
    modal: {
      window: document.querySelector('#modal'),
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      fullArticle: document.querySelector('.full-article'),
    },
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  const addFeedsAndPosts = (content, url) => {
    const contentIterable = Array.from(content);
    const feedTitle = contentIterable.find((el) => el.tagName === 'title').textContent;
    const feedDescription = contentIterable.find((el) => el.tagName === 'description').textContent;
    const feedId = _.uniqueId();

    const feed = {
      title: feedTitle,
      description: feedDescription,
      id: feedId,
      url,
    };

    const items = contentIterable.filter((el) => el.tagName === 'item');

    const postsInit = [...items].map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      const id = _.uniqueId();
      return { title, link, description, id, feedId };
    });

    const posts = postsInit.reverse();

    initialState.content.feeds.push(feed);
    initialState.content.posts.push(...posts);

    state.loadingProcess.status = 'success'

    // return { feed, posts };
    // console.log(initialState.content);
  };


  const handleLoadingError = (err) => {
    initialState.loadingProcess.error = err.message;
    state.loadingProcess.status = 'parseError'; // рендер: читаем код ошибки из loadingProcess.error, рендерим текст из i18next
  };

  const addContent = (url) => {
    axios.get(url)
      .then(response => parseXML(response))
      .then(content => addFeedsAndPosts(content, url))
      .catch(error => handleLoadingError(error))
  };

  // v1
  // const runTimer = () => {
  //   setTimeout(function runUrlUpdate() {
  //     initialState.loadingProcess.status = 'starting';

  //     const currentFeeds = initialState.content.feeds;
  //     initialState.content.feeds = [];
  //     initialState.content.posts = [];
      
  //     // FIXME Надо ли обернуть content в Promise?
  //     // QUESTION: функция addFeedsAndPosts уже наполняет state.content,
  //     // поэтому эта перезапись лишняя:
  //     // const content = currentFeeds.forEach(({ url }) => addContent(url));
  //     // initialState.content = content;

  //     const wasFeedsAdded = !!currentFeeds.length;

  //     if (wasFeedsAdded) {
  //       currentFeeds.forEach(({ url }) => addContent(url));
  //       state.loadingProcess.status = 'success'; // рендер содержимого state.content
  //     }
      
  //     setTimeout(runUrlUpdate, 5000);
  //   }, 5000);
  // };


  // v3
  // FIXME
  // ожидаю: по тику таймера рендерятся все фиды из state
  // получаю: по тику возникает ошибка при обращении к initialState.content.feeds
  // гипотеза: дебаг через консоль браузера показал,
  // что не отрабатывает content.then(), т.к. в него приходит undefined
  // const runTimer = () => {
  //   setTimeout(function runUrlUpdate() {
  //     initialState.loadingProcess.status = 'starting';

  //     const currentFeeds = initialState.content.feeds;
  //     const wasFeedsAdded = !!currentFeeds.length;


  //     if (wasFeedsAdded) {
  //       initialState.content.feeds = [];
  //       initialState.content.posts = [];
  //       const content = new Promise(function(resolve, reject) {
  //         resolve(currentFeeds.forEach(({ url }) => addContent(url)));
  //       });
  //       console.log(content);
  //       content.then((result) => initialState.content = result);
  //     }
      
  //     setTimeout(runUrlUpdate, 1000);
  //   }, 1000);
  // };

  // runTimer();


  const runTimer = () => {
    setTimeout(function runUrlUpdate() {
      initialState.content.feeds.forEach(({ url }) => addContent(url));
      setTimeout(runUrlUpdate, 1000);
    }, 0);
  };

  runTimer();


  const proxifyUrl = (url) => {
    const proxifiedUrl = new URL('https://allorigins.hexlet.app/get?');
    proxifiedUrl.searchParams.set('disableCache', 'true');
    proxifiedUrl.searchParams.set('url', url);
    return proxifiedUrl;
  };
  
  setLocale({
    string: {
      url: 'feedback.invalidUrl',
    },
  });
  
  const schema = yup.string()
    .trim()
    .url()
    .test('not-one-of', 'feedback.alreadyExists', function isNotOneOf(currentUrl) {
      const { urls } = this.options;
      return !urls.includes(currentUrl);
    })
    .required();

  const handleFormError = (err) => {
    initialState.form.error = err.message;

    // рендер: читаем код ошибки из form.error, рендерим текст из i18next
    state.form.status = 'validationError';
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');
    const proxifiedUrl = proxifyUrl(submittedUrl);
    const urls = initialState.content.feeds.map(({ url }) => url);
    console.log(urls);

    initialState.loadingProcess.status = 'starting';
    state.form.status = 'sending'; // дизейблим форму


    // in schema.validate second arg { urls } is used for: yup.test('not-one-of')
    schema.validate(submittedUrl, { urls })
      // рендер зелёного 'RSS успешно загружен', разблок. форму
      .then(() => state.form.status = 'sent')
      .catch((err) => handleFormError(err));
      
    addContent(proxifiedUrl);
    // state.loadingProcess.status = 'success'; // рендер содержимого state.content
  });


  const modal = elements.modal.window;
  
  modal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const id = button.getAttribute('data-id');

    state.ui.activePostId = id;
  });

  const { posts } = elements.content;
  posts.addEventListener('click', (e) => {
    const el = e.target;

    if (el.tagName === 'A') {
      const { id } = el.dataset;
      state.ui.activePostId = id;
    }
  });
};

export default () => {
  const defaultLanguage = 'ru';

  const initialState = {
    lng: defaultLanguage,
    loadingProcess: {
      status: 'ready', // 'ready', 'starting', 'success', 'uploadError'
      error: null, // 'networkError', 'parseError'
    },
    form: {
      status: 'waiting', // 'waiting', 'sending', 'sent', 'validationError'
      error: null, // 'alreadyExists', 'invalidUrl'
    },
    content: {
      feeds: [], // [{ title, description, id, url }, ...]
      posts: [], // [{ title, link, description, id, feedId }, ...]
    },
    ui: {
      activePostId: null, // used by modal
    },
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: initialState.lng,
    debug: false,
    resources,
  }).then(run(initialState, i18nInstance));
};



















// ======== OLD =============


// const run = (initialState, i18nInstance) => {
//   const elements = {
//     mainInterface: {
//       title: document.querySelector('.display-3'),
//       subtitle: document.querySelector('.lead'),
//       formPlaceholder: document.querySelector('[for="url-input"]'),
//       postsTitle: document.querySelector('.posts > div > div > h2'),
//       feedsTitle: document.querySelector('.feeds > div > div > h2'),
//     },
//     buttons: {
//       add: document.querySelector('[aria-label="add"]'),
//     },
//     form: document.querySelector('.rss-form'),
//     input: document.querySelector('#url-input'),
//     textHint: document.querySelector('.text-muted'),
//     textFeedback: document.querySelector('.feedback'),
//     content: {
//       container: document.querySelector('.container-xxl'),
//       posts: document.querySelector('.posts'),
//       feeds: document.querySelector('.feeds'),
//     },
//     modal: {
//       window: document.querySelector('#modal'),
//       title: document.querySelector('.modal-title'),
//       body: document.querySelector('.modal-body'),
//       fullArticle: document.querySelector('.full-article'),
//     },
//   };

//   const state = onChange(initialState, render(elements, initialState, i18nInstance));

//   // TODO use this code for changeLanguge feature
//   // state.firstRender = true;

//   setLocale({
//     string: {
//       url: 'feedback.invalidUrl',
//     },
//   });

//   const schema = yup.string()
//     .trim()
//     .url()
//     .test('not-one-of', 'feedback.alreadyExists', function isNotOneOf(value) {
//       const { urls } = this.options;
//       return !urls.includes(value);
//     })
//     .required();

//   const saveUrl = (url) => {
//     const wasUrlAdded = initialState.content.urls.includes(url);
//     if (!wasUrlAdded) {
//       initialState.content.urls.push(url);
//     }
//     state.initiated = true; // triggers initial render (titles "Feeds" and "Posts", also <ul>)
//   };

//   const addIDs = (coll) => {
//     const resultColl = coll;

//     const setId = (currentTitle, type) => {
//       const wasFeedAdded = initialState.content[type].find(
//         ({ title }) => title === currentTitle,
//       );
//       return wasFeedAdded ? wasFeedAdded.id : _.uniqueId();
//     };

//     resultColl.feed.id = setId(coll.feed.title, 'feeds');
//     resultColl.posts.forEach((post) => {
//       const id = setId(post.title, 'posts');
//       const feedId = resultColl.feed.id;
//       post.id = id;
//       post.feedId = feedId;
//     });

//     return (resultColl);
//   };

//   const addFeedsAndPostsToState = (collFeedsAndPosts, isSubmitted) => {
//     const { posts, feed } = collFeedsAndPosts;

//     const currentPosts = initialState.content.posts;
//     const newPosts = _.differenceWith(posts, currentPosts, _.isEqual);
//     const hasNewPosts = !_.isEmpty(newPosts);

//     if (isSubmitted) {
//       state.content.feeds.push(feed);
//     }
//     if (hasNewPosts) {
//       initialState.content.posts.push(...newPosts);
//       state.content.newPosts.push(...newPosts);
//       initialState.content.newPosts = [];
//     }
//   };

//   const handleError = (err) => {
//     initialState.isFormValid = false;
//     state.form.feedback = i18nInstance.t(err.message);
//     state.buttons.addDisabled = false;
//   };

//   const proxifyUrl = (url) => {
//     const proxifiedUrl = new URL('https://allorigins.hexlet.app/get?');
//     proxifiedUrl.searchParams.set('disableCache', 'true');
//     proxifiedUrl.searchParams.set('url', url);

//     return proxifiedUrl;
//   };

//   const handleUrl = (url, e) => new Promise((resolve, reject) => {
//     const isSubmitted = () => {
//       try { return !!e; } catch (err) { return false; }
//     };

//     // blocks "Add" button on 'submit' event only (not block it on autoupdates)
//     if (isSubmitted()) {
//       state.buttons.addDisabled = true;
//     }

//     saveUrl(url);
//     const proxifiedUrl = proxifyUrl(url);

//     axios.get(proxifiedUrl)
//       .then((content) => parseXML(content))
//       .then((coll) => addIDs(coll))
//       .then((collWithIDs) => addFeedsAndPostsToState(collWithIDs, isSubmitted()))
//       .then(() => resolve())
//       .catch((err) => {
//         if (err.code === 'ERR_NETWORK') {
//           reject(new Error('feedback.networkError'));
//         } else {
//           handleError(err);
//           reject(err);
//         }
//       });
//   });

//   elements.form.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const formData = new FormData(e.target);
//     const submittedUrl = formData.get('url');

//     const runTimer = () => {
//       setTimeout(function runUrlUpdate() {
//         initialState.content.urls.forEach((url) => handleUrl(url));
//         setTimeout(runUrlUpdate, 5000);
//       }, 0);
//     };

//     // in schema.validate second arg { urls: ... } is used for: yup.test('not-one-of')
//     schema.validate(submittedUrl, { urls: initialState.content.urls })
//       .then(() => handleUrl(submittedUrl, e))
//       .then(() => {
//         state.buttons.addDisabled = false;
//         runTimer();
//       })
//       .then(() => {
//         initialState.isFormValid = true;
//         state.form.feedback = null;
//         state.form.feedback = i18nInstance.t('feedback.success');
//       })
//       .catch((err) => {
//         handleError(err);
//       });
//   });

//   const modal = elements.modal.window;
//   modal.addEventListener('show.bs.modal', (e) => {
//     const button = e.relatedTarget;
//     const id = button.getAttribute('data-id');

//     state.ui.activePostId = id;
//   });

//   const { posts } = elements.content;
//   posts.addEventListener('click', (e) => {
//     const el = e.target;

//     if (el.tagName === 'A') {
//       const { id } = el.dataset;
//       state.ui.activePostId = id;
//     }
//   });
// };

// export default () => {
//   const defaultLanguage = 'ru';

//   const initialState = {
//     lng: defaultLanguage,
//     isFormValid: null,
//     firstRender: null,
//     initiated: false,
//     content: {
//       urls: [], // ['https://lorem-rss.hexlet.app/feed', ...]
//       feeds: [], // [{ title, description, id }]
//       posts: [], // [{ title, link, description, id, feedId }, {...}, ...]
//       newPosts: [],
//     },
//     form: {
//       feedback: null,
//     },
//     buttons: {
//       addDisabled: false,
//     },
//     ui: {
//       activePostId: null, // used by modal
//     },
//   };

//   const i18nInstance = i18next.createInstance();

//   i18nInstance.init({
//     lng: initialState.lng,
//     debug: false,
//     resources,
//   }).then(run(initialState, i18nInstance));
// };

