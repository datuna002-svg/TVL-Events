// ─── Server ────────────────────────────────────────────────────────────────
export const GUILD_ID = '1494381969709203558';

// ─── Permissions ────────────────────────────────────────────────────────────
/** Only this role may run any command */
export const STAFF_ROLE_ID = '1494668034152071268';

// ─── Channels ────────────────────────────────────────────────────────────────
/** All stanrole / eventrole / customrole commands must be run here */
export const LOG_CHANNEL_ID = '1520792030572314644';

/** /eventsping sends a ping to this channel */
export const EVENTS_PING_CHANNEL_ID = '1512940176756703242';
/** Role pinged by /eventsping */
export const EVENTS_PING_ROLE_ID = '1503062253669322803';

/** /giveawayping sends a ping to this channel */
export const GIVEAWAY_PING_CHANNEL_ID = '1512940200379154652';
/** Role pinged by /giveawayping */
export const GIVEAWAY_PING_ROLE_ID = '1503062570267840643';

// ─── Stan Roles ──────────────────────────────────────────────────────────────
export const STAN_ROLE_IDS: readonly string[] = [
  '1511695857672650853',
  '1515460299174576268',
  '1502595183618031646',
  '1511696288360435866',
  '1502595746132791397',
  '1502595037295542382',
  '1513520346295439430',
  '1494667762507841556',
  '1502596482887585832',
  '1507696309027471361',
  '1498338118158254242',
  '1502595101585834104',
  '1502595231869308938',
  '1498339382841708624',
  '1498339257037885602',
  '1498339124254474300',
  '1502595858636734474',
  '1502595805738172526',
  '1516861401514115152',
  '1511697655930159265',
  '1494667153843028009',
  '1507690072110137464',
  '1507690274862792814',
];

export const STAN_ROLE_ID_SET = new Set(STAN_ROLE_IDS);

// ─── Event Winner Roles ───────────────────────────────────────────────────────
export const EVENT_WINNER_ROLE_IDS: readonly string[] = [
  '1494668238968062053',
  '1511670629609246740',
  '1511670656289476648',
  '1511670693044027424',
  '1511670714653216788',
  '1511670748635201567',
  '1511670774832955412',
  '1511670883255848960',
  '1507690432862224425',
  '1507690133795770419',
  '1498339519265509537',
];

export const EVENT_WINNER_ROLE_ID_SET = new Set(EVENT_WINNER_ROLE_IDS);
