var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
var githubContributions = {
    name: 'github-contributions-proxy',
    configureServer: function (server) {
        var _this = this;
        server.middlewares.use('/api/github/contributions', function (request, response) { return __awaiter(_this, void 0, void 0, function () {
            var username, upstream, markup, days, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        username = new URL(request.url || '', 'http://localhost').searchParams.get('username') || '';
                        if (request.method !== 'GET' || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
                            response.statusCode = 400;
                            response.end(JSON.stringify({ error: 'A valid GitHub username is required' }));
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://github.com/users/".concat(encodeURIComponent(username), "/contributions"), { headers: { accept: 'text/html', 'user-agent': 'portfolio-contribution-dashboard/1.0' } })];
                    case 2:
                        upstream = _b.sent();
                        return [4 /*yield*/, upstream.text()];
                    case 3:
                        markup = _b.sent();
                        days = (markup.match(/<td\b[^>]*>/g) || []).flatMap(function (tag) { var _a, _b; var date = (_a = /data-date="([^"]+)"/.exec(tag)) === null || _a === void 0 ? void 0 : _a[1]; var level = (_b = /data-level="(\d+)"/.exec(tag)) === null || _b === void 0 ? void 0 : _b[1]; return date && level ? [{ date: date, count: Number(level) }] : []; });
                        response.statusCode = upstream.ok ? 200 : upstream.status;
                        response.setHeader('content-type', 'application/json; charset=utf-8');
                        response.end(JSON.stringify(upstream.ok ? { days: days, updatedAt: new Date().toISOString() } : { error: 'GitHub contribution data is unavailable' }));
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        response.statusCode = 502;
                        response.end(JSON.stringify({ error: 'GitHub contribution data is temporarily unavailable' }));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    },
};
export default defineConfig({ plugins: [react(), githubContributions], server: { proxy: { '/api/leetcode': { target: 'https://leetcode.com', changeOrigin: true, rewrite: function (path) { return path.replace(/^\/api\/leetcode/, ''); } } } } });
