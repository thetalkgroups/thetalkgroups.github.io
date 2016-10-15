import { UserService } from "./user-service"

export const clearItemsFromCahce = () => Object.keys(localStorage)
    .filter(k => k.startsWith("/group"))
    .forEach(k => localStorage.removeItem(k));

export const userService = new UserService()