"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require("puppeteer");
const url = require("url");
const path = require("path");
const multislice = require("multislice-string");
const fileFromUrl = function (file_url) {
    return path.basename(url.parse(file_url).pathname);
};
const codeShaking = function (url, files) {
    return __awaiter(this, void 0, void 0, function* () {
        let shaked_code = null;
        if (files.constructor === String) {
            shaked_code = "";
        }
        else if (files.constructor === Array) {
            shaked_code = [];
        }
        const browser = yield puppeteer.launch();
        const page = yield browser.newPage();
        yield Promise.all([
            page.coverage.startJSCoverage(),
            page.coverage.startCSSCoverage()
        ]);
        yield page.goto(url);
        const [JS_COVERAGE, CSS_COVERAGE] = yield Promise.all([
            page.coverage.stopCSSCoverage(),
            page.coverage.stopJSCoverage()
        ]);
        const COVERAGES = JS_COVERAGE.concat(CSS_COVERAGE);
        for (let coverage of COVERAGES) {
            const FILE = fileFromUrl(coverage["url"]);
            if (files.constructor === String) {
                if (FILE === files) {
                    shaked_code = multislice(coverage.text, coverage.ranges);
                }
            }
            else if (files.constructor === Array) {
                for (let file of files) {
                    if (FILE === file) {
                        shaked_code.push(multislice(coverage.text, coverage.ranges));
                    }
                    break;
                }
            }
        }
        yield browser.close();
        return shaked_code;
    });
};
module.exports = codeShaking;
