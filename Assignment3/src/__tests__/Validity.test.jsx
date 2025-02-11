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

import fs from 'fs';
import {readdir} from 'node:fs/promises';
import strip from 'strip-comments';

import {it, test, expect} from 'vitest';
import Entry from '../Entry';
import Picker from '../Picker';

/**
 * @param {*} component to confirm is a class
 * @returns {boolean} true if component is a class, false otherwise
 */
function isClassComponent(component) {
  let isClass = false;
  try {
    component();
  } catch (e) {
    isClass = e != undefined;
  }
  return isClass;
}

const contains = async (text, trim = false) => {
  let cnt = 0;
  const files = await readdir('src', {recursive: true});
  for (const file of files) {
    if ((!file.startsWith(`__tests__`)) &&
        (!file.startsWith(`main.jsx`)) &&
        ((file.endsWith(`.jsx`) || file.endsWith(`.js`)))) {
      const data = fs.readFileSync(`src/${file}`, {encoding: 'utf8'});
      let src = strip(data).replace(/(\r\n|\n|\r)/gm, '');
      if (trim) {
        src = src.replaceAll(' ', '');
      }
      if (src.includes(text)) {
        cnt++;
      }
    }
  }
  return cnt;
};

const testing = async (text) => {
  let cnt = 0;
  const files = await readdir('src/__tests__', {recursive: true});
  for (const file of files) {
    if (!file.startsWith(`Validity.test`)) {
      const data = fs.readFileSync(`src/__tests__/${file}`, {encoding: 'utf8'});
      const src = strip(data).replace(/(\r\n|\n|\r)/gm, '');
      if (src.includes(text)) {
        cnt++;
      }
    }
  }
  return cnt;
};

test('Picker is React.Component Sub Class', async () => {
  expect(isClassComponent(Picker)).toBe(true);
});
test('Picker extends React.Component', async () => {
  expect(await contains('class Picker extends React.Component')).toBe(1);
});

test('Entry is React.Component Sub Class', async () => {
  expect(isClassComponent(Entry)).toBe(true);
});
test('Entry extends React.Component', async () => {
  expect(await contains('class Entry extends React.Component')).toBe(1);
});

it('Uses this.setState()', async () => {
  expect(await contains('this.setState')).toBeGreaterThan(0);
});
it('Uses this.state', async () => {
  expect(await contains('this.state')).toBeGreaterThan(0);
});
it('Does not use React Context', async () => {
  expect(await contains('useContext')).toBe(0);
});

it('Does not use getElementById', async () => {
  expect(await contains('getElementById')).toBe(0);
});
it('Does not use data-testid', async () => {
  expect(await contains('data-testid')).toBe(0);
});
it('Does not use element ids', async () => {
  expect(await contains('id=', true)).toBe(0);
});
it('Does not use <input type="date">', async () => {
  expect(await contains(`type="date"`, true)).toBe(0);
});
// Case sensitive because <Table> is a React compoinent, not an HTML element
it('Does not use table elements', async () => {
  expect(await contains('<table>', true)).toBe(0);
});

it('Tests with ByLabelText', async () => {
  expect(await testing('ByLabelText')).toBeGreaterThan(0);
});
it('Does not test with ByTestId', async () => {
  expect(await testing('ByTestId')).toBe(0);
});
