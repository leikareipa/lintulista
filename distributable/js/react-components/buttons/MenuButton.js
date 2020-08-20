"use strict";

import { panic_if_not_type, warn, throw_if_not_true } from "../../assert.js";
export function MenuButton(props = {}) {
  MenuButton.validate_props(props);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const [currentItemText, setCurrentItemText] = React.useState(props.items.length ? props.items[props.initialItemIdx].text : "null");
  React.useEffect(() => {
    window.addEventListener("mousedown", handle_mousedown);
    return () => {
      window.removeEventListener("mousedown", handle_mousedown);
    };

    function handle_mousedown(clickEvent) {
      const clickedOnSelf = (() => {
        let node = clickEvent.target;

        while (node) {
          if (node.dataset && node.dataset.menuButtonId === props.id) {
            return true;
          }

          node = node.parentNode;
        }

        return false;
      })();

      const clickedOnItem = Boolean(clickedOnSelf && clickEvent.target.classList && clickEvent.target.classList.contains("item"));
      const clickedOnTitle = Boolean(clickedOnSelf && clickEvent.target.classList && clickEvent.target.classList.contains("title"));

      const clickedOnCustomMenu = (() => {
        if (!props.customMenu) {
          return false;
        }

        let node = clickEvent.target;

        while (node) {
          if (node.classList && node.classList.contains("custom-menu")) {
            return true;
          }

          node = node.parentNode;
        }

        return false;
      })();

      if (clickedOnSelf) {
        if (!clickedOnItem && !clickedOnTitle && !clickedOnCustomMenu) {
          dropdownVisible ? hide_dropdown() : show_dropdown();
          props.callbackOnButtonClick();
        }
      } else {
        hide_dropdown();
      }
    }
  });
  const itemElements = props.items.map((item, idx) => React.createElement("div", {
    key: item.text + idx,
    className: "item",
    onClick: () => handle_item_click(idx, item.callbackOnSelect)
  }, item.text));

  const dropDownMenu = (() => {
    if (props.customMenu) {
      return React.createElement("div", {
        className: `dropdown custom-menu ${dropdownVisible ? "active" : "inactive"}`
      }, props.customMenu);
    } else {
      if (!props.items.length) {
        return React.createElement(React.Fragment, null);
      } else {
        return React.createElement("div", {
          className: `dropdown ${dropdownVisible ? "active" : "inactive"}`
        }, React.createElement("div", {
          className: "items"
        }, props.title.length ? React.createElement("div", {
          className: "title"
        }, props.title) : React.createElement(React.Fragment, null), itemElements));
      }
    }
  })();

  return React.createElement("div", {
    className: `MenuButton ${props.enabled ? "enabled" : "disabled"} ${props.id}`,
    "data-menu-button-id": props.id
  }, React.createElement("div", {
    className: "tooltip",
    style: {
      display: props.showTooltip ? "initial" : "none"
    }
  }, currentItemText), React.createElement("div", {
    className: `icon ${dropdownVisible ? "active" : "inactive"}`.trim(),
    title: props.title
  }, React.createElement("i", {
    className: props.icon
  })), dropDownMenu);

  function handle_item_click(itemIdx, callback) {
    if (!props.items.length) {
      warn("Received a click on an item even though there are no items.");
      return;
    }

    setCurrentItemText(props.items[itemIdx].text);
    setDropdownVisible(false);
    callback();
  }

  function hide_dropdown() {
    setDropdownVisible(false);
  }

  function show_dropdown() {
    if (props.items.length || props.customMenu) {
      setDropdownVisible(true);
    }
  }
}
MenuButton.defaultProps = {
  id: "undefined-menu-button",
  title: "?",
  icon: "fas fa-question",
  items: [],
  enabled: true,
  initialItemIdx: 0,
  showTooltip: true,
  callbackOnButtonClick: () => {},
  customMenu: false
};

MenuButton.validate_props = function (props) {
  panic_if_not_type("object", props, props.items);
  panic_if_not_type("string", props.title, props.id);
  return;
};

MenuButton.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(MenuButton, {
        icon: "fas fa-list-ul fa-fw",
        title: "Title1",
        id: "Test-Menu",
        items: [{
          text: "Option1",
          callbackOnSelect: () => {}
        }, {
          text: "Option2",
          callbackOnSelect: () => {}
        }],
        initialItemIdx: 1,
        showTooltip: false
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const menuButton = container.querySelector(".MenuButton");
    const tooltip = menuButton.querySelector(".tooltip");
    const icon = menuButton.querySelector(".icon");
    const dropdown = menuButton.querySelector(".dropdown");
    const dropdownItems = dropdown.querySelector(".items");
    throw_if_not_true([() => menuButton !== null, () => icon !== null, () => tooltip !== null, () => dropdown !== null, () => menuButton.classList.contains("Test-Menu"), () => menuButton.classList.contains("enabled"), () => tooltip.style.display === "none", () => tooltip.textContent === "Option2", () => icon.getAttribute("title") === "Title1", () => dropdown.classList.contains("inactive"), () => dropdownItems.querySelector(".title") !== null, () => dropdownItems.querySelector(".title").textContent === "Title1", () => dropdownItems.querySelectorAll(".item").length === 2, () => dropdownItems.querySelectorAll(".item")[0].textContent === "Option1", () => dropdownItems.querySelectorAll(".item")[1].textContent === "Option2"]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(MenuButton, {
        icon: "fas fa-list-ul fa-fw",
        title: "Title1",
        id: "Test-Menu",
        items: [{
          text: "Option1",
          callbackOnSelect: () => {}
        }, {
          text: "Option2",
          callbackOnSelect: () => {}
        }],
        initialItemIdx: 1,
        showTooltip: true
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const tooltip = container.querySelector(".tooltip");
    throw_if_not_true([() => tooltip !== null, () => tooltip.style.display !== "none", () => tooltip.textContent === "Option2"]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(MenuButton, {
        icon: "fas fa-list-ul fa-fw",
        title: "Title1",
        id: "Test-Menu",
        customMenu: React.createElement("div", {
          id: "Custom1"
        }, "Hello there."),
        initialItemIdx: 1,
        showTooltip: true
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const tooltip = container.querySelector(".tooltip");
    const dropdown = container.querySelector(".dropdown");
    const icon = container.querySelector(".icon");
    throw_if_not_true([() => tooltip !== null, () => dropdown !== null, () => icon !== null, () => icon.getAttribute("title") === "Title1", () => dropdown.childNodes.length === 1, () => dropdown.classList.contains("custom-menu")]);
    const customMenu = dropdown.childNodes[0];
    throw_if_not_true([() => customMenu !== null, () => customMenu.getAttribute("id") === "Custom1", () => customMenu.textContent === "Hello there."]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};