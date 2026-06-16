const states = new Map();

function nowIso() {
  return new Date().toISOString();
}

function getState(phone) {
  return states.get(phone) || null;
}

function setState(phone, state) {
  const timestamp = nowIso();
  const nextState = {
    phone,
    currentFlow: null,
    currentStep: 0,
    data: {},
    createdAt: timestamp,
    updatedAt: timestamp,
    ...state,
  };

  states.set(phone, nextState);
  return nextState;
}

function updateState(phone, partialState) {
  const current = getState(phone) || setState(phone, { phone });
  const nextState = {
    ...current,
    ...partialState,
    data: {
      ...(current.data || {}),
      ...(partialState.data || {}),
    },
    updatedAt: nowIso(),
  };

  states.set(phone, nextState);
  return nextState;
}

function clearState(phone) {
  states.delete(phone);
}

module.exports = {
  getState,
  setState,
  updateState,
  clearState,
};
