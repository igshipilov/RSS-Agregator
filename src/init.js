/* eslint-disable

no-param-reassign,
no-console,
consistent-return,

*/

import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from '../bin/render.js';

/*

ФИДЫ ДЛЯ ТЕСТОВ
✅ Рабочие:
https://lorem-rss.hexlet.app/feed?unit=second
https://buzzfeed.com/world.xml
https://ru.hexlet.io/lessons.rss
https://lorem-rss.herokuapp.com/feed?unit=second

❌ Нерабочие:
lorem-rss.hexlet.app/feed
buzzfeed.com/world.xml

*/

const run = (initialState, i18nInstance) => {
  const elements = {
    titles: {
      title: document.querySelector('.display-3'),
      subtitle: document.querySelector('.lead'),
    },
    formPlaceholder: document.querySelector('[for="url-input"]'),
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

  setLocale({
    string: {
      url: 'feedback.invalidUrl',
      // url: { message: 'feedback.invalidUrl' },
    },
  });

  const regMatch = /(https:\/\/)(.*)(?=\/)\/(feed|.*\.rss|.*\.xml)/gm;

  const schema = yup.string()
    .trim()
    .url()
    // .test('valid-url', { key: 'feedback.invalidUrl' }, function isValidUrl(value) {
    // })
    .matches(regMatch, { message: 'feedback.parseError', excludeEmptyString: true }) // excludeEmptyString option make empty strings invalid
    .test('not-one-of', 'feedback.alreadyExists', function isNotOneOf(value) {
      const { urls } = this.options;
      return !urls.includes(value);
    })
    .required();

  const addFeedsAndPostsToState = (collFeedsAndPosts, isSubmitted) => {
    const { posts, feed } = collFeedsAndPosts;

    const currentPosts = initialState.content.lists.posts;
    const newPosts = _.differenceWith(posts, currentPosts, _.isEqual);
    const hasNewPosts = !_.isEmpty(newPosts);

    if (isSubmitted) {
      state.content.lists.feeds.push(feed);
    }
    if (hasNewPosts) {
      initialState.content.lists.posts.push(...newPosts);
      state.content.lists.newPosts.push(...newPosts);
      initialState.content.lists.newPosts = [];
    }
  };

  const parseXML = (xml) => {
    const parser = new DOMParser();

    const parsed = parser.parseFromString(xml, 'text/xml');
    const feedTitle = parsed.documentElement.getElementsByTagName('title')[0].textContent;
    const feedDescription = parsed.documentElement.getElementsByTagName('description')[0].textContent;

    const feed = {
      title: feedTitle,
      description: feedDescription,
    };

    const items = parsed.documentElement.getElementsByTagName('item');

    const postsInit = [...items].map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;

      return { title, link, description };
    });
    const posts = postsInit.reverse();

    return { feed, posts };
  };

  const addIDs = (coll) => {
    // const { title: feedTitle, description: feedDescription } = coll.feed;
    const resultColl = coll;

    const setId = (currentTitle, type) => {
      const wasFeedAdded = initialState.content.lists[type].find(
        ({ title }) => title === currentTitle,
      );
      return wasFeedAdded ? wasFeedAdded.id : _.uniqueId();
    };

    resultColl.feed.id = setId(coll.feed.title, 'feeds');
    resultColl.posts.forEach((post) => {
      const id = setId(post.title, 'posts');
      const feedId = resultColl.feed.id;
      post.id = id;
      post.feedId = feedId;
    });

    return (resultColl);
  };

  const getXML = (response, url) => {
    const wasUrlAdded = initialState.content.lists.urls.includes(url);
    if (!wasUrlAdded) {
      initialState.content.lists.urls.push(url);
    }
    state.initiated = true; // триггерим первичный рендер (заголовки "Фиды" и "Посты", <ul>)

    return response.data.contents; // xml → typeof: string
  };

  // const runTimer = () => {
  //   if (initialState.subscribed === true && initialState.timerOn === false) {
  //     setTimeout(function runUrlUpdate() {
  //       initialState.content.lists.urls.forEach((url) => handleUrl(url));
  //       initialState.timerOn = true;
  //       setTimeout(runUrlUpdate, 5000);
  //     }, 0);
  //   }
  // };

  const handleError = (err) => {
    state.form.feedback = i18nInstance.t(err.message);
    state.buttons.addDisabled = false;
  };

  // const handleUrl = (url, e) => {
  //   const isSubmitted = () => {
  //     try { return !!e; } catch (err) { return false; }
  //   };

  //   // block "Add" button on 'submit' event only (not block it on autoupdates)
  //   if (isSubmitted()) {
  //     state.buttons.addDisabled = true;
  //   }

  //   const proxyDisabledCache = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

  //   // axios.get(`${proxyDisabledCache}${encodeURIComponent(`${url}`)}`) // work
  //   axios.get('http://localhost:5005/') // debug
  //     .then((response) => { console.log('>> response:'), console.log(response) }) // debug
  //     .then((response) => getXML(response, url))
  //     .then((xml) => parseXML(xml))
  //     .then((coll) => addIDs(coll))
  //     .then((collWithIDs) => addFeedsAndPostsToState(collWithIDs, isSubmitted()))
  //     // .catch((err) => { console.log('axios'); console.log(err); handleError(err); }); // debug
  //     .catch((err) => {
  //       if (err.message === 'feedback.networkError') {
  //         return Promise.reject(new Error ('feedback.networkError'))
  //       } else {
  //         console.log('>> axios, else → handleError(err):')
  //         console.log(handleError(err))
  //         handleError(err);
  //       }
  //     });
  // };

  const handleUrl = (url, e) => new Promise((resolve, reject) => {
    const isSubmitted = () => {
      try { return !!e; } catch (err) { return false; }
    };

    // block "Add" button on 'submit' event only (not block it on autoupdates)
    if (isSubmitted()) {
      state.buttons.addDisabled = true;
    }

    const proxyDisabledCache = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

    axios.get(`${proxyDisabledCache}${encodeURIComponent(`${url}`)}`) // work
    // axios.get('http://localhost:5005/') // debug
      .then((response) => getXML(response, url))
      .then((xml) => parseXML(xml))
      .then((coll) => addIDs(coll))
      .then((collWithIDs) => addFeedsAndPostsToState(collWithIDs, isSubmitted()))
      .then(() => resolve())
    // .catch((err) => { console.log('axios'); console.log(err); handleError(err); }); // debug
    // .catch((err) => {
    //   reject(err);
    // });
      .catch((err) => {
        // console.log('>> axios.catch(err):');
        // console.log(err);
        if (err.code === 'ERR_NETWORK') {
          reject(new Error('feedback.networkError'));
        } else {
          // console.log('>> axios, else → handleError(err):')
          // console.log(handleError(err))
          handleError(err);
          reject(err);
        }
      });
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');

    const runTimer = () => {
      setTimeout(function runUrlUpdate() {
        initialState.content.lists.urls.forEach((url) => handleUrl(url));
        initialState.timerOn = true;
        setTimeout(runUrlUpdate, 5000);
      }, 0);
    };

    // в schema.validate второй аргумент { urls: ... } нужен для yup.test('not-one-of')
    schema.validate(submittedUrl, { urls: initialState.content.lists.urls })
      .then(() => handleUrl(submittedUrl, e))
      // .then((handleUrlResult) => {
    // console.log('>> schema.validate.then(handleUrl(submittedUrl, e)):');
    // console.log(handleUrlResult);
      // })
      .then(() => {
        state.buttons.addDisabled = false;
        runTimer();
      })
      .then(() => { state.form.feedback = i18nInstance.t('feedback.success'); })
      .catch((err) => {
        // console.log('schema.validate.catch(err):');
        // console.log(err);

        // console.log('schema.validate.catch(err) --> handleError(err):');
        handleError(err);
      });
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
  const initialState = {
    // subscribed: false,
    timerOn: false,
    initiated: false,
    content: {
      lists: {
        urls: [], // ['https://lorem-rss.hexlet.app/feed', ...]
        feeds: [], // [{ title, description, id }]
        posts: [], // [{ title, link, description, id, feedId }, {...}, ...]
        newPosts: [],
      },
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

  const defaultLanguage = 'ru';

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(run(initialState, i18nInstance));
};
