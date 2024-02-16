/* eslint-disable no-param-reassign, no-console, func-names  */

import * as yup from 'yup';
import onChange from 'on-change';
import render from '../bin/render.js';
import i18next from 'i18next';
import resources from './locales/index.js'

/*

ФИДЫ ДЛЯ ТЕСТОВ
✅ Рабочие:
https://lorem-rss.hexlet.app/feed
https://buzzfeed.com/world.xml

❌ Нерабочие:
lorem-rss.hexlet.app/feed
buzzfeed.com/world.xml

*/

export default async () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })

  const initialState = {
    uiState: {
      isValid: null,
      error: null, // 'exists', 'incorrect'
    },
    processAdd: 'filling', // 'sending', 'sent', 'error'
    urls: [],
  };
  console.log('>> initialState:', initialState);

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    textHint: document.querySelector('.text-muted'),
    textFeedback: document.querySelector('.feedback'),
  };

  const state = onChange(initialState, render(elements, initialState));

  const schema = yup.string()
    .trim()
    .url()
    .test('not-one-of', 'URL already exists', function (value) {
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
        state.uiState.isValid = true;
        state.urls.push(submittedUrl);
      })
      .catch((error) => {
        state.uiState.isValid = false;

        console.log('>> catched error:', error); // debug
        console.log('>> catched error.errors:', error.errors); // debug

        if (error.errors.includes('this must be a valid URL')) {
          state.uiState.error = 'incorrect';
        } else if (error.errors.includes('URL already exists')) { // FIXME -- Какая ошибка возникает при триггере notOneOf() ?
          state.uiState.error = 'exists';
        }
      });

    console.log(`>> user sent: ${submittedUrl}`); // debug
    console.log('>> state after user input:', initialState); // debug
  });

  render(elements);
};



/*
// --- шпаргалка ---
// из документации
const schema = yup.object().shape({
  name: yup.string().trim().required(),
  email: yup.string().required('email must be a valid email').email(),
  password: yup.string().required().min(6),
  passwordConfirmation: yup.string()
    .required('password confirmation is a required field')
    .oneOf(
      [yup.ref('password'), null],
      'password confirmation does not match to password',
    ),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
  }
};

// Валидацию дублей проверяем с помощью .notOneOf():
// const schema = yup.object().shape({ inputValue: string().notOneOf(loadedFeeds, t('urlExist')) })

// решение студента Хекслет
const loadedFeeds = Object.values(state.catalog.feeds).map((item) => item.requestUrl)
  // здесь эти t('<string>') -- это просто текстовое сообщение, выводимое при ошибке
const formSchema = object().shape({
  inputValue: string()
    .url(t('urlIncorrect'))
    .required(t('notEmpty'))
    .notOneOf(loadedFeeds, t('urlExist'))
})

formSchema
  .validate({ inputValue })
  .then(() => {
    console.log('[ok]')
  })
  .catch((error) => {
    console.log('[error]', errorValue)
  })

// console.log:
// [ok] {loadedFeeds: Array(0), value: 'https://ru.hexlet.io/lessons.rss'}

// console.log:
// [ok]
// {
//   loadedFeeds: ['https://ru.hexlet.io/lessons.rss']
//   value : "https://ru.hexlet.io/lessons.rss"
// }
// -----------------
*/
