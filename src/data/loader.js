/*
#######################################################################
#
# Copyright (C) 2020-2025  David C. Harrison. All right reserved.
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

import mail from './mail.json';
import {v4 as uuidv4} from 'uuid';

/**
 * @param {object} date to be trimmed
 * @returns {string} ISO date with the seconds trimmed off
 */
function trimSeconds(date) {
  return new Date(date).toISOString().split('.')[0] +'Z';
}

/**
 * @returns {Date} half past six today
 */
function halfPastSixToday() {
  const date = new Date();
  date.setHours(6);
  date.setMinutes(30);
  return date;
}

/**
 * @returns {Date} seven fifeteen today
 */
function quarterPastFiveToday() {
  const date = new Date();
  date.setHours(17);
  date.setMinutes(15);
  return date;
}

/**
 * @returns {string} yesterday
 */
function yesterday() {
  const date = new Date();
  date.setDate(date.getDate()-1);
  return new Date(date);
}

/**
 * @returns {string} one month and two days ago
 */
function lastMonth() {
  const date = new Date();
  date.setMonth(date.getMonth()-1);
  date.setDate(date.getDate()-2);
  return new Date(date);
}

/**
 * @returns {string} one week ago
 */
function lastWeek() {
  const date = new Date();
  date.setDate(date.getDate()-7);
  return new Date(date);
}

/**
 * Load test data and adds some known emails
 */
function loader() {
  mail.find((box) => box.name == 'Inbox').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Bob Dylan', address: 'bob@bob.com'},
    subject: 'Like a Rolling Stone',
    received: trimSeconds(quarterPastFiveToday()),
    content: `Once upon a time you dressed so fine\n` +
      `You threw the bums a dime in your prime, didn’t you?\n` +
      `People’d call, say, “Beware doll, you’re bound to fall”\n` +
      `You thought they were all kiddin’ you\n` +
      `You used to laugh about\n` +
      `Everybody that was hangin’ out\n` +
      `Now you don’t talk so loud\n` +
      `Now you don’t seem so proud\n` +
      `About having to be scrounging for your next meal\n` +
      `\n` +
      `How does it feel\n` +
      `How does it feel\n` +
      `To be without a home\n` +
      `Like a complete unknown\n` +
      `Like a rolling stone?\n` +
      `\n` +
      `You’ve gone to the finest school all right, Miss Lonely\n` +
      `But you know you only used to get juiced in it\n` +
      `And nobody has ever taught you how to live on the street\n` +
      `And now you find out you’re gonna have to get used to it\n` +
      `You said you’d never compromise\n` +
      `With the mystery tramp, but now you realize\n` +
      `He’s not selling any alibis\n` +
      `As you stare into the vacuum of his eyes\n` +
      `And ask him do you want to make a deal?\n` +
      `\n` +
      `How does it feel\n` +
      `How does it feel\n` +
      `To be on your own\n` +
      `With no direction home\n` +
      `Like a complete unknown\n` +
      `Like a rolling stone?\n` +
      `\n` +
      `You never turned around to see the frowns on the jugglers ` +
      `and the clowns\n` +
      `When they all come down and did tricks for you\n` +
      `You never understood that it ain’t no good\n` +
      `You shouldn’t let other people get your kicks for you\n` +
      `You used to ride on the chrome horse with your diplomat\n` +
      `Who carried on his shoulder a Siamese cat\n` +
      `Ain’t it hard when you discover that\n` +
      `He really wasn’t where it’s at\n` +
      `After he took from you everything he could steal\n` +
      `\n` +
      `How does it feel\n` +
      `How does it feel\n` +
      `To be on your own\n` +
      `With no direction home\n` +
      `Like a complete unknown\n` +
      `Like a rolling stone?\n` +
      `\n` +
      `Princess on the steeple and all the pretty people\n` +
      `They’re drinkin’, thinkin’ that they got it made\n` +
      `Exchanging all kinds of precious gifts and things\n` +
      `But you’d better lift your diamond ring, you’d better ` +
      `pawn it babe\n` +
      `You used to be so amused\n` +
      `At Napoleon in rags and the language that he used\n` +
      `Go to him now, he calls you, you can’t refuse\n` +
      `When you got nothing, you got nothing to lose\n` +
      `You’re invisible now, you got no secrets to conceal\n` +
      `\n` +
      `How does it feel\n` +
      `How does it feel\n` +
      `To be on your own\n` +
      `With no direction home\n` +
      `Like a complete unknown\n` +
      `Like a rolling stone?\n` +
      `\n` +
      `Copyright © 1965 by Warner Bros. Inc.; renewed 1993 ` +
      `by Special Rider Music\n`,
  });

  mail.find((box) => box.name == 'Inbox').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Joni Mitchell', address: 'joni@joni.com'},
    subject: 'Both Sides Now',
    received: trimSeconds(halfPastSixToday()),
    content: `Rows and floes of angel hair\n` +
      `And ice cream castles in the air\n` +
      `And feather canyons everywhere\n` +
      `I've looked at clouds that way\n` +
      `\n` +
      `But now they only block the sun\n` +
      `They rain and snow on everyone\n` +
      `So many things I would have done\n` +
      `But clouds got in my way\n` +
      `\n` +
      `I've looked at clouds from both sides now\n` +
      `From up and down, and still somehow\n` +
      `It's cloud illusions I recall\n` +
      `I really don't know clouds at all\n` +
      `\n` +
      `Moons and Junes and Ferris wheels\n` +
      `The dizzy dancing way you feel\n` +
      `As every fairy tale comes real\n` +
      `I've looked at love that way\n` +
      `\n` +
      `But now it's just another show\n` +
      `You leave 'em laughing when you go\n` +
      `And if you care, don't let them know\n` +
      `Don't give yourself away\n` +
      `\n` +
      `I've looked at love from both sides now\n` +
      `From give and take, and still somehow\n` +
      `It's love's illusions I recall\n` +
      `I really don't know love at all\n` +
      `\n` +
      `Tears and fears and feeling proud\n` +
      `To say "I love you" right out loud\n` +
      `Dreams and schemes and circus crowds\n` +
      `I've looked at life that way\n` +
      `\n` +
      `But now old friends are acting strange\n` +
      `They shake their heads, they say I've changed\n` +
      `Well something's lost, but something's gained\n` +
      `In living every day\n` +
      `\n` +
      `I've looked at life from both sides now\n` +
      `From win and lose and still somehow\n` +
      `It's life's illusions I recall\n` +
      `I really don't know life at all\n` +
      `\n` +
      `I've looked at life from both sides now\n` +
      `From up and down and still somehow\n` +
      `It's life's illusions I recall\n` +
      `I really don't know life at all\n` +
      `\n` +
      `(C) June 19, 1967; Gandalf Publishing Co. (as "From Both Sides Now")`,
  });


  mail.find((box) => box.name == 'Inbox').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Lt. Dish', address: 'ltdish@mash4077.dod.gov'},
    subject: 'Meet me in the supply room',
    received: trimSeconds(yesterday()),
    mailbox: 'inbox',
    content: 'The V.I.P. Tent Will Be Ready As Soon As I Move My Animals Out',
  });

  mail.find((box) => box.name == 'Inbox').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Major Burns', address: 'majburns@mash4077.dod.gov'},
    subject: 'I remind you, Captain Pierce',
    received: trimSeconds(yesterday()),
    mailbox: 'inbox',
    content: 'American wounded first, allies second, enemy last',
  });

  mail.find((box) => box.name == 'Trash').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Cookie Monster', address: 'cookie@pbs.org'},
    subject: `I'd give you a cookie, but I ate it`,
    received: trimSeconds(lastMonth()),
    content: 'Om nom nom nom',
  });

  mail.find((box) => box.name == 'Trash').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Big Bird', address: 'bigbird@pbs.org'},
    subject: 'Have you seen my car keys??',
    received: trimSeconds(lastMonth()),
  });

  mail.find((box) => box.name == 'Important').mail.push({
    id: uuidv4(),
    to: {name: 'App User', address: 'user@app.com'},
    from: {name: 'Eric Cartman', address: 'eric@southpark.com'},
    subject: `I'm not fat, I'm big-boned`,
    received: trimSeconds(lastWeek()),
    content: `Anything that's fun costs at least eight dollars`,
  });
}

export default loader;
