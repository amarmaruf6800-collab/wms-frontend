export function isAdmin(user) {
    return user?.role?.toUpperCase() === "ADMIN";
}