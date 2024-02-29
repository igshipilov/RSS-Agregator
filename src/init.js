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
  isFormValid: null,
  firstRender: null,
  initiated: false,
  content: {
    urls: [], // ['https://lorem-rss.hexlet.app/feed', ...]
    feeds: [], // [{ title, description, id }]
    posts: [], // [{ title, link, description, id, feedId }, {...}, ...]
    newPosts: [],
  },
  form: {
    feedback: null,
  },
  buttons: {
    addDisabled: false,
  },
  ui: {
    activePostId: null,
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
//       activePostId: null,
//     },
//   };

//   const i18nInstance = i18next.createInstance();

//   i18nInstance.init({
//     lng: initialState.lng,
//     debug: false,
//     resources,
//   }).then(run(initialState, i18nInstance));
// };

