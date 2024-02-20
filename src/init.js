/* eslint-disable no-param-reassign, no-console, func-names, consistent-return  */

import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';
import initialRender from '../bin/initialRender.js';
import render from '../bin/render.js';

/*

ФИДЫ ДЛЯ ТЕСТОВ
✅ Рабочие:
https://lorem-rss.hexlet.app/feed
https://buzzfeed.com/world.xml

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
    uiState: {
      isValid: null,
      state: null, // error key from yup, to access it from i18next in View
    },
    processAdd: 'filling', // 'sending', 'sent', 'error'
    urls: [],
    content: {
      feeds: [],
      posts: [],
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
  };

  initialRender(elements, i18nInstance);

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  setLocale({
    string: {
      url: () => ({ key: 'feedback.invalidUrl' }),
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

  const getParsedXML = (data) => {
    const parser = new DOMParser();
    const xmlString = data.contents;

    try {
      const parsed = parser.parseFromString(xmlString, 'text/xml');

      const feed = {
        title: parsed.documentElement.getElementsByTagName('title')[0].textContent,
        description: parsed.documentElement.getElementsByTagName('description')[0].textContent,
        id: _.uniqueId(),
      };

      const items = parsed.documentElement.getElementsByTagName('item');

      const posts = [...items].map((item) => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;
        const id = _.uniqueId();
        const feedId = feed.id;

        return {
          title, link, description, id, feedId,
        };
      });

      return { feed, posts };
    } catch (error) {
      initialState.uiState.state = 'feedback.parseError';
      state.uiState.isValid = false;
    }
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');
    schema.validate(submittedUrl, { urls: initialState.urls })
      .then(() => {
        initialState.uiState.state = 'feedback.success';
        initialState.urls.push(submittedUrl);
        initialState.uiState.isValid = null;

        state.uiState.isValid = true;
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${submittedUrl}`)}`)
          .then((response) => {
            if (response) return response.data;
            throw new Error('Network response was not ok.');
          })
          .then((data) => {
            const parsedData = getParsedXML(data);

            state.content.feeds.push(parsedData.feed);
            state.content.posts.push(...parsedData.posts);

          // console.log('>> initialState.content.posts:'); // debug
          // console.log(initialState.content.posts[0].title); // debug
          });

        // ---- DELETE ME ----
        // fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${submittedUrl}`)}`)
        //   .then((response) => {
        //     if (response.ok) return response.json();
        //     throw new Error('Network response was not ok.');
        //   })
        //   .then((data) => {
        //     const parsedData = getParsedXML(data);

        //     state.content.feeds.push(parsedData.feed);
        //     state.content.posts.push(...parsedData.posts);

        //   // console.log('>> initialState.content.posts:'); // debug
        //   // console.log(initialState.content.posts[0].title); // debug
        //   });
        // ------------------
      })
      .catch((error) => {
        // console.log('>> error:'); // debug
        // console.log(JSON.parse(JSON.stringify(error))); // debug
        initialState.uiState.state = error.errors.map((curErr) => i18nInstance.t(curErr.key));
        // --- Чтобы эти логи работил, оберни колбэк мэпа в {} ---
        // console.log('>>>> currentErr:');
        // console.log(currentErr);

        // console.log('>>>> i18nInstance.t(currentErr.key):');
        // console.log(i18nInstance.t(currentErr.key));
        // -------------------------------------------------------

        // сбрасываю статус на null, чтобы рендерилась ошибка, идущая подряд
        initialState.uiState.isValid = null;
        state.uiState.isValid = false;

        // console.log('>> catched error:', error); // debug
        // console.log('>> catched error.errors:', error.errors); // debug
      });

    // console.log(`>> user sent: ${submittedUrl}`); // debug
    // console.log('>> state after user input:', initialState); // debug
  });
};
