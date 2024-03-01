/* eslint-disable

no-param-reassign,
max-len,

*/


export default (elements, initialState, i18nInstance) => (path, value) => {
  switch (path) {
    // default:
    //   throw new Error(`Unknown path: ${path}`);
  }
};



// ======== OLD =============

// TODO use this code for changeLanguge feature
// const renderInitialInterface = (elements, i18nInstance) => {
//   elements.mainInterface.title.textContent = i18nInstance.t('mainInterface.title');
//   elements.mainInterface.subtitle.textContent = i18nInstance.t('mainInterface.subtitle');
//   elements.mainInterface.title.textContent = i18nInstance.t('mainInterface.title');
//   elements.mainInterface.formPlaceholder.textContent = i18nInstance.t('mainInterface.formPlaceholder');
//   elements.buttons.add.textContent = i18nInstance.t('buttons.add');
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

// const handleFeedback = (elements, initialState, i18nInstance) => {
//   if (initialState.isFormValid) {
//     elements.input.classList.remove('is-invalid');
//     elements.form.reset();
//     elements.input.focus();
//     elements.textFeedback.classList.remove('text-danger');
//     elements.textFeedback.classList.add('text-success');
//     elements.textFeedback.textContent = i18nInstance.t(initialState.form.feedback);
//   } else {
//     elements.input.classList.add('is-invalid');
//     elements.textFeedback.classList.remove('text-success');
//     elements.textFeedback.classList.add('text-danger');
//     elements.textFeedback.textContent = i18nInstance.t(initialState.form.feedback);
//   }
// };

// const handleFeeds = (value) => {
//   const list = document.querySelector('.feeds > .card > ul');
//   list.textContent = '';

//   value.map((feed) => {
//     const item = document.createElement('li');
//     const title = document.createElement('h3');
//     const description = document.createElement('p');

//     item.classList.add('list-group-item', 'border-0', 'border-end-0');
//     title.classList.add('h6', 'm-0');
//     description.classList.add('m-0', 'small', 'text-black-50');

//     title.textContent = feed.title;
//     description.textContent = feed.description;

//     item.append(title, description);
//     list.prepend(item);
//   });
// };

// const handlePosts = (value, i18nInstance) => {
//   const list = document.querySelector('.posts > .card > ul');

//   value.map(({
//     title, link, id,
//   }) => {
//     const item = document.createElement('li');
//     const titleElement = document.createElement('a');
//     const button = document.createElement('button');

//     item.classList.add(
//       'list-group-item',
//       'd-flex',
//       'justify-content-between',
//       'align-items-start',
//       'border-0',
//       'border-end-0',
//     );
//     titleElement.classList.add('fw-bold');
//     button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

//     titleElement.setAttribute('href', `${link}`);
//     titleElement.setAttribute('data-id', `${id}`);
//     titleElement.setAttribute('target', '_blank');
//     titleElement.setAttribute('rel', 'noopener noreferrer');

//     button.setAttribute('type', 'button');
//     button.setAttribute('data-id', `${id}`);
//     button.setAttribute('data-bs-toggle', 'modal');
//     button.setAttribute('data-bs-target', '#modal');

//     titleElement.textContent = title;
//     button.textContent = i18nInstance.t('buttons.view');

//     item.append(titleElement, button);
//     list.prepend(item);
//   });
// };

// const handlerClickedPost = (elements, initialState, value) => {
//   const currentPost = document.querySelector(`[data-id="${value}"]`);
//   const { posts } = initialState.content;
//   const currentPostData = posts.find(({ id }) => id === value);
//   const { title, description, link } = currentPostData;

//   currentPost.classList.remove('fw-bold');
//   currentPost.classList.add('fw-normal', 'link-secondary');

//   elements.modal.title.textContent = title;
//   elements.modal.body.textContent = description;
//   elements.modal.fullArticle.setAttribute('href', `${link}`);
// };

// export default (elements, initialState, i18nInstance) => (path, value) => {
//   switch (path) {
//     case 'initiated':
//       elements.content.feeds.append(handleInit(i18nInstance.t('mainInterface.feedsTitle')));
//       elements.content.posts.append(handleInit(i18nInstance.t('mainInterface.postsTitle')));
//       break;

//     case 'form.feedback':
//       handleFeedback(elements, initialState, i18nInstance);
//       break;

//     case 'buttons.addDisabled':
//       elements.buttons.add.toggleAttribute('disabled');
//       elements.input.toggleAttribute('readonly');
//       break;

//     case 'content.feeds':
//       handleFeeds(value);
//       break;

//     case 'content.newPosts':
//       handlePosts(value, i18nInstance);
//       break;

//     case 'ui.activePostId':
//       handlerClickedPost(elements, initialState, value);
//       break;

//       // TODO use this code for changeLanguge feature
//       // case 'firstRender':
//       //   renderInitialInterface(elements, i18nInstance);
//       //   break;

//     default:
//       throw new Error(`Unknown path: ${path}`);
//   }
// };
