const { MAIN_MENU_MESSAGE } = require('../constants/messages');
const { setState } = require('../store/conversationState.store');

function getMainMenuMessage() {
  return MAIN_MENU_MESSAGE;
}

function resetToMainMenu(phone) {
  setState(phone, {
    currentFlow: 'main_menu',
    currentStep: 0,
    data: {},
  });
  return getMainMenuMessage();
}

module.exports = {
  getMainMenuMessage,
  resetToMainMenu,
};
