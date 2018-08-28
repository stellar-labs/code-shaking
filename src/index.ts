import * as puppeteer from "puppeteer";
import * as url from "url";
import * as path from "path";
import * as multislice from "multislice-string";

const fileFromUrl = function(file_url) {
	return path.basename(url.parse(file_url).pathname);
};

const codeShaking = async function(url, files) {
	let shaked_code = null;

	if (files.constructor === String) {
		shaked_code = "";
	} else if (files.constructor === Array) {
		shaked_code = [];
	}

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await Promise.all([
		page.coverage.startJSCoverage(),
		page.coverage.startCSSCoverage()
	]);
	await page.goto(url);
	const [JS_COVERAGE, CSS_COVERAGE] = await Promise.all([
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
		} else if (files.constructor === Array) {
			for (let file of files) {
				if (FILE === file) {
					shaked_code.push(
						multislice(coverage.text, coverage.ranges)
					);
				}

				break;
			}
		}
	}

	await browser.close();

	return shaked_code;
};

export = codeShaking;
