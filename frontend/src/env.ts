export const apiRoot =
    process.env.API_ROOT ||
    process.env.NODE_ENV === "production" ||
    !process.env.NODE_ENV
        ? window.location.origin
        : "http://localhost:3000";
export const webRoot =
    process.env.WEB_ROOT ||
    process.env.NODE_ENV === "production" ||
    !process.env.NODE_ENV
        ? window.location.origin
        : "http://localhost:1234";
