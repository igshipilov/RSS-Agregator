/* eslint-disable

no-param-reassign,
no-console,
func-names,
consistent-return,
no-shadow,
max-len

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
https://lorem-rss.herokuapp.com/feed?unit=second
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
    subscribed: false,
    initiated: false,
    content: {
      modal: [], // [{ modalId: 1, visibility: true }, { modalId: 2, visibility: false }, ...]
      lists: {
        urls: [], // ['https://lorem-rss.hexlet.app/feed', ...]
        feeds: [], // [{ title, description, id }]
        posts: [], // [{ title, link, description, id, feedId }, {...}, ...]
        newPosts: [],
      },
    },
    form: {
      state: null, // 'error', 'success'
      error: null, // 'invalidUrl', 'alreadyExists', 'parseError'
    },
    buttons: {
      addDisabled: false,
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

  // -----------------------------------------------------------------------------
  // Если это сабмит от юзера, то:
  // рендер всех постов

  // Если это не сабмит от юзера, то:
  // добавляет только новые посты в state.newPosts,
  // рендерит и затем удаляет их из state.newPosts

  // То есть отслеживание обновлений рендерит только новые посты из уже добавленных урлов
  // (поэтому feedId новых постов надо как-то связать с уже добавленными фидами)

  // isSubmitted === bool
  // он нужен, чтобы выбрать:
  //  - или рендерить фиды и посты
  //  - или рендерить только НОВЫЕ посты

  // Ещё быть может возможно сделать эту функцию универсальной в части триггера рендера постов.
  // Надо ещё подумать.

  // ❌ FIXME -- кажется, не отрабатывает проверка новых поство и запись их в state
  const addFeedsAndPostsToState = (collFeedsAndPosts, isSubmitted) => {
    const { posts, feed } = collFeedsAndPosts;
    // console.log(posts, feed); // debug

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

    console.log(newPosts);
    // console.log(initialState.content.lists)
  };
    // -----------------------------------------------------------------------------

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

      const posts = [...items].map((item) => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;

        return { title, link, description };
      });

      return { feed, posts };
    } catch (error) {
      initialState.uiState.state = 'feedback.parseError';
      state.uiState.isValid = false;
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

  const handleUrl = (url, e) => {
    const isSubmitted = () => {
      try { return !!e; } catch (err) { return false; }
    };

    // кнопка заблочится только если это сабмит (и не заблочится при автопроверке обновлений)
    if (isSubmitted()) {
      state.buttons.addDisabled = true;
    }


    const proxyDisabledCache = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

    axios.get(`${proxyDisabledCache}${encodeURIComponent(`${url}`)}`)
      .then((response) => {
        if (response) {
          const wasUrlAdded = initialState.content.lists.urls.includes(url);
          if (!wasUrlAdded) {
            initialState.content.lists.urls.push(url);
          }
          state.initiated = true; // триггерим первичный рендер (заголовки "Фиды" и "Посты", <ul>)

          return response.data.contents; // xml → typeof: string
        }
        throw new Error('feedback.networkError');
      })
      .then((xml) => parseXML(xml))
      .then((coll) => addIDs(coll))
      .then((collWithIDs) => addFeedsAndPostsToState(collWithIDs, isSubmitted())) // здесь триггерим рендер
      .then(() => {
        state.buttons.addDisabled = false;
        initialState.subscribed = true;
      })
      .catch((err) => { // обработчик ошибки Сети
        state.form.error = i18nInstance.t(err.message);
        state.buttons.addDisabled = false;
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submittedUrl = formData.get('url');

    // в schema.validate второй аргумент { urls: ... } нужен для yup.test('not-one-of')
    schema.validate(submittedUrl, { urls: initialState.content.lists.urls })
      .then(() => handleUrl(submittedUrl, e))
      .catch((err) => { // обработчик ошибок ввода (юзер ошибся)
        state.form.error = err.errors.map((curErr) => i18nInstance.t(curErr.key));
        state.buttons.addDisabled = false;
      });
  });

  // ❌ FIXME -- кажется, не отрабатывает таймер
  if (initialState.subscribed === true) {
    setTimeout(function run() {
      initialState.content.lists.urls.forEach((url) => handleUrl(url));
      setTimeout(run, 1000);
    }, 0);
  }
};

// ----------------------------------------------------------------
// ============== OLD init.js =====================================
// ----------------------------------------------------------------
//   initialRender(elements, i18nInstance);

//   const parseXML = (xml) => {
//     const parser = new DOMParser();

//     try {
//       const parsed = parser.parseFromString(xml, 'text/xml');

//       const setId = (currentTitle, type) => {
//         const wasFeedAdded = initialState.content[type].find(({ title }) => title === currentTitle);
//         return wasFeedAdded ? wasFeedAdded.id : _.uniqueId()
//       };

//       const title = parsed.documentElement.getElementsByTagName('title')[0].textContent;
//       const description = parsed.documentElement.getElementsByTagName('description')[0].textContent;

//       const feed = {
//         title,
//         description,
//         id: setId(title, 'feeds'),
//       };

//       const items = parsed.documentElement.getElementsByTagName('item');

//       const posts = [...items].map((item) => {
//         const title = item.querySelector('title').textContent;
//         const link = item.querySelector('link').textContent;
//         const description = item.querySelector('description').textContent;
//         const id = setId(title, 'posts');
//         const feedId = feed.id;

//         return {
//           title, link, description, id, feedId,
//         };
//       });

//       return { feed, posts };

//     } catch (error) {
//       initialState.uiState.state = 'feedback.parseError';
//       state.uiState.isValid = false;
//     }
//   };

//   const addFeedsAndPostsToState = (xml) => {
//     const parsedData = parseXML(xml);
//     const currentPosts = initialState.content.posts;
//     const parsedPosts = parsedData.posts;
//     const newPosts = _.differenceWith(parsedPosts, currentPosts, _.isEqual);
//     const hasNewPosts = !_.isEmpty(newPosts);

//     if (hasNewPosts) {
//       // state.content.feeds.push(parsedData.feed);
//       state.content.posts.push(...newPosts);
//     }
//   };

//   const getXmlFromUrl = (url) => axios.get(
//     `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`
//     )
//   .then((response) => {
//     if (response) return response.data.contents;
//     throw new Error('Network response was not ok.');
//   });

//   const addContentFromUrl = (submittedUrl) => {
//     schema.validate(submittedUrl, { urls: initialState.urls })
//       .then(() => {
//         initialState.uiState.state = 'feedback.success';
//         initialState.urls.push(submittedUrl);
//         // сбрасываю статус на null, чтобы рендерился контент из идущего подряд валидного url
//         initialState.uiState.isValid = null;

//         state.uiState.isValid = true;
//         getXmlFromUrl(submittedUrl).then((xml) => addFeedsAndPostsToState(xml));
//       })
//       .catch((error) => {
//         initialState.uiState.state = error.errors.map((curErr) => i18nInstance.t(curErr.key));

//         // сбрасываю статус на null, чтобы рендерилась ошибка, идущая подряд
//         initialState.uiState.isValid = null;
//         state.uiState.isValid = false;
//       });
//   };

// const postIfPostsUpdated = () => {
//   setTimeout(function run() {
//     initialState.urls.forEach((url) => {
//       getXmlFromUrl(url).then((xml) => addFeedsAndPostsToState(xml));
//     });
//     setTimeout(run, 1000);
//   }, 0)
// };

//   elements.form.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const formData = new FormData(e.target);
//     const submittedUrl = formData.get('url');

//     addContentFromUrl(submittedUrl);
//     postIfPostsUpdated();
//   });
// };
