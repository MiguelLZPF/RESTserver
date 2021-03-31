"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRoutes = exports.applyMiddleware = void 0;
const applyMiddleware = (middlewareWrappers, router) => {
    for (const wrapper of middlewareWrappers) {
        wrapper(router);
    }
};
exports.applyMiddleware = applyMiddleware;
const applyRoutes = (routes, router) => {
    for (const route of routes) {
        const { method, path, handler } = route;
        router[method](path, handler);
    }
};
exports.applyRoutes = applyRoutes;
//# sourceMappingURL=index.js.map