export const apiRoot =
    process.env.API_ROOT ||
    (!process.env.NODE_ENV || process.env.NODE_ENV === "production"
        ? window.location.origin
        : process.env.NODE_ENV === "development" &&
          window.location.origin + "/api");
export const webRoot =
    process.env.WEB_ROOT ||
    (!process.env.NODE_ENV || process.env.NODE_ENV === "production"
        ? window.location.origin
        : "http://localhost:1234");
