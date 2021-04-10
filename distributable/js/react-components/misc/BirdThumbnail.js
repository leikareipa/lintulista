"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { Bird } from "../../bird.js";
const placeholderThumbnailUrl = "./img/placeholder-bird-thumbnail.png";
const observedImages = new Set([placeholderThumbnailUrl]);
export function BirdThumbnail(props = {}) {
  BirdThumbnail.validate_props(props);
  observedImages.add(props.bird.nullThumbnailUrl);
  const thumbnailRef = React.createRef();
  const [thumbnailSrc, setThumbnailSrc] = React.useState(() => {
    if (props.useLazyLoading && !observedImages.has(props.bird.thumbnailUrl)) {
      return placeholderThumbnailUrl;
    } else {
      return props.bird.thumbnailUrl;
    }
  });
  const [intersectionObserver] = React.useState(() => {
    if (!props.useLazyLoading) {
      return null;
    } else {
      return new IntersectionObserver(([element]) => {
        if (element.isIntersecting) {
          setThumbnailSrc(props.bird.thumbnailUrl);
          intersectionObserver.disconnect();
        }
      });
    }
  });
  React.useEffect(() => {
    if (thumbnailSrc === props.bird.thumbnailUrl) {
      mark_thumbnail_observed();
    }
  });
  React.useEffect(() => {
    if (props.useLazyLoading) {
      const isInView = (() => {
        const viewHeight = window.innerHeight;
        const containerRect = thumbnailRef.current.getBoundingClientRect();
        return Boolean(containerRect.top > -containerRect.height && containerRect.top < viewHeight);
      })();

      if (isInView) {
        mark_thumbnail_observed();
        thumbnailRef.current.setAttribute("src", props.bird.thumbnailUrl);
      } else if (intersectionObserver) {
        intersectionObserver.observe(thumbnailRef.current);
        return () => {
          intersectionObserver.disconnect();
        };
      }
    }
  }, [thumbnailRef.current]);
  return React.createElement("img", {
    className: "BirdThumbnail",
    referrerPolicy: "no-referrer",
    draggable: false,
    src: thumbnailSrc,
    ref: thumbnailRef
  });

  function mark_thumbnail_observed() {
    observedImages.add(props.bird.thumbnailUrl);
  }
}
BirdThumbnail.defaultProps = {
  useLazyLoading: true
};

BirdThumbnail.validate_props = function (props) {
  panic_if_not_type("object", props, props.bird);
  return;
};

BirdThumbnail.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    const bird = Bird({
      species: "Test1",
      family: "",
      order: "",
      thumbnailUrl: "nonexistent-test-image.png"
    });
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(BirdThumbnail, {
        bird,
        useLazyLoading: false
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.childNodes.length === 1]);
    const thumbnailElement = container.childNodes[0];
    throw_if_not_true([() => thumbnailElement.tagName.toLowerCase() === "img", () => thumbnailElement.getAttribute("src") === "nonexistent-test-image.png", () => thumbnailElement.getAttribute("referrerpolicy") === "no-referrer"]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};