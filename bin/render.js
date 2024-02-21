/* eslint-disable

no-param-reassign,
no-console,
func-names,
array-callback-return,
no-unused-vars,

*/

export default (elements, initialState, i18nInstance) => (path, value) => {
  // console.log(path)
  switch (path) {
    case 'form.error':
      elements.input.classList.add('is-invalid');
      elements.textFeedback.classList.remove('text-success');
      elements.textFeedback.classList.add('text-danger');
      elements.textFeedback.textContent = value;
      break;

    case 'buttons.addDisabled':
      if (value) {
        elements.buttons.add.setAttribute('disabled', '');
      } else {
        elements.buttons.add.removeAttribute('disabled');
      }
      break;
  }
};














// ----------------------------------------------------------------
// ============== OLD render.js ===================================
// ----------------------------------------------------------------

// const handleFeedback = (elements, initialState, value, i18nInstance) => {
//   if (value === false) {
//     elements.input.classList.add('is-invalid');
//     elements.textFeedback.classList.remove('text-success');
//     elements.textFeedback.classList.add('text-danger');
//     elements.textFeedback.textContent = i18nInstance.t(initialState.uiState.state);
//   }
//   if (value === true) {
//     elements.input.classList.remove('is-invalid');
//     elements.input.value = '';
//     elements.input.focus();
//     elements.textFeedback.classList.remove('text-danger');
//     elements.textFeedback.classList.add('text-success');
//     elements.textFeedback.textContent = i18nInstance.t(initialState.uiState.state);
//   }
// };

// const handleInit = (titleName) => {
//   const container = document.createElement('div');
//   const containerForTitle = document.createElement('div');
//   const title = document.createElement('h2');
//   const list = document.createElement('ul');

//   container.classList.add('card', 'border-0');
//   containerForTitle.classList.add('card-body');
//   title.classList.add('card-title', 'h4');
//   list.classList.add('list-group', 'border-0', 'rounded-0');

//   title.textContent = titleName;

//   containerForTitle.append(title);
//   container.append(containerForTitle, list);

//   return container;
// };

// const handleContent = (elements, initialState, path, value, i18nInstance) => {
//   if (path === 'content.feeds') {
//     const list = document.querySelector('.feeds > .card > ul');
//     list.textContent = '';

//     value.map((feed) => {
//       const item = document.createElement('li');
//       const title = document.createElement('h3');
//       const description = document.createElement('p');

//       item.classList.add('list-group-item', 'border-0', 'border-end-0');
//       title.classList.add('h6', 'm-0');
//       description.classList.add('m-0', 'small', 'text-black-50');

//       title.textContent = feed.title;
//       description.textContent = feed.description;

//       item.append(title, description);
//       list.prepend(item);
//     });
//   }

//   if (path === 'content.posts') {
//     const list = document.querySelector('.posts > .card > ul');
//     list.textContent = '';

//     value.map(({
//       title, link, description, id, feedId,
//     }) => {
//       const item = document.createElement('li');
//       const titleElement = document.createElement('a');
//       const button = document.createElement('button');

//       item.classList.add(
//         'list-group-item',
//         'd-flex',
//         'justify-content-between',
//         'align-items-start',
//         'border-0',
//         'border-end-0',
//       );
//       titleElement.classList.add('fw-bold');
//       button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

//       titleElement.setAttribute('href', `${link}`);
//       titleElement.setAttribute('data-id', '84');
//       titleElement.setAttribute('target', '_blank');
//       titleElement.setAttribute('rel', 'noopener noreferrer');

//       button.setAttribute('type', 'button');
//       button.setAttribute('data-id', '82');
//       button.setAttribute('data-bs-toggle', 'modal');
//       button.setAttribute('data-bs-target', '#modal');

//       titleElement.textContent = title;
//       button.textContent = i18nInstance.t('buttons.view');

//       item.append(titleElement, button);
//       list.prepend(item);
//     });
//   }
// };

// export default (elements, initialState, i18nInstance) => (path, value) => {
//   // console.log('RENDER >> path:', path, '>> value:', value); // debug
//   switch (path) {
//     case 'uiState.isValid':
//       handleFeedback(elements, initialState, value, i18nInstance);
//       break;

//     case 'content.feeds':
//       if (value) {
//         const postsChildNodes = document.querySelector('.posts').childNodes;
//         const isPostsInitiated = !!postsChildNodes.length;

//         if (!isPostsInitiated) {
//           elements.content.feeds.append(handleInit('Фиды'));
//           elements.content.posts.append(handleInit('Посты'));
//         }
//       }
//       handleContent(elements, initialState, path, value);
//       break;

//     case 'content.posts':
//       if (value) {
//         const postsChildNodes = document.querySelector('.posts').childNodes;
//         const isPostsInitiated = !!postsChildNodes.length;

//         if (!isPostsInitiated) {
//           elements.content.feeds.append(handleInit('Фиды'));
//           elements.content.posts.append(handleInit('Посты'));
//         }
//       }
//       handleContent(elements, initialState, path, value, i18nInstance);
//       break;

//     default:
//       throw new Error(`Unknown path: ${path}`);
//   }
// };
