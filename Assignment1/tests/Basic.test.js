/*
 * Copyright (C) 2024-2025 David C. Harrison. All right reserved.
 *
 * You may not use, distribute, publish, or modify this code without
 * the express written permission of the copyright holder.
 */
/*
 * *****************************************************
 *              DO NOT MODIFY THIS FILE
 * *****************************************************
 */
import { launch } from 'puppeteer';
import { beforeAll, afterAll, beforeEach, afterEach, test } from 'vitest';
import { copyFileSync, unlinkSync } from 'fs';
import replace from "replace";

import compare from './screenshots';

let browser;
let page;

/**
 * Setup for basic tests
 */
beforeAll(async () => {
  copyFileSync("src/index.html", "src/basic.html"); 
  replace({
    regex: '<head>(?:.|\n|\r)+?<\/head>',
    replacement: `<head> <link href="basic.css" rel="stylesheet" /></head`,
    paths: ['src/basic.html'],
    silent: true,
  });
});

/**
 * Tear down
 */
afterAll(async () => {
  unlinkSync('src/basic.html');
});

/**
 * Create a headless (not visible) instance of Chrome for each test
 * and open a new page (tab).
 */
beforeEach(async () => {
  browser = await launch({
    headless: true,
    // slowMo: 100,
  });
  page = await browser.newPage();
  return page.setViewport({width: 800, height: 600});
});

/**
 * Close the headless instance of Chrome as we no longer need it.
 */
afterEach(async () => {
  await browser.close();
});

/**
 * Static rendering must match known screenshot
 */
test('static', async () => {
  await page.goto('file://' + process.cwd() + '/src/basic.html');
  await compare(page, 'basic-static');
});
