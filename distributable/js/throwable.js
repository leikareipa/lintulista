"use strict";

const errorId = "lintulista-throwable";
export function public_error(message = "") {
  return {
    id: errorId,
    isPrivate: false,
    message: message || "Unknown error."
  };
}
export function private_error(message = "") {
  return {
    id: errorId,
    isPrivate: true,
    message: message || "Unknown error."
  };
}
export function is_public_ll_error(error) {
  return typeof error === "object" && error.hasOwnProperty("id") && error.hasOwnProperty("isPrivate") && error.id === errorId && error.isPrivate === false;
}