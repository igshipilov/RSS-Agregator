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
      formPlaceholder: document.querySelector('[for="url-input"'),
      input: document.querySelector('#url-input'),
      example: document.querySelector('#example'),
    },
    buttons: {
      add: document.querySelector('[aria-label="add"]'),
      changeLanguage: document.querySelector('#change-language'),
      lng: document.querySelectorAll('.dropdown-language'),
      readFullArticle: document.querySelector('.full-article'),
      closeArticle: document.querySelector('.close-article'),
    },
    form: document.querySelector('.rss-form'),
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

  const languages = elements.buttons.lng;

  languages.forEach((language) => language.addEventListener('click', (e) => {
    const { target } = e;
    const { value } = target.dataset;
    i18nInstance.changeLanguage(value);
  }));

  i18nInstance.on('languageChanged', (lng) => state.lng = lng);

  const getFeedsAndPosts = (content, url) => {
    const { channelTitle: title, channelDescription: description, items } = content;
    const feedId = _.uniqueId();

    const feed = {
      title,
      description,
      id: feedId,
      url,
    };

    const initialPosts = items.map((item) => {
      const id = _.uniqueId();
      item.id = id;
      item.feedId = feedId;

      return item;
    });

    const posts = initialPosts.reverse();

    return { feed, posts };
  };

  const proxifyUrl = (url) => {
    const proxifiedUrl = new URL('https://allorigins.hexlet.app/get?');
    proxifiedUrl.searchParams.set('disableCache', 'true');
    proxifiedUrl.searchParams.set('url', url);

    return proxifiedUrl;
  };

  function runUrlUpdate() {
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
        if (newPosts.length) {
          state.content.posts.push(...newPosts);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setTimeout(runUrlUpdate, 5000));
  }

  const refresh = () => {
    setTimeout(runUrlUpdate(), 5000);
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

  const loadFeedsAndPosts = (proxifiedUrl, submittedUrl) => {
    state.loadingProcess.status = 'starting';

    return axios.get(proxifiedUrl)
      .then((response) => {
        const content = parseXML(response);
        const { feed, posts } = getFeedsAndPosts(content, submittedUrl);

        state.content.feeds.push(feed);
        state.content.posts.push(...posts);

        state.loadingProcess.status = 'success';
        state.form.status = 'sent';
      })
      .catch((err) => {
        if (err.code === 'ERR_NETWORK') {
          initialState.loadingProcess.error = 'feedback.networkError';
        } else {
          initialState.loadingProcess.error = `feedback.${err.message}`;
        }
        state.loadingProcess.status = 'uploadError';
      });
  };
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');
    const proxifiedUrl = proxifyUrl(submittedUrl);
    const urls = initialState.content.feeds.map(({ url }) => url);

    state.form.status = 'sending';

    schema.validate(submittedUrl, { urls })
      .then(() => loadFeedsAndPosts(proxifiedUrl, submittedUrl))
      .catch((err) => {
        initialState.form.error = `feedback.${err.message}`;
        state.form.status = 'validationError';
      });
  });

  const { posts } = elements.content;
  posts.addEventListener('click', (e) => {
    const el = e.target;
    const { id } = el.dataset;

    if (id) {
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
      status: 'ready',
      error: null,
    },
    form: {
      status: 'waiting',
      error: null,
    },
    content: {
      feeds: [],
      posts: [],
    },
    ui: {
      activePostId: null,
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
