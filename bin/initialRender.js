/* eslint-disable no-param-reassign, no-console, func-names  */

export default (elements, i18nInstance) => {
  elements.titles.title.textContent = i18nInstance.t('titles.title');
  elements.titles.subtitle.textContent = i18nInstance.t('titles.subtitle');
  elements.formPlaceholder.textContent = i18nInstance.t('formPlaceholder');
  elements.buttons.add.textContent = i18nInstance.t('buttons.add');
};
