import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile('lib/booking-config.ts','utf8');
const key = source.match(/SUPABASE_PUBLIC_KEY = '([^']+)'/)[1];
const base = source.match(/SUPABASE_URL = '([^']+)'/)[1] + '/functions/v1/omar-booking';
const response = await fetch(base,{headers:{apikey:key}});
const data = await response.json();
assert.equal(response.status,200,JSON.stringify(data));
assert.equal(data.durationMinutes,45);
assert.equal(data.timezone,'Africa/Cairo');
assert.ok(data.slots.length > 0);
assert.equal(new Set(data.slots.map(s=>s.scheduled_at)).size,data.slots.length);
for(const slot of data.slots){assert.match(slot.local_time,/^\d{2}:00$/);assert.ok(new Date(slot.scheduled_at)>new Date());assert.deepEqual(Object.keys(slot).sort(),['local_date','local_time','scheduled_at']);}
const admin = await fetch(base+'/admin',{headers:{apikey:key}});
assert.equal(admin.status,401,'Anonymous visitor accessed admin');
const noKey = await fetch(base);assert.equal(noKey.status,401,'API key boundary missing');
const invalid = await fetch(base,{method:'POST',headers:{apikey:key},body:new FormData()});
assert.equal(invalid.status,400,'Invalid submission accepted');
console.log(`Verified live API: ${data.slots.length} hourly slots, 45-minute sessions, admin protection, invalid-submission rejection.`);
