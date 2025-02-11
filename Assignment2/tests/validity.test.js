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
# DO NOT MODIFY THIS FILE
#######################################################################
*/

import {it, expect} from 'vitest';

import fs from 'fs';
import {readdir} from 'node:fs/promises';
import strip from 'strip-comments';

/*
 * Should be using Context to share state between Components.
 */
it('Does not set innerHTML on DOM elements', async () => {
  const files = await readdir('src', {recursive: true});
  let cnt = 0;
  for (const file of files) {
    if ((!file.startsWith(`tests`)) &&
        ((file.endsWith(`.jsx`) || file.endsWith(`.js`)))) {
      const data = fs.readFileSync(`src/${file}`, {encoding: 'utf8'});
      const src = strip(data).replace(/(\r\n|\n|\r)/gm, '');
      if (src.includes('innerHtml')) {
        cnt++;
      }
    }
  }
  expect(cnt).toBe(0);
});
