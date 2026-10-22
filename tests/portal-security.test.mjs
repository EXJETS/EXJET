import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { safeReturnPath } from '../lib/portal/config.ts';
import { airportField, dateField, passengerField } from '../lib/portal/validation.ts';

const alice='11111111-1111-4111-8111-111111111111';
const bob='22222222-2222-4222-8222-222222222222';
const staff='33333333-3333-4333-8333-333333333333';

test('return targets cannot leave the application',()=>{
 for(const value of ['https://evil.test','//evil.test','/app/../outside','/app/\\evil','/app/?next=https://evil.test',null]) assert.equal(safeReturnPath(value),'/app/');
 assert.equal(safeReturnPath('/app/trips/'),'/app/trips/');
});
test('trip inputs reject impossible dates and malformed airport/passenger values',()=>{
 const form=new FormData();form.set('departure','kdal');form.set('departure_date','2026-02-30');form.set('passengers','2.5');
 assert.equal(airportField(form,'departure'),'KDAL');assert.throws(()=>dateField(form,'departure_date'));assert.throws(()=>passengerField(form));
 form.set('departure','<svg>');assert.throws(()=>airportField(form,'departure'));
 form.set('departure_date','2026-10-22');form.set('passengers','8');assert.equal(dateField(form,'departure_date'),'2026-10-22');assert.equal(passengerField(form),8);
});
test('database enforces ownership, staff boundaries and read-only confirmed bookings',async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); grant usage on schema public,auth to anon,authenticated,service_role; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; insert into auth.users values ('${alice}'),('${bob}'),('${staff}');`);
 await db.exec(await fs.readFile(new URL('../supabase/migrations/20261022051248_client_workspace.sql',import.meta.url),'utf8'));
 await db.exec(`insert into public.portal_staff(user_id) values('${staff}'); insert into public.portal_confirmed_trips(user_id,reference,departure,arrival,departure_at,status) values('${alice}','QA-ONLY','KDAL','KTEB',now(),'scheduled');`);
 const asUser=async(id)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
 await asUser(alice);
 await db.query('insert into portal_profiles(user_id,full_name,company,travel_role) values($1,$2,$3,$4) on conflict(user_id) do update set user_id=excluded.user_id,full_name=excluded.full_name,company=excluded.company,travel_role=excluded.travel_role',[alice,'Alice Test','','traveler']);
 await db.query('insert into portal_profiles(user_id,full_name,company,travel_role) values($1,$2,$3,$4) on conflict(user_id) do update set user_id=excluded.user_id,full_name=excluded.full_name,company=excluded.company,travel_role=excluded.travel_role',[alice,'Alice Updated','','executive_assistant']);
 await db.query('insert into portal_locations(user_id,airport_code,label) values($1,$2,$3) on conflict(user_id,airport_code) do update set user_id=excluded.user_id,airport_code=excluded.airport_code,label=excluded.label',[alice,'KDAL','Dallas']);
 await db.query('insert into portal_trip_drafts(user_id,departure,arrival,departure_date,passengers) values($1,$2,$3,$4,$5)',[alice,'KDAL','KTEB','2026-11-01',2]);
 await db.query('insert into portal_messages(user_id,direction,body) values($1,$2,$3)',[alice,'customer','Test planning message']);
 assert.equal((await db.query('select * from portal_confirmed_trips')).rows.length,1);
 await assert.rejects(db.query('update portal_profiles set user_id=$1 where user_id=$2',[bob,alice]));
 await assert.rejects(db.query('insert into portal_staff(user_id) values($1)',[alice]));
 await assert.rejects(db.query("update portal_confirmed_trips set status='completed'"));
 await assert.rejects(db.query('insert into portal_messages(user_id,direction,body) values($1,$2,$3)',[alice,'advisor','Forged advisor message']));
 await asUser(bob);
 for(const table of ['portal_profiles','portal_locations','portal_trip_drafts','portal_confirmed_trips','portal_messages','portal_staff']) assert.equal((await db.query(`select * from ${table}`)).rows.length,0,`${table}: other client's data leaked`);
 await assert.rejects(db.query('insert into portal_messages(user_id,direction,body) values($1,$2,$3)',[alice,'customer','Wrong owner']));
 await assert.rejects(db.query('insert into portal_trip_drafts(user_id,departure,arrival,departure_date,passengers) values($1,$2,$3,$4,$5)',[alice,'KDAL','KTEB','2026-11-01',2]));
 assert.equal((await db.query('delete from portal_locations where user_id=$1 returning id',[alice])).rows.length,0);
 await asUser(staff);
 assert.equal((await db.query('select * from portal_messages')).rows.length,1);
 await db.query('insert into portal_messages(user_id,direction,body) values($1,$2,$3)',[alice,'advisor','Test staff reply']);
 await asUser(alice);assert.equal((await db.query('select * from portal_messages')).rows.length,2);
 await db.exec('reset role; set role anon');await assert.rejects(db.query('select * from portal_messages'));
 } finally {await db.close();}
});
