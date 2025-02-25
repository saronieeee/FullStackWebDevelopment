/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#######               DO NOT MODIFY THIS FILE               ###########
#######################################################################
*/

import {test, beforeAll, afterAll, beforeEach, afterEach, expect} from 'vitest';
import puppeteer from 'puppeteer';
import path from 'path';
import express from 'express';
import http from 'http';

import 'dotenv/config';
import app from '../../backend/src/app.js';

let backend;
let frontend;
let browser;
let page;

beforeAll(() => {
  backend = http.createServer(app);
  backend.listen(3010, () => {
    console.log('Backend Running at http://localhost:3010');
  });
  frontend = http.createServer(
      express()
          .use('/assets', express.static(
              path.join(__dirname, '..', '..', 'frontend', 'dist', 'assets')))
          .get('*', function(req, res) {
            res.sendFile('index.html',
                {root: path.join(__dirname, '..', '..', 'frontend', 'dist')});
          }),
  );
  frontend.listen(3000, () => {
    console.log('Frontend Running at http://localhost:3000');
  });
});

afterAll(async () => {
  await backend.close();
  await frontend.close();
  setImmediate(function() {
    frontend.emit('close');
  });
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    /*
     * Use these two settings instead of the one above if you want to see the
     * browser. However, in the grading system e2e test run headless, so make
     * sure they work that way before submitting.
     */
    // headless: false,
    // slowMo: 100,
  });
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  const childProcess = browser.process();
  if (childProcess) {
    await childProcess.kill(9);
  }
});

test('Initial View', async () => {
  const label = await page.waitForSelector(
      '::-p-text(CSE186 Full Stack Mail - Inbox)');
  expect(label).not.toBeNull();
  label.dispose();
});

const click = async (selector) => {
  const clickable = await page.waitForSelector(selector);
  await clickable.click();
  clickable.dispose();
};

test('Trash Selection', async () => {
  await click('::-p-text(Trash)');
  const label = await page.waitForSelector(
      '::-p-text(CSE186 Full Stack Mail - Trash)');
  expect(label).not.toBeNull();
  label.dispose();
});

test('Sent Selection', async () => {
  await click('::-p-text(Sent)');
  const label = await page.waitForSelector(
      '::-p-text(CSE186 Full Stack Mail - Sent)');
  expect(label).not.toBeNull();
  label.dispose();
});

const mailExists = async (sender, subject, date) => {
  const senderElem = await page.waitForSelector(
      `::-p-text(${sender})`);
  const subjectElem = await page.waitForSelector(
      `::-p-text(${subject})`);
  const dateElem = await page.waitForSelector(
      `::-p-text(${date})`);
  expect(senderElem !== null && subjectElem !== null && dateElem !== null);
  senderElem.dispose();
  subjectElem.dispose();
  dateElem.dispose();
};

test('First Inbox Mail', async () => {
  await mailExists(
      'Bari Guiden',
      'Inverse 24/7 intranet',
      'Jun 27');
});

test('Seventh Sent Mail', async () => {
  await click('::-p-text(Sent)');
  await mailExists(
      'Phillip Warstall',
      'Open-architected didactic knowledge user',
      'Apr 11');
});

test('Third Trash Mail', async () => {
  await click('::-p-text(Trash)');
  await mailExists(
      'Kynthia Perview to CSE186 Student',
      'Up-sized solution-oriented task-force',
      'Mar 25');
});

test('Delete Third Inbox Mail', async () => {
  await mailExists(
      'Berta Bubb',
      'Implemented full-range functionalities',
      'May 03');
  await click('::-p-aria(Delete mail from Berta Bubb received May 03)');
  await click('::-p-text(Trash)');
  await mailExists(
      'Berta Bubb to CSE186 Student',
      'Implemented full-range functionalities',
      'May 03');
});

test('Delete Third Sent Mail', async () => {
  await click('::-p-text(Sent)');
  await mailExists(
      'Kipper Josse',
      'Decentralized empowering benchmark',
      'Jul 03');
  await click('::-p-aria(Delete mail to Kipper Josse sent Jul 03)');
  await click('::-p-text(Trash)');
  await mailExists(
      'CSE186 Student to Kipper Josse',
      'Decentralized empowering benchmark',
      'Jul 03');
});
