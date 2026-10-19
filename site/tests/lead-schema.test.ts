import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLead } from '../lib/lead-schema.ts';
const lead = { requestId:'528701d9-361f-4efa-922d-caf4fca614a9',place:'Pruszków, test',mealType:'hot_soup',people:10,contact:'qa@example.com',name:'Test',notes:'',locale:'pl',consent:true };
test('accepts phone and email contacts, including short valid addresses',()=>{
  for(const contact of ['qa@example.com','a@b.co','+48 500 123 456']) assert.equal(validateLead({...lead,contact}).ok,true);
});
test('rejects malformed, oversized and out-of-range input',()=>{
  for(const change of [{people:0},{people:1.5},{people:1001},{people:'10'},{mealType:'other'},{contact:'not-a-contact'},{consent:false},{place:'x'},{notes:'x'.repeat(1501)},{website:'spam'},{requestId:'invalid'},{locale:'xx'}]) assert.equal(validateLead({...lead,...change}).ok,false);
});
test('normalizes whitespace without dropping legitimate notes',()=>{
  const result=validateLead({...lead,place:'  Pruszków, test  ',notes:'one\r\ntwo'});
  assert.equal(result.ok,true);
  if(result.ok) { assert.equal(result.value.place,'Pruszków, test'); assert.equal(result.value.notes,'one\ntwo'); }
});
test('rejects non-object payloads',()=>{for(const value of [null,[],0,'text']) assert.equal(validateLead(value).ok,false);});
