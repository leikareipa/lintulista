"use strict";

function Component() {
  const counter = ReactRedux.useSelector(state => state.test);
  return React.createElement("div", null, "Heippa vaan ", counter);
}

export function testrend(container, store) {
  ReactDOM.render(React.createElement(ReactRedux.Provider, {
    store: store
  }, React.createElement(Component, null)), container);
}