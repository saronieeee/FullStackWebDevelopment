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
import {expect} from 'vitest';
import pixelmatch from 'pixelmatch';
import { createReadStream, writeFileSync, exsistsSync, unlinkSync, existsSync } from 'fs';
import { type } from 'os';
import { PNG } from 'pngjs';

export default async function compare(page, name) {
  await page.screenshot({path: `${process.cwd()}/${name}.png`});
  return new Promise((resolve, reject) => {
    const received = createReadStream(`${process.cwd()}/${name}.png`).pipe(new PNG()).on('parsed', doneReading);
    const expected = createReadStream(`${process.cwd()}/shots/${type}/${name}.png`).pipe(new PNG()).on('parsed', doneReading);

    let filesRead = 0;
    function doneReading() {
      if (++filesRead < 2) return;

      const diff = new PNG({width: expected.width, height: expected.height});
      const numDiffPixels = pixelmatch(
          expected.data, received.data, diff.data, expected.width, expected.height,
          {threshold: 0.1});

      const dfname = `${name}-diff.png`;

      if (numDiffPixels > 0) {
        writeFileSync(dfname, PNG.sync.write(diff));
      } else if (existsSync(dfname)) {
        unlinkSync(dfname);
      }
      unlinkSync(`${name}.png`);

      expect(numDiffPixels).toEqual(0);
      resolve();
    }
  });
}
