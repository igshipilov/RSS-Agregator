/* eslint-disable no-param-reassign, no-console, func-names  */

import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';
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
      state: null, // error message from yup
    },
    processAdd: 'filling', // 'sending', 'sent', 'error'
    urls: [],
  };
  console.log('>> initialState:', initialState); // debug

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    textHint: document.querySelector('.text-muted'),
    textFeedback: document.querySelector('.feedback'),
  };

  const state = onChange(initialState, render(elements, initialState));

  const schema = yup.string()
    .trim()
    .url(i18nInstance.t('feedback.invalidUrl'))
    .test('not-one-of', i18nInstance.t('feedback.alreadyExists'), function (value) {
      const { urls } = this.options;
      return !urls.includes(value);
    })
    .required();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');
    schema.validate(submittedUrl, { urls: initialState.urls })
      .then(() => {
        initialState.uiState.state = i18nInstance.t('feedback.success');
        initialState.urls.push(submittedUrl);
        state.uiState.isValid = true;
      })
      .catch((error) => {
        initialState.uiState.state = error.errors;
        // сбрасываю статус на null, чтобы рендерилась ошибка, идущая подряд
        initialState.uiState.isValid = null;
        state.uiState.isValid = false;

        console.log('>> catched error:', error); // debug
        console.log('>> catched error.errors:', error.errors); // debug
      });

    console.log(`>> user sent: ${submittedUrl}`); // debug
    console.log('>> state after user input:', initialState); // debug
  });

  render(initialState, elements);
};
