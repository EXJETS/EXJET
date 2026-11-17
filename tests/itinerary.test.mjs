import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../lib/itinerary.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {itineraryError,tripText}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('itinerary prevents impossible dates, same-airport flights and reversed date order',()=>{
 const segment={from:'DAL',to:'TEB',date:'2026-11-12'};
 assert.equal(itineraryError([segment],2,'2026-10-22'),null);
 assert.match(itineraryError([{...segment,date:'2027-02-30'}],2,'2026-10-22'),/valid/);
 assert.match(itineraryError([{...segment,to:' dal '}],2,'2026-10-22'),/different/);
 assert.match(itineraryError([segment,{from:'TEB',to:'DAL',date:'2026-11-11'}],2,'2026-10-22'),/date order/);
 assert.match(itineraryError([segment],1.5,'2026-10-22'),/passengers/);
 assert.match(itineraryError([segment],101,'2026-10-22'),/passengers/);
 assert.match(itineraryError(Array(7).fill(segment),2,'2026-10-22'),/six/);
});
test('shared itinerary describes a request, never an assumed reservation',()=>{
 const text=tripText({segments:[{from:'DAL',to:'TEB',date:'2026-11-12'},{from:'TEB',to:'DAL',date:'2026-11-15'}],passengers:4});
 assert.match(text,/2\. TEB → DAL/);assert.match(text,/4 passengers/);assert.match(text,/Please advise/);assert.doesNotMatch(text,/confirmed|reserved/i);
});
