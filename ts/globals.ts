import { UserService } from "./user-service"

export const clearItemsFromCahce = () => Object.keys(localStorage)
    .filter(k => k.startsWith("/item"))
    .forEach(k => localStorage.removeItem(k));

export const userService = new UserService();

export const isParentOf = (target: HTMLElement, selector: string): boolean => {
    if (target.nodeName === "HTML") return false;

    if (target.matches(selector)) return true;

    return isParentOf(target.parentNode as HTMLElement, selector);
};