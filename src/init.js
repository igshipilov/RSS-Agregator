/* eslint-disable

no-param-reassign,
no-console,
func-names,
consistent-return,
no-shadow,
max-len,
no-use-before-define,

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
https://lorem-rss.herokuapp.com/feed?unit=second

❌ Нерабочие:
lorem-rss.hexlet.app/feed
buzzfeed.com/world.xml

*/

export default () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const initialState = {
    subscribed: false,
    timerOn: false,
    initiated: false,
    content: {
      // modal: [], // [{ modalId: 1, visibility: true }, { modalId: 2, visibility: false }, ...]
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
  // console.log('>> initialState:', initialState); // debug

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
    // allPosts: document.querySelectorAll('.posts > .card > ul > li'),
  };

  // console.log(elements.modal);
  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  setLocale({
    string: {
      url: { key: 'feedback.invalidUrl' },
    },
  });

  const schema = yup.string()
    .trim()
    .url()
    .test('not-one-of', { key: 'feedback.alreadyExists' }, function (value) {
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

    try {
      const parsed = parser.parseFromString(xml, 'text/xml');
      const title = parsed.documentElement.getElementsByTagName('title')[0].textContent;
      const description = parsed.documentElement.getElementsByTagName('description')[0].textContent;

      const feed = {
        title,
        description,
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
    } catch (error) {
      initialState.uiState.state = 'feedback.parseError';
    }
  };

  const addIDs = (coll) => {
    // const { title: feedTitle, description: feedDescription } = coll.feed;
    const resultColl = coll;

    const setId = (currentTitle, type) => {
      const wasFeedAdded = initialState.content.lists[type].find(({ title }) => title === currentTitle);
      return wasFeedAdded ? wasFeedAdded.id : _.uniqueId();
    };

    resultColl.feed.id = setId(coll.feed.title, 'feeds');
    resultColl.posts.forEach((post) => {
      const id = setId(post.title, 'posts');
      const feedId = resultColl.feed.id;
      post.id = id;
      post.feedId = feedId;
    });

    // console.log(resultColl); // debug
    return (resultColl);
  };

  const getXML = (response, url) => {
    if (response) {
      const wasUrlAdded = initialState.content.lists.urls.includes(url);
      if (!wasUrlAdded) {
        initialState.content.lists.urls.push(url);
      }
      state.initiated = true; // триггерим первичный рендер (заголовки "Фиды" и "Посты", <ul>)

      return response.data.contents; // xml → typeof: string
    }
    throw new Error('feedback.networkError');
  };

  const runTimer = () => {
    if (initialState.subscribed === true && initialState.timerOn === false) {
      setTimeout(function run() {
        initialState.content.lists.urls.forEach((url) => handleUrl(url));
        initialState.timerOn = true;
        setTimeout(run, 5000);
      }, 5000);
    }
  };

  function handleUrl(url, e) {
    const isSubmitted = () => {
      try { return !!e; } catch (err) { return false; }
    };

    // block "Add" button on 'submit' event only (not block it on autoupdates)
    if (isSubmitted()) {
      state.buttons.addDisabled = true;
    }

    const proxyDisabledCache = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

    axios.get(`${proxyDisabledCache}${encodeURIComponent(`${url}`)}`)
      .then((response) => getXML(response, url))
      .then((xml) => parseXML(xml))
      .then((coll) => addIDs(coll))
      .then((collWithIDs) => addFeedsAndPostsToState(collWithIDs, isSubmitted())) // здесь триггерим рендер
      .then(() => {
        state.buttons.addDisabled = false;
        initialState.subscribed = true;
        runTimer();
      })
      .catch((err) => { // обработчик ошибки Сети
        console.log(err);
        state.form.feedback = i18nInstance.t(err.message);
        state.buttons.addDisabled = false;
      });
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');

    // в schema.validate второй аргумент { urls: ... } нужен для yup.test('not-one-of')
    schema.validate(submittedUrl, { urls: initialState.content.lists.urls })
      .then(() => handleUrl(submittedUrl, e))
      .then(() => { state.form.feedback = i18nInstance.t('feedback.success'); })
      .catch((err) => { // обработчик ошибок ввода (юзер ошибся)
        state.form.feedback = err.errors.map((curErr) => i18nInstance.t(curErr.key));
        state.buttons.addDisabled = false;
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
