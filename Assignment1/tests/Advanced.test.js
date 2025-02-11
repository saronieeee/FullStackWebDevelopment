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
 * Setup for advanced tests
 */
beforeAll(async () => {
  copyFileSync("src/index.html", "src/advanced.html"); 
  replace({
    regex: '<head>(?:.|\n|\r)+?<\/head>',
    replacement: `<head> <link href="advanced.css" rel="stylesheet" /></head`,
    paths: ['src/advanced.html'],
    silent: true,
  });
});

/**
 * Tear down
 */
afterAll(async () => {
  unlinkSync('src/advanced.html')
});

/**
 * Create a headless (not visible) instance of Chrome for each test
 * and open a new page (tab).
 */
beforeEach(async () => {
  browser = await launch({
    headless: true,
    // headless: false,
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
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await compare(page, 'advanced-static');
});

/**
 * Letter C Hover
 */
test('letter C hover', async () => {
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await page.hover("text/C");
  await compare(page, 'advanced-letter-C-hover');
});

/**
 * Letter S Hover
 */
test('letter S hover', async () => {
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await page.hover("text/S");
  await compare(page, 'advanced-letter-S-hover');
});

/**
 * Letter E Hover
 */
test('letter E hover', async () => {
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await page.hover("text/E");
  await compare(page, 'advanced-letter-E-hover');
});

/**
 * Number 1 Hover
 */
test('number 1 hover', async () => {
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await page.hover("text/1");
  await compare(page, 'advanced-number-1-hover');
});

/**
 * Number 8 Hover
 */
test('number 8 hover', async () => {
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await page.hover("text/8");
  await compare(page, 'advanced-number-8-hover');
})

/**
 * Number 6 Hover
 */
test('number 6 hover', async () => {
  await page.goto('file://' + process.cwd() + '/src/advanced.html');
  await page.hover("text/6");
  await compare(page, 'advanced-number-6-hover');
})
