/* eslint-disable no-param-reassign, no-return-assign, */

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

  const handleError = (source, errorMessage, errorStatus) => {
    initialState[source].error = `feedback.${errorMessage}`;
    state[source].status = errorStatus;
  };

  const mappingError = {
    urlAlreadyExists: (errorMessage) => handleError('form', errorMessage, 'validationError'),
    invalidUrl: (errorMessage) => handleError('form', errorMessage, 'validationError'),
    networkError: (errorMessage) => handleError('loadingProcess', errorMessage, 'uploadError'),
    parseError: (errorMessage) => handleError('loadingProcess', errorMessage, 'uploadError'),
  };

  const getFeedsAndPosts = (content, url) => {
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
      return {
        title, link, description, id, feedId,
      };
    });

    const posts = postsInit.reverse();

    return { feed, posts };
  };

  const proxifyUrl = (url) => {
    const proxifiedUrl = new URL('https://allorigins.hexlet.app/get?');
    proxifiedUrl.searchParams.set('disableCache', 'true');
    proxifiedUrl.searchParams.set('url', url);
    return proxifiedUrl;
  };

  const refresh = () => {
    setTimeout(function runUrlUpdate() {
      if (initialState.content.feeds.length) {
        initialState.loadingProcess.status = 'starting';

        const { feeds, posts } = initialState.content;

        const feedsAndPosts = feeds.map(({ url }) => {
          const proxifiedUrl = proxifyUrl(url);

          return axios.get(proxifiedUrl)
            .then(parseXML)
            .then((content) => getFeedsAndPosts(content, url));
        });

        const result = Promise.all(feedsAndPosts);

        result
          .then((refreshedContent) => {
            const refreshedPosts = refreshedContent.reduce((acc, el) => {
              acc.push(...el.posts);
              return acc;
            }, []);

            const comparator = (first, second) => first.title === second.title;
            const newPosts = _.differenceWith(refreshedPosts, posts, comparator);

            initialState.content.posts.push(...newPosts);
            state.loadingProcess.status = 'success'; // render content
            initialState.loadingProcess.status = 'ready';

            console.log(initialState.content.posts);
          })
          .catch(); // keep app working even get-query fails
        // TODO надо ли где-то хранить список таких ошибок, учитывая, что мы их не обрабатываем?
      }
      setTimeout(runUrlUpdate, 5000);
    }, 5000);
  };

  refresh();

  setLocale({
    string: {
      url: 'invalidUrl',
    },
  });

  const schema = yup.string()
    .trim()
    .url()
    .test('not-one-of', 'urlAlreadyExists', function isNotOneOf(currentUrl) {
      const { urls } = this.options;
      return !urls.includes(currentUrl);
    })
    .required();

  // const loadFeedsAndPosts = (proxifiedUrl, submittedUrl) => axios.get('http://localhost:5005/') // debug
  const loadFeedsAndPosts = (proxifiedUrl, submittedUrl) => axios.get(proxifiedUrl)
    .then(parseXML)
    .then((content) => getFeedsAndPosts(content, submittedUrl))
    .then(({ feed, posts }) => {
      initialState.content.feeds.push(feed);
      initialState.content.posts.push(...posts);
    })
    .then(() => {
      state.loadingProcess.status = 'success'; // triggers render content
      state.form.status = 'sent'; // triggers render success Feedback
    });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');
    const proxifiedUrl = proxifyUrl(submittedUrl);
    const urls = initialState.content.feeds.map(({ url }) => url);

    initialState.loadingProcess.status = 'starting';
    state.form.status = 'sending'; // disable form

    // in schema.validate second arg { urls } is used for: yup.test('not-one-of')
    schema.validate(submittedUrl, { urls })
      .then(() => loadFeedsAndPosts(proxifiedUrl, submittedUrl))
      .catch((err) => {
        console.log(err);
        if (err.code) {
          const errorMessage = 'networkError';
          mappingError[errorMessage](errorMessage);
        } else {
          mappingError[err.message](err.message);
        }
      });
  });

  // MODAL_&_POSTS
  const modal = elements.modal.window;
  modal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const id = button.getAttribute('data-id');

    state.ui.activePostId = id;
    initialState.ui.clickedPostsIds.push(id);
  });

  const { posts } = elements.content;
  posts.addEventListener('click', (e) => {
    const el = e.target;

    if (el.tagName === 'A') {
      const { id } = el.dataset;
      state.ui.activePostId = id;
      initialState.ui.clickedPostsIds.push(id);
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
      error: null, // 'urlAlreadyExists', 'invalidUrl'
    },
    content: {
      feeds: [], // [{ title, description, id, url }, ...]
      posts: [], // [{ title, link, description, id, feedId }, ...]
    },
    ui: {
      activePostId: null, // used by modal
      clickedPostsIds: [],
    },
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: initialState.lng,
    debug: false,
    resources,
  }).then(run(initialState, i18nInstance));
};
