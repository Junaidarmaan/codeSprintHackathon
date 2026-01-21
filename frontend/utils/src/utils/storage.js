import { STORAGE_KEYS } from "../config/constants";

  export  const tokenStorage = {
  get() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  set(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  remove() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};
export default tokenStorage;