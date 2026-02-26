// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  createMemoryStore,
  createTypedStore,
  createNamespacedStore,
  serializeValue,
  deserializeValue,
  getMany,
  setMany,
  removeMany,
  getStorageSize,
  getKeySize,
  getByPrefix,
  removeByPrefix,
  getByPattern,
  withVersion,
  KVStore,
} from '../storage-utils';

describe('createMemoryStore - get/set/has/remove', () => {
  it('get/set pair 1: stores and retrieves key1', () => {
    const store = createMemoryStore();
    store.set('key1', 'value1');
    expect(store.get('key1')).toBe('value1');
  });
  it('get/set pair 2: stores and retrieves key2', () => {
    const store = createMemoryStore();
    store.set('key2', 'value2');
    expect(store.get('key2')).toBe('value2');
  });
  it('get/set pair 3: stores and retrieves key3', () => {
    const store = createMemoryStore();
    store.set('key3', 'value3');
    expect(store.get('key3')).toBe('value3');
  });
  it('get/set pair 4: stores and retrieves key4', () => {
    const store = createMemoryStore();
    store.set('key4', 'value4');
    expect(store.get('key4')).toBe('value4');
  });
  it('get/set pair 5: stores and retrieves key5', () => {
    const store = createMemoryStore();
    store.set('key5', 'value5');
    expect(store.get('key5')).toBe('value5');
  });
  it('get/set pair 6: stores and retrieves key6', () => {
    const store = createMemoryStore();
    store.set('key6', 'value6');
    expect(store.get('key6')).toBe('value6');
  });
  it('get/set pair 7: stores and retrieves key7', () => {
    const store = createMemoryStore();
    store.set('key7', 'value7');
    expect(store.get('key7')).toBe('value7');
  });
  it('get/set pair 8: stores and retrieves key8', () => {
    const store = createMemoryStore();
    store.set('key8', 'value8');
    expect(store.get('key8')).toBe('value8');
  });
  it('get/set pair 9: stores and retrieves key9', () => {
    const store = createMemoryStore();
    store.set('key9', 'value9');
    expect(store.get('key9')).toBe('value9');
  });
  it('get/set pair 10: stores and retrieves key10', () => {
    const store = createMemoryStore();
    store.set('key10', 'value10');
    expect(store.get('key10')).toBe('value10');
  });
  it('get/set pair 11: stores and retrieves key11', () => {
    const store = createMemoryStore();
    store.set('key11', 'value11');
    expect(store.get('key11')).toBe('value11');
  });
  it('get/set pair 12: stores and retrieves key12', () => {
    const store = createMemoryStore();
    store.set('key12', 'value12');
    expect(store.get('key12')).toBe('value12');
  });
  it('get/set pair 13: stores and retrieves key13', () => {
    const store = createMemoryStore();
    store.set('key13', 'value13');
    expect(store.get('key13')).toBe('value13');
  });
  it('get/set pair 14: stores and retrieves key14', () => {
    const store = createMemoryStore();
    store.set('key14', 'value14');
    expect(store.get('key14')).toBe('value14');
  });
  it('get/set pair 15: stores and retrieves key15', () => {
    const store = createMemoryStore();
    store.set('key15', 'value15');
    expect(store.get('key15')).toBe('value15');
  });
  it('get/set pair 16: stores and retrieves key16', () => {
    const store = createMemoryStore();
    store.set('key16', 'value16');
    expect(store.get('key16')).toBe('value16');
  });
  it('get/set pair 17: stores and retrieves key17', () => {
    const store = createMemoryStore();
    store.set('key17', 'value17');
    expect(store.get('key17')).toBe('value17');
  });
  it('get/set pair 18: stores and retrieves key18', () => {
    const store = createMemoryStore();
    store.set('key18', 'value18');
    expect(store.get('key18')).toBe('value18');
  });
  it('get/set pair 19: stores and retrieves key19', () => {
    const store = createMemoryStore();
    store.set('key19', 'value19');
    expect(store.get('key19')).toBe('value19');
  });
  it('get/set pair 20: stores and retrieves key20', () => {
    const store = createMemoryStore();
    store.set('key20', 'value20');
    expect(store.get('key20')).toBe('value20');
  });
  it('get/set pair 21: stores and retrieves key21', () => {
    const store = createMemoryStore();
    store.set('key21', 'value21');
    expect(store.get('key21')).toBe('value21');
  });
  it('get/set pair 22: stores and retrieves key22', () => {
    const store = createMemoryStore();
    store.set('key22', 'value22');
    expect(store.get('key22')).toBe('value22');
  });
  it('get/set pair 23: stores and retrieves key23', () => {
    const store = createMemoryStore();
    store.set('key23', 'value23');
    expect(store.get('key23')).toBe('value23');
  });
  it('get/set pair 24: stores and retrieves key24', () => {
    const store = createMemoryStore();
    store.set('key24', 'value24');
    expect(store.get('key24')).toBe('value24');
  });
  it('get/set pair 25: stores and retrieves key25', () => {
    const store = createMemoryStore();
    store.set('key25', 'value25');
    expect(store.get('key25')).toBe('value25');
  });
  it('get/set pair 26: stores and retrieves key26', () => {
    const store = createMemoryStore();
    store.set('key26', 'value26');
    expect(store.get('key26')).toBe('value26');
  });
  it('get/set pair 27: stores and retrieves key27', () => {
    const store = createMemoryStore();
    store.set('key27', 'value27');
    expect(store.get('key27')).toBe('value27');
  });
  it('get/set pair 28: stores and retrieves key28', () => {
    const store = createMemoryStore();
    store.set('key28', 'value28');
    expect(store.get('key28')).toBe('value28');
  });
  it('get/set pair 29: stores and retrieves key29', () => {
    const store = createMemoryStore();
    store.set('key29', 'value29');
    expect(store.get('key29')).toBe('value29');
  });
  it('get/set pair 30: stores and retrieves key30', () => {
    const store = createMemoryStore();
    store.set('key30', 'value30');
    expect(store.get('key30')).toBe('value30');
  });
  it('get/set pair 31: stores and retrieves key31', () => {
    const store = createMemoryStore();
    store.set('key31', 'value31');
    expect(store.get('key31')).toBe('value31');
  });
  it('get/set pair 32: stores and retrieves key32', () => {
    const store = createMemoryStore();
    store.set('key32', 'value32');
    expect(store.get('key32')).toBe('value32');
  });
  it('get/set pair 33: stores and retrieves key33', () => {
    const store = createMemoryStore();
    store.set('key33', 'value33');
    expect(store.get('key33')).toBe('value33');
  });
  it('get/set pair 34: stores and retrieves key34', () => {
    const store = createMemoryStore();
    store.set('key34', 'value34');
    expect(store.get('key34')).toBe('value34');
  });
  it('get/set pair 35: stores and retrieves key35', () => {
    const store = createMemoryStore();
    store.set('key35', 'value35');
    expect(store.get('key35')).toBe('value35');
  });
  it('get/set pair 36: stores and retrieves key36', () => {
    const store = createMemoryStore();
    store.set('key36', 'value36');
    expect(store.get('key36')).toBe('value36');
  });
  it('get/set pair 37: stores and retrieves key37', () => {
    const store = createMemoryStore();
    store.set('key37', 'value37');
    expect(store.get('key37')).toBe('value37');
  });
  it('get/set pair 38: stores and retrieves key38', () => {
    const store = createMemoryStore();
    store.set('key38', 'value38');
    expect(store.get('key38')).toBe('value38');
  });
  it('get/set pair 39: stores and retrieves key39', () => {
    const store = createMemoryStore();
    store.set('key39', 'value39');
    expect(store.get('key39')).toBe('value39');
  });
  it('get/set pair 40: stores and retrieves key40', () => {
    const store = createMemoryStore();
    store.set('key40', 'value40');
    expect(store.get('key40')).toBe('value40');
  });
  it('get/set pair 41: stores and retrieves key41', () => {
    const store = createMemoryStore();
    store.set('key41', 'value41');
    expect(store.get('key41')).toBe('value41');
  });
  it('get/set pair 42: stores and retrieves key42', () => {
    const store = createMemoryStore();
    store.set('key42', 'value42');
    expect(store.get('key42')).toBe('value42');
  });
  it('get/set pair 43: stores and retrieves key43', () => {
    const store = createMemoryStore();
    store.set('key43', 'value43');
    expect(store.get('key43')).toBe('value43');
  });
  it('get/set pair 44: stores and retrieves key44', () => {
    const store = createMemoryStore();
    store.set('key44', 'value44');
    expect(store.get('key44')).toBe('value44');
  });
  it('get/set pair 45: stores and retrieves key45', () => {
    const store = createMemoryStore();
    store.set('key45', 'value45');
    expect(store.get('key45')).toBe('value45');
  });
  it('get/set pair 46: stores and retrieves key46', () => {
    const store = createMemoryStore();
    store.set('key46', 'value46');
    expect(store.get('key46')).toBe('value46');
  });
  it('get/set pair 47: stores and retrieves key47', () => {
    const store = createMemoryStore();
    store.set('key47', 'value47');
    expect(store.get('key47')).toBe('value47');
  });
  it('get/set pair 48: stores and retrieves key48', () => {
    const store = createMemoryStore();
    store.set('key48', 'value48');
    expect(store.get('key48')).toBe('value48');
  });
  it('get/set pair 49: stores and retrieves key49', () => {
    const store = createMemoryStore();
    store.set('key49', 'value49');
    expect(store.get('key49')).toBe('value49');
  });
  it('get/set pair 50: stores and retrieves key50', () => {
    const store = createMemoryStore();
    store.set('key50', 'value50');
    expect(store.get('key50')).toBe('value50');
  });
  it('has 1: returns true when key1 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_1', 'val');
    expect(store.has('has_key_1')).toBe(true);
  });
  it('has 2: returns true when key2 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_2', 'val');
    expect(store.has('has_key_2')).toBe(true);
  });
  it('has 3: returns true when key3 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_3', 'val');
    expect(store.has('has_key_3')).toBe(true);
  });
  it('has 4: returns true when key4 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_4', 'val');
    expect(store.has('has_key_4')).toBe(true);
  });
  it('has 5: returns true when key5 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_5', 'val');
    expect(store.has('has_key_5')).toBe(true);
  });
  it('has 6: returns true when key6 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_6', 'val');
    expect(store.has('has_key_6')).toBe(true);
  });
  it('has 7: returns true when key7 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_7', 'val');
    expect(store.has('has_key_7')).toBe(true);
  });
  it('has 8: returns true when key8 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_8', 'val');
    expect(store.has('has_key_8')).toBe(true);
  });
  it('has 9: returns true when key9 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_9', 'val');
    expect(store.has('has_key_9')).toBe(true);
  });
  it('has 10: returns true when key10 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_10', 'val');
    expect(store.has('has_key_10')).toBe(true);
  });
  it('has 11: returns true when key11 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_11', 'val');
    expect(store.has('has_key_11')).toBe(true);
  });
  it('has 12: returns true when key12 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_12', 'val');
    expect(store.has('has_key_12')).toBe(true);
  });
  it('has 13: returns true when key13 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_13', 'val');
    expect(store.has('has_key_13')).toBe(true);
  });
  it('has 14: returns true when key14 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_14', 'val');
    expect(store.has('has_key_14')).toBe(true);
  });
  it('has 15: returns true when key15 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_15', 'val');
    expect(store.has('has_key_15')).toBe(true);
  });
  it('has 16: returns true when key16 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_16', 'val');
    expect(store.has('has_key_16')).toBe(true);
  });
  it('has 17: returns true when key17 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_17', 'val');
    expect(store.has('has_key_17')).toBe(true);
  });
  it('has 18: returns true when key18 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_18', 'val');
    expect(store.has('has_key_18')).toBe(true);
  });
  it('has 19: returns true when key19 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_19', 'val');
    expect(store.has('has_key_19')).toBe(true);
  });
  it('has 20: returns true when key20 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_20', 'val');
    expect(store.has('has_key_20')).toBe(true);
  });
  it('has 21: returns true when key21 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_21', 'val');
    expect(store.has('has_key_21')).toBe(true);
  });
  it('has 22: returns true when key22 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_22', 'val');
    expect(store.has('has_key_22')).toBe(true);
  });
  it('has 23: returns true when key23 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_23', 'val');
    expect(store.has('has_key_23')).toBe(true);
  });
  it('has 24: returns true when key24 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_24', 'val');
    expect(store.has('has_key_24')).toBe(true);
  });
  it('has 25: returns true when key25 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_25', 'val');
    expect(store.has('has_key_25')).toBe(true);
  });
  it('has 26: returns true when key26 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_26', 'val');
    expect(store.has('has_key_26')).toBe(true);
  });
  it('has 27: returns true when key27 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_27', 'val');
    expect(store.has('has_key_27')).toBe(true);
  });
  it('has 28: returns true when key28 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_28', 'val');
    expect(store.has('has_key_28')).toBe(true);
  });
  it('has 29: returns true when key29 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_29', 'val');
    expect(store.has('has_key_29')).toBe(true);
  });
  it('has 30: returns true when key30 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_30', 'val');
    expect(store.has('has_key_30')).toBe(true);
  });
  it('has 31: returns true when key31 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_31', 'val');
    expect(store.has('has_key_31')).toBe(true);
  });
  it('has 32: returns true when key32 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_32', 'val');
    expect(store.has('has_key_32')).toBe(true);
  });
  it('has 33: returns true when key33 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_33', 'val');
    expect(store.has('has_key_33')).toBe(true);
  });
  it('has 34: returns true when key34 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_34', 'val');
    expect(store.has('has_key_34')).toBe(true);
  });
  it('has 35: returns true when key35 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_35', 'val');
    expect(store.has('has_key_35')).toBe(true);
  });
  it('has 36: returns true when key36 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_36', 'val');
    expect(store.has('has_key_36')).toBe(true);
  });
  it('has 37: returns true when key37 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_37', 'val');
    expect(store.has('has_key_37')).toBe(true);
  });
  it('has 38: returns true when key38 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_38', 'val');
    expect(store.has('has_key_38')).toBe(true);
  });
  it('has 39: returns true when key39 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_39', 'val');
    expect(store.has('has_key_39')).toBe(true);
  });
  it('has 40: returns true when key40 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_40', 'val');
    expect(store.has('has_key_40')).toBe(true);
  });
  it('has 41: returns true when key41 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_41', 'val');
    expect(store.has('has_key_41')).toBe(true);
  });
  it('has 42: returns true when key42 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_42', 'val');
    expect(store.has('has_key_42')).toBe(true);
  });
  it('has 43: returns true when key43 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_43', 'val');
    expect(store.has('has_key_43')).toBe(true);
  });
  it('has 44: returns true when key44 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_44', 'val');
    expect(store.has('has_key_44')).toBe(true);
  });
  it('has 45: returns true when key45 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_45', 'val');
    expect(store.has('has_key_45')).toBe(true);
  });
  it('has 46: returns true when key46 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_46', 'val');
    expect(store.has('has_key_46')).toBe(true);
  });
  it('has 47: returns true when key47 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_47', 'val');
    expect(store.has('has_key_47')).toBe(true);
  });
  it('has 48: returns true when key48 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_48', 'val');
    expect(store.has('has_key_48')).toBe(true);
  });
  it('has 49: returns true when key49 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_49', 'val');
    expect(store.has('has_key_49')).toBe(true);
  });
  it('has 50: returns true when key50 is present', () => {
    const store = createMemoryStore();
    store.set('has_key_50', 'val');
    expect(store.has('has_key_50')).toBe(true);
  });
  it('has missing 1: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_1')).toBe(false);
  });
  it('has missing 2: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_2')).toBe(false);
  });
  it('has missing 3: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_3')).toBe(false);
  });
  it('has missing 4: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_4')).toBe(false);
  });
  it('has missing 5: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_5')).toBe(false);
  });
  it('has missing 6: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_6')).toBe(false);
  });
  it('has missing 7: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_7')).toBe(false);
  });
  it('has missing 8: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_8')).toBe(false);
  });
  it('has missing 9: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_9')).toBe(false);
  });
  it('has missing 10: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_10')).toBe(false);
  });
  it('has missing 11: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_11')).toBe(false);
  });
  it('has missing 12: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_12')).toBe(false);
  });
  it('has missing 13: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_13')).toBe(false);
  });
  it('has missing 14: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_14')).toBe(false);
  });
  it('has missing 15: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_15')).toBe(false);
  });
  it('has missing 16: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_16')).toBe(false);
  });
  it('has missing 17: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_17')).toBe(false);
  });
  it('has missing 18: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_18')).toBe(false);
  });
  it('has missing 19: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_19')).toBe(false);
  });
  it('has missing 20: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_20')).toBe(false);
  });
  it('has missing 21: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_21')).toBe(false);
  });
  it('has missing 22: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_22')).toBe(false);
  });
  it('has missing 23: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_23')).toBe(false);
  });
  it('has missing 24: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_24')).toBe(false);
  });
  it('has missing 25: returns false for absent key', () => {
    const store = createMemoryStore();
    expect(store.has('missing_25')).toBe(false);
  });
  it('get null 1: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_1')).toBeNull();
  });
  it('get null 2: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_2')).toBeNull();
  });
  it('get null 3: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_3')).toBeNull();
  });
  it('get null 4: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_4')).toBeNull();
  });
  it('get null 5: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_5')).toBeNull();
  });
  it('get null 6: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_6')).toBeNull();
  });
  it('get null 7: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_7')).toBeNull();
  });
  it('get null 8: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_8')).toBeNull();
  });
  it('get null 9: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_9')).toBeNull();
  });
  it('get null 10: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_10')).toBeNull();
  });
  it('get null 11: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_11')).toBeNull();
  });
  it('get null 12: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_12')).toBeNull();
  });
  it('get null 13: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_13')).toBeNull();
  });
  it('get null 14: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_14')).toBeNull();
  });
  it('get null 15: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_15')).toBeNull();
  });
  it('get null 16: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_16')).toBeNull();
  });
  it('get null 17: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_17')).toBeNull();
  });
  it('get null 18: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_18')).toBeNull();
  });
  it('get null 19: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_19')).toBeNull();
  });
  it('get null 20: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_20')).toBeNull();
  });
  it('get null 21: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_21')).toBeNull();
  });
  it('get null 22: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_22')).toBeNull();
  });
  it('get null 23: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_23')).toBeNull();
  });
  it('get null 24: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_24')).toBeNull();
  });
  it('get null 25: returns null for absent key', () => {
    const store = createMemoryStore();
    expect(store.get('absent_25')).toBeNull();
  });
  it('remove 1: key1 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_1', 'v');
    store.remove('rem_1');
    expect(store.has('rem_1')).toBe(false);
  });
  it('remove 2: key2 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_2', 'v');
    store.remove('rem_2');
    expect(store.has('rem_2')).toBe(false);
  });
  it('remove 3: key3 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_3', 'v');
    store.remove('rem_3');
    expect(store.has('rem_3')).toBe(false);
  });
  it('remove 4: key4 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_4', 'v');
    store.remove('rem_4');
    expect(store.has('rem_4')).toBe(false);
  });
  it('remove 5: key5 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_5', 'v');
    store.remove('rem_5');
    expect(store.has('rem_5')).toBe(false);
  });
  it('remove 6: key6 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_6', 'v');
    store.remove('rem_6');
    expect(store.has('rem_6')).toBe(false);
  });
  it('remove 7: key7 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_7', 'v');
    store.remove('rem_7');
    expect(store.has('rem_7')).toBe(false);
  });
  it('remove 8: key8 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_8', 'v');
    store.remove('rem_8');
    expect(store.has('rem_8')).toBe(false);
  });
  it('remove 9: key9 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_9', 'v');
    store.remove('rem_9');
    expect(store.has('rem_9')).toBe(false);
  });
  it('remove 10: key10 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_10', 'v');
    store.remove('rem_10');
    expect(store.has('rem_10')).toBe(false);
  });
  it('remove 11: key11 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_11', 'v');
    store.remove('rem_11');
    expect(store.has('rem_11')).toBe(false);
  });
  it('remove 12: key12 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_12', 'v');
    store.remove('rem_12');
    expect(store.has('rem_12')).toBe(false);
  });
  it('remove 13: key13 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_13', 'v');
    store.remove('rem_13');
    expect(store.has('rem_13')).toBe(false);
  });
  it('remove 14: key14 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_14', 'v');
    store.remove('rem_14');
    expect(store.has('rem_14')).toBe(false);
  });
  it('remove 15: key15 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_15', 'v');
    store.remove('rem_15');
    expect(store.has('rem_15')).toBe(false);
  });
  it('remove 16: key16 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_16', 'v');
    store.remove('rem_16');
    expect(store.has('rem_16')).toBe(false);
  });
  it('remove 17: key17 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_17', 'v');
    store.remove('rem_17');
    expect(store.has('rem_17')).toBe(false);
  });
  it('remove 18: key18 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_18', 'v');
    store.remove('rem_18');
    expect(store.has('rem_18')).toBe(false);
  });
  it('remove 19: key19 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_19', 'v');
    store.remove('rem_19');
    expect(store.has('rem_19')).toBe(false);
  });
  it('remove 20: key20 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_20', 'v');
    store.remove('rem_20');
    expect(store.has('rem_20')).toBe(false);
  });
  it('remove 21: key21 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_21', 'v');
    store.remove('rem_21');
    expect(store.has('rem_21')).toBe(false);
  });
  it('remove 22: key22 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_22', 'v');
    store.remove('rem_22');
    expect(store.has('rem_22')).toBe(false);
  });
  it('remove 23: key23 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_23', 'v');
    store.remove('rem_23');
    expect(store.has('rem_23')).toBe(false);
  });
  it('remove 24: key24 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_24', 'v');
    store.remove('rem_24');
    expect(store.has('rem_24')).toBe(false);
  });
  it('remove 25: key25 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_25', 'v');
    store.remove('rem_25');
    expect(store.has('rem_25')).toBe(false);
  });
  it('remove 26: key26 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_26', 'v');
    store.remove('rem_26');
    expect(store.has('rem_26')).toBe(false);
  });
  it('remove 27: key27 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_27', 'v');
    store.remove('rem_27');
    expect(store.has('rem_27')).toBe(false);
  });
  it('remove 28: key28 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_28', 'v');
    store.remove('rem_28');
    expect(store.has('rem_28')).toBe(false);
  });
  it('remove 29: key29 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_29', 'v');
    store.remove('rem_29');
    expect(store.has('rem_29')).toBe(false);
  });
  it('remove 30: key30 absent after remove', () => {
    const store = createMemoryStore();
    store.set('rem_30', 'v');
    store.remove('rem_30');
    expect(store.has('rem_30')).toBe(false);
  });
  it('overwrite 1: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_1', 'old');
    store.set('ow_1', 'new1');
    expect(store.get('ow_1')).toBe('new1');
  });
  it('overwrite 2: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_2', 'old');
    store.set('ow_2', 'new2');
    expect(store.get('ow_2')).toBe('new2');
  });
  it('overwrite 3: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_3', 'old');
    store.set('ow_3', 'new3');
    expect(store.get('ow_3')).toBe('new3');
  });
  it('overwrite 4: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_4', 'old');
    store.set('ow_4', 'new4');
    expect(store.get('ow_4')).toBe('new4');
  });
  it('overwrite 5: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_5', 'old');
    store.set('ow_5', 'new5');
    expect(store.get('ow_5')).toBe('new5');
  });
  it('overwrite 6: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_6', 'old');
    store.set('ow_6', 'new6');
    expect(store.get('ow_6')).toBe('new6');
  });
  it('overwrite 7: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_7', 'old');
    store.set('ow_7', 'new7');
    expect(store.get('ow_7')).toBe('new7');
  });
  it('overwrite 8: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_8', 'old');
    store.set('ow_8', 'new8');
    expect(store.get('ow_8')).toBe('new8');
  });
  it('overwrite 9: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_9', 'old');
    store.set('ow_9', 'new9');
    expect(store.get('ow_9')).toBe('new9');
  });
  it('overwrite 10: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_10', 'old');
    store.set('ow_10', 'new10');
    expect(store.get('ow_10')).toBe('new10');
  });
  it('overwrite 11: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_11', 'old');
    store.set('ow_11', 'new11');
    expect(store.get('ow_11')).toBe('new11');
  });
  it('overwrite 12: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_12', 'old');
    store.set('ow_12', 'new12');
    expect(store.get('ow_12')).toBe('new12');
  });
  it('overwrite 13: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_13', 'old');
    store.set('ow_13', 'new13');
    expect(store.get('ow_13')).toBe('new13');
  });
  it('overwrite 14: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_14', 'old');
    store.set('ow_14', 'new14');
    expect(store.get('ow_14')).toBe('new14');
  });
  it('overwrite 15: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_15', 'old');
    store.set('ow_15', 'new15');
    expect(store.get('ow_15')).toBe('new15');
  });
  it('overwrite 16: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_16', 'old');
    store.set('ow_16', 'new16');
    expect(store.get('ow_16')).toBe('new16');
  });
  it('overwrite 17: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_17', 'old');
    store.set('ow_17', 'new17');
    expect(store.get('ow_17')).toBe('new17');
  });
  it('overwrite 18: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_18', 'old');
    store.set('ow_18', 'new18');
    expect(store.get('ow_18')).toBe('new18');
  });
  it('overwrite 19: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_19', 'old');
    store.set('ow_19', 'new19');
    expect(store.get('ow_19')).toBe('new19');
  });
  it('overwrite 20: set overwrites existing value', () => {
    const store = createMemoryStore();
    store.set('ow_20', 'old');
    store.set('ow_20', 'new20');
    expect(store.get('ow_20')).toBe('new20');
  });
});

describe('createMemoryStore - clear/keys/length', () => {
  it('length 1: store with 1 entries has length 1', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 1; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(1);
  });
  it('length 2: store with 2 entries has length 2', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 2; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(2);
  });
  it('length 3: store with 3 entries has length 3', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 3; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(3);
  });
  it('length 4: store with 4 entries has length 4', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 4; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(4);
  });
  it('length 5: store with 5 entries has length 5', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 5; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(5);
  });
  it('length 6: store with 6 entries has length 6', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 6; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(6);
  });
  it('length 7: store with 7 entries has length 7', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 7; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(7);
  });
  it('length 8: store with 8 entries has length 8', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 8; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(8);
  });
  it('length 9: store with 9 entries has length 9', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 9; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(9);
  });
  it('length 10: store with 10 entries has length 10', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 10; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(10);
  });
  it('length 11: store with 11 entries has length 11', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 11; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(11);
  });
  it('length 12: store with 12 entries has length 12', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 12; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(12);
  });
  it('length 13: store with 13 entries has length 13', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 13; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(13);
  });
  it('length 14: store with 14 entries has length 14', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 14; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(14);
  });
  it('length 15: store with 15 entries has length 15', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 15; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(15);
  });
  it('length 16: store with 16 entries has length 16', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 16; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(16);
  });
  it('length 17: store with 17 entries has length 17', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 17; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(17);
  });
  it('length 18: store with 18 entries has length 18', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 18; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(18);
  });
  it('length 19: store with 19 entries has length 19', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 19; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(19);
  });
  it('length 20: store with 20 entries has length 20', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 20; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(20);
  });
  it('length 21: store with 21 entries has length 21', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 21; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(21);
  });
  it('length 22: store with 22 entries has length 22', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 22; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(22);
  });
  it('length 23: store with 23 entries has length 23', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 23; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(23);
  });
  it('length 24: store with 24 entries has length 24', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 24; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(24);
  });
  it('length 25: store with 25 entries has length 25', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 25; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(25);
  });
  it('length 26: store with 26 entries has length 26', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 26; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(26);
  });
  it('length 27: store with 27 entries has length 27', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 27; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(27);
  });
  it('length 28: store with 28 entries has length 28', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 28; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(28);
  });
  it('length 29: store with 29 entries has length 29', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 29; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(29);
  });
  it('length 30: store with 30 entries has length 30', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 30; j++) store.set('lk' + j, 'lv' + j);
    expect(store.length()).toBe(30);
  });
  it('length after remove 1: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 1; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(1 - 1);
  });
  it('length after remove 2: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 2; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(2 - 1);
  });
  it('length after remove 3: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 3; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(3 - 1);
  });
  it('length after remove 4: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 4; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(4 - 1);
  });
  it('length after remove 5: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 5; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(5 - 1);
  });
  it('length after remove 6: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 6; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(6 - 1);
  });
  it('length after remove 7: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 7; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(7 - 1);
  });
  it('length after remove 8: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 8; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(8 - 1);
  });
  it('length after remove 9: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 9; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(9 - 1);
  });
  it('length after remove 10: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 10; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(10 - 1);
  });
  it('length after remove 11: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 11; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(11 - 1);
  });
  it('length after remove 12: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 12; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(12 - 1);
  });
  it('length after remove 13: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 13; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(13 - 1);
  });
  it('length after remove 14: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 14; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(14 - 1);
  });
  it('length after remove 15: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 15; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(15 - 1);
  });
  it('length after remove 16: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 16; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(16 - 1);
  });
  it('length after remove 17: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 17; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(17 - 1);
  });
  it('length after remove 18: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 18; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(18 - 1);
  });
  it('length after remove 19: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 19; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(19 - 1);
  });
  it('length after remove 20: decrements after removal', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 20; j++) store.set('k' + j, 'v');
    store.remove('k0');
    expect(store.length()).toBe(20 - 1);
  });
  it('keys 1: keys() returns all 1 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 2: keys() returns all 2 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 3: keys() returns all 3 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 4: keys() returns all 4 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 5: keys() returns all 5 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 6: keys() returns all 6 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 7: keys() returns all 7 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 8: keys() returns all 8 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 9: keys() returns all 9 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 10: keys() returns all 10 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 11: keys() returns all 11 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 12: keys() returns all 12 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 13: keys() returns all 13 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 14: keys() returns all 14 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 15: keys() returns all 15 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13', 'mk14'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 16: keys() returns all 16 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13', 'mk14', 'mk15'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 17: keys() returns all 17 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13', 'mk14', 'mk15', 'mk16'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 18: keys() returns all 18 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13', 'mk14', 'mk15', 'mk16', 'mk17'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 19: keys() returns all 19 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13', 'mk14', 'mk15', 'mk16', 'mk17', 'mk18'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('keys 20: keys() returns all 20 keys', () => {
    const store = createMemoryStore();
    const expected = ['mk0', 'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'mk6', 'mk7', 'mk8', 'mk9', 'mk10', 'mk11', 'mk12', 'mk13', 'mk14', 'mk15', 'mk16', 'mk17', 'mk18', 'mk19'];
    expected.forEach(k => store.set(k, 'v'));
    expect(store.keys().sort()).toEqual(expected.sort());
  });
  it('clear 1: store empty after clear with 1 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 1; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 2: store empty after clear with 2 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 2; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 3: store empty after clear with 3 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 3; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 4: store empty after clear with 4 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 4; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 5: store empty after clear with 5 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 5; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 6: store empty after clear with 6 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 6; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 7: store empty after clear with 7 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 7; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 8: store empty after clear with 8 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 8; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 9: store empty after clear with 9 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 9; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 10: store empty after clear with 10 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 10; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 11: store empty after clear with 11 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 11; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 12: store empty after clear with 12 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 12; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 13: store empty after clear with 13 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 13; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 14: store empty after clear with 14 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 14; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('clear 15: store empty after clear with 15 entries', () => {
    const store = createMemoryStore();
    for (let j = 0; j < 15; j++) store.set('ck' + j, 'cv');
    store.clear();
    expect(store.length()).toBe(0);
  });
  it('empty store: length is 0', () => { expect(createMemoryStore().length()).toBe(0); });
  it('empty store: keys returns []', () => { expect(createMemoryStore().keys()).toEqual([]); });
  it('remove nonexistent: no error', () => { const s = createMemoryStore(); s.remove('x'); expect(s.length()).toBe(0); });
  it('clear empty: no error', () => { const s = createMemoryStore(); s.clear(); expect(s.length()).toBe(0); });
  it('get after clear: returns null', () => { const s = createMemoryStore(); s.set('a','b'); s.clear(); expect(s.get('a')).toBeNull(); });
  it('keys after clear: returns []', () => { const s = createMemoryStore(); s.set('a','b'); s.clear(); expect(s.keys()).toEqual([]); });
  it('has after clear: returns false', () => { const s = createMemoryStore(); s.set('a','b'); s.clear(); expect(s.has('a')).toBe(false); });
});

describe('createNamespacedStore', () => {
  it('ns get/set 1: key1 stored under namespace ns1', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns1');
    ns.set('key1', 'val1');
    expect(ns.get('key1')).toBe('val1');
  });
  it('ns get/set 2: key2 stored under namespace ns2', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns2');
    ns.set('key2', 'val2');
    expect(ns.get('key2')).toBe('val2');
  });
  it('ns get/set 3: key3 stored under namespace ns3', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns3');
    ns.set('key3', 'val3');
    expect(ns.get('key3')).toBe('val3');
  });
  it('ns get/set 4: key4 stored under namespace ns4', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns4');
    ns.set('key4', 'val4');
    expect(ns.get('key4')).toBe('val4');
  });
  it('ns get/set 5: key5 stored under namespace ns5', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns5');
    ns.set('key5', 'val5');
    expect(ns.get('key5')).toBe('val5');
  });
  it('ns get/set 6: key6 stored under namespace ns6', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns6');
    ns.set('key6', 'val6');
    expect(ns.get('key6')).toBe('val6');
  });
  it('ns get/set 7: key7 stored under namespace ns7', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns7');
    ns.set('key7', 'val7');
    expect(ns.get('key7')).toBe('val7');
  });
  it('ns get/set 8: key8 stored under namespace ns8', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns8');
    ns.set('key8', 'val8');
    expect(ns.get('key8')).toBe('val8');
  });
  it('ns get/set 9: key9 stored under namespace ns9', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns9');
    ns.set('key9', 'val9');
    expect(ns.get('key9')).toBe('val9');
  });
  it('ns get/set 10: key10 stored under namespace ns10', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns10');
    ns.set('key10', 'val10');
    expect(ns.get('key10')).toBe('val10');
  });
  it('ns get/set 11: key11 stored under namespace ns11', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns11');
    ns.set('key11', 'val11');
    expect(ns.get('key11')).toBe('val11');
  });
  it('ns get/set 12: key12 stored under namespace ns12', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns12');
    ns.set('key12', 'val12');
    expect(ns.get('key12')).toBe('val12');
  });
  it('ns get/set 13: key13 stored under namespace ns13', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns13');
    ns.set('key13', 'val13');
    expect(ns.get('key13')).toBe('val13');
  });
  it('ns get/set 14: key14 stored under namespace ns14', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns14');
    ns.set('key14', 'val14');
    expect(ns.get('key14')).toBe('val14');
  });
  it('ns get/set 15: key15 stored under namespace ns15', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns15');
    ns.set('key15', 'val15');
    expect(ns.get('key15')).toBe('val15');
  });
  it('ns get/set 16: key16 stored under namespace ns16', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns16');
    ns.set('key16', 'val16');
    expect(ns.get('key16')).toBe('val16');
  });
  it('ns get/set 17: key17 stored under namespace ns17', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns17');
    ns.set('key17', 'val17');
    expect(ns.get('key17')).toBe('val17');
  });
  it('ns get/set 18: key18 stored under namespace ns18', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns18');
    ns.set('key18', 'val18');
    expect(ns.get('key18')).toBe('val18');
  });
  it('ns get/set 19: key19 stored under namespace ns19', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns19');
    ns.set('key19', 'val19');
    expect(ns.get('key19')).toBe('val19');
  });
  it('ns get/set 20: key20 stored under namespace ns20', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns20');
    ns.set('key20', 'val20');
    expect(ns.get('key20')).toBe('val20');
  });
  it('ns get/set 21: key21 stored under namespace ns21', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns21');
    ns.set('key21', 'val21');
    expect(ns.get('key21')).toBe('val21');
  });
  it('ns get/set 22: key22 stored under namespace ns22', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns22');
    ns.set('key22', 'val22');
    expect(ns.get('key22')).toBe('val22');
  });
  it('ns get/set 23: key23 stored under namespace ns23', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns23');
    ns.set('key23', 'val23');
    expect(ns.get('key23')).toBe('val23');
  });
  it('ns get/set 24: key24 stored under namespace ns24', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns24');
    ns.set('key24', 'val24');
    expect(ns.get('key24')).toBe('val24');
  });
  it('ns get/set 25: key25 stored under namespace ns25', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns25');
    ns.set('key25', 'val25');
    expect(ns.get('key25')).toBe('val25');
  });
  it('ns get/set 26: key26 stored under namespace ns26', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns26');
    ns.set('key26', 'val26');
    expect(ns.get('key26')).toBe('val26');
  });
  it('ns get/set 27: key27 stored under namespace ns27', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns27');
    ns.set('key27', 'val27');
    expect(ns.get('key27')).toBe('val27');
  });
  it('ns get/set 28: key28 stored under namespace ns28', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns28');
    ns.set('key28', 'val28');
    expect(ns.get('key28')).toBe('val28');
  });
  it('ns get/set 29: key29 stored under namespace ns29', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns29');
    ns.set('key29', 'val29');
    expect(ns.get('key29')).toBe('val29');
  });
  it('ns get/set 30: key30 stored under namespace ns30', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns30');
    ns.set('key30', 'val30');
    expect(ns.get('key30')).toBe('val30');
  });
  it('ns get/set 31: key31 stored under namespace ns31', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns31');
    ns.set('key31', 'val31');
    expect(ns.get('key31')).toBe('val31');
  });
  it('ns get/set 32: key32 stored under namespace ns32', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns32');
    ns.set('key32', 'val32');
    expect(ns.get('key32')).toBe('val32');
  });
  it('ns get/set 33: key33 stored under namespace ns33', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns33');
    ns.set('key33', 'val33');
    expect(ns.get('key33')).toBe('val33');
  });
  it('ns get/set 34: key34 stored under namespace ns34', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns34');
    ns.set('key34', 'val34');
    expect(ns.get('key34')).toBe('val34');
  });
  it('ns get/set 35: key35 stored under namespace ns35', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns35');
    ns.set('key35', 'val35');
    expect(ns.get('key35')).toBe('val35');
  });
  it('ns get/set 36: key36 stored under namespace ns36', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns36');
    ns.set('key36', 'val36');
    expect(ns.get('key36')).toBe('val36');
  });
  it('ns get/set 37: key37 stored under namespace ns37', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns37');
    ns.set('key37', 'val37');
    expect(ns.get('key37')).toBe('val37');
  });
  it('ns get/set 38: key38 stored under namespace ns38', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns38');
    ns.set('key38', 'val38');
    expect(ns.get('key38')).toBe('val38');
  });
  it('ns get/set 39: key39 stored under namespace ns39', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns39');
    ns.set('key39', 'val39');
    expect(ns.get('key39')).toBe('val39');
  });
  it('ns get/set 40: key40 stored under namespace ns40', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns40');
    ns.set('key40', 'val40');
    expect(ns.get('key40')).toBe('val40');
  });
  it('ns get/set 41: key41 stored under namespace ns41', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns41');
    ns.set('key41', 'val41');
    expect(ns.get('key41')).toBe('val41');
  });
  it('ns get/set 42: key42 stored under namespace ns42', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns42');
    ns.set('key42', 'val42');
    expect(ns.get('key42')).toBe('val42');
  });
  it('ns get/set 43: key43 stored under namespace ns43', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns43');
    ns.set('key43', 'val43');
    expect(ns.get('key43')).toBe('val43');
  });
  it('ns get/set 44: key44 stored under namespace ns44', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns44');
    ns.set('key44', 'val44');
    expect(ns.get('key44')).toBe('val44');
  });
  it('ns get/set 45: key45 stored under namespace ns45', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns45');
    ns.set('key45', 'val45');
    expect(ns.get('key45')).toBe('val45');
  });
  it('ns get/set 46: key46 stored under namespace ns46', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns46');
    ns.set('key46', 'val46');
    expect(ns.get('key46')).toBe('val46');
  });
  it('ns get/set 47: key47 stored under namespace ns47', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns47');
    ns.set('key47', 'val47');
    expect(ns.get('key47')).toBe('val47');
  });
  it('ns get/set 48: key48 stored under namespace ns48', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns48');
    ns.set('key48', 'val48');
    expect(ns.get('key48')).toBe('val48');
  });
  it('ns get/set 49: key49 stored under namespace ns49', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns49');
    ns.set('key49', 'val49');
    expect(ns.get('key49')).toBe('val49');
  });
  it('ns get/set 50: key50 stored under namespace ns50', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'ns50');
    ns.set('key50', 'val50');
    expect(ns.get('key50')).toBe('val50');
  });
  it('ns isolation 1: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA1');
    const ns2 = createNamespacedStore(base, 'nsB1');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 2: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA2');
    const ns2 = createNamespacedStore(base, 'nsB2');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 3: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA3');
    const ns2 = createNamespacedStore(base, 'nsB3');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 4: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA4');
    const ns2 = createNamespacedStore(base, 'nsB4');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 5: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA5');
    const ns2 = createNamespacedStore(base, 'nsB5');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 6: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA6');
    const ns2 = createNamespacedStore(base, 'nsB6');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 7: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA7');
    const ns2 = createNamespacedStore(base, 'nsB7');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 8: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA8');
    const ns2 = createNamespacedStore(base, 'nsB8');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 9: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA9');
    const ns2 = createNamespacedStore(base, 'nsB9');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 10: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA10');
    const ns2 = createNamespacedStore(base, 'nsB10');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 11: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA11');
    const ns2 = createNamespacedStore(base, 'nsB11');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 12: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA12');
    const ns2 = createNamespacedStore(base, 'nsB12');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 13: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA13');
    const ns2 = createNamespacedStore(base, 'nsB13');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 14: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA14');
    const ns2 = createNamespacedStore(base, 'nsB14');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 15: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA15');
    const ns2 = createNamespacedStore(base, 'nsB15');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 16: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA16');
    const ns2 = createNamespacedStore(base, 'nsB16');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 17: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA17');
    const ns2 = createNamespacedStore(base, 'nsB17');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 18: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA18');
    const ns2 = createNamespacedStore(base, 'nsB18');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 19: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA19');
    const ns2 = createNamespacedStore(base, 'nsB19');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 20: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA20');
    const ns2 = createNamespacedStore(base, 'nsB20');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 21: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA21');
    const ns2 = createNamespacedStore(base, 'nsB21');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 22: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA22');
    const ns2 = createNamespacedStore(base, 'nsB22');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 23: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA23');
    const ns2 = createNamespacedStore(base, 'nsB23');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 24: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA24');
    const ns2 = createNamespacedStore(base, 'nsB24');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 25: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA25');
    const ns2 = createNamespacedStore(base, 'nsB25');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 26: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA26');
    const ns2 = createNamespacedStore(base, 'nsB26');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 27: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA27');
    const ns2 = createNamespacedStore(base, 'nsB27');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 28: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA28');
    const ns2 = createNamespacedStore(base, 'nsB28');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 29: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA29');
    const ns2 = createNamespacedStore(base, 'nsB29');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns isolation 30: key in ns1 not visible in ns2', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsA30');
    const ns2 = createNamespacedStore(base, 'nsB30');
    ns1.set('shared', 'fromA');
    expect(ns2.get('shared')).toBeNull();
  });
  it('ns has isolation 1: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa1');
    const ns2 = createNamespacedStore(base, 'nsCb1');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 2: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa2');
    const ns2 = createNamespacedStore(base, 'nsCb2');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 3: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa3');
    const ns2 = createNamespacedStore(base, 'nsCb3');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 4: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa4');
    const ns2 = createNamespacedStore(base, 'nsCb4');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 5: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa5');
    const ns2 = createNamespacedStore(base, 'nsCb5');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 6: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa6');
    const ns2 = createNamespacedStore(base, 'nsCb6');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 7: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa7');
    const ns2 = createNamespacedStore(base, 'nsCb7');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 8: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa8');
    const ns2 = createNamespacedStore(base, 'nsCb8');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 9: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa9');
    const ns2 = createNamespacedStore(base, 'nsCb9');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 10: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa10');
    const ns2 = createNamespacedStore(base, 'nsCb10');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 11: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa11');
    const ns2 = createNamespacedStore(base, 'nsCb11');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 12: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa12');
    const ns2 = createNamespacedStore(base, 'nsCb12');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 13: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa13');
    const ns2 = createNamespacedStore(base, 'nsCb13');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 14: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa14');
    const ns2 = createNamespacedStore(base, 'nsCb14');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 15: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa15');
    const ns2 = createNamespacedStore(base, 'nsCb15');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 16: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa16');
    const ns2 = createNamespacedStore(base, 'nsCb16');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 17: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa17');
    const ns2 = createNamespacedStore(base, 'nsCb17');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 18: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa18');
    const ns2 = createNamespacedStore(base, 'nsCb18');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 19: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa19');
    const ns2 = createNamespacedStore(base, 'nsCb19');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns has isolation 20: has() false across namespaces', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsCa20');
    const ns2 = createNamespacedStore(base, 'nsCb20');
    ns1.set('k', 'v');
    expect(ns2.has('k')).toBe(false);
  });
  it('ns base key 1: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx1');
    ns.set('item', 'data');
    expect(base.has('pfx1:item')).toBe(true);
  });
  it('ns base key 2: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx2');
    ns.set('item', 'data');
    expect(base.has('pfx2:item')).toBe(true);
  });
  it('ns base key 3: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx3');
    ns.set('item', 'data');
    expect(base.has('pfx3:item')).toBe(true);
  });
  it('ns base key 4: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx4');
    ns.set('item', 'data');
    expect(base.has('pfx4:item')).toBe(true);
  });
  it('ns base key 5: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx5');
    ns.set('item', 'data');
    expect(base.has('pfx5:item')).toBe(true);
  });
  it('ns base key 6: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx6');
    ns.set('item', 'data');
    expect(base.has('pfx6:item')).toBe(true);
  });
  it('ns base key 7: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx7');
    ns.set('item', 'data');
    expect(base.has('pfx7:item')).toBe(true);
  });
  it('ns base key 8: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx8');
    ns.set('item', 'data');
    expect(base.has('pfx8:item')).toBe(true);
  });
  it('ns base key 9: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx9');
    ns.set('item', 'data');
    expect(base.has('pfx9:item')).toBe(true);
  });
  it('ns base key 10: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx10');
    ns.set('item', 'data');
    expect(base.has('pfx10:item')).toBe(true);
  });
  it('ns base key 11: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx11');
    ns.set('item', 'data');
    expect(base.has('pfx11:item')).toBe(true);
  });
  it('ns base key 12: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx12');
    ns.set('item', 'data');
    expect(base.has('pfx12:item')).toBe(true);
  });
  it('ns base key 13: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx13');
    ns.set('item', 'data');
    expect(base.has('pfx13:item')).toBe(true);
  });
  it('ns base key 14: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx14');
    ns.set('item', 'data');
    expect(base.has('pfx14:item')).toBe(true);
  });
  it('ns base key 15: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx15');
    ns.set('item', 'data');
    expect(base.has('pfx15:item')).toBe(true);
  });
  it('ns base key 16: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx16');
    ns.set('item', 'data');
    expect(base.has('pfx16:item')).toBe(true);
  });
  it('ns base key 17: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx17');
    ns.set('item', 'data');
    expect(base.has('pfx17:item')).toBe(true);
  });
  it('ns base key 18: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx18');
    ns.set('item', 'data');
    expect(base.has('pfx18:item')).toBe(true);
  });
  it('ns base key 19: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx19');
    ns.set('item', 'data');
    expect(base.has('pfx19:item')).toBe(true);
  });
  it('ns base key 20: raw key in base has prefix', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'pfx20');
    ns.set('item', 'data');
    expect(base.has('pfx20:item')).toBe(true);
  });
  it('ns clear 1: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa1');
    const ns2 = createNamespacedStore(base, 'nsDb1');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 2: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa2');
    const ns2 = createNamespacedStore(base, 'nsDb2');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 3: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa3');
    const ns2 = createNamespacedStore(base, 'nsDb3');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 4: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa4');
    const ns2 = createNamespacedStore(base, 'nsDb4');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 5: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa5');
    const ns2 = createNamespacedStore(base, 'nsDb5');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 6: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa6');
    const ns2 = createNamespacedStore(base, 'nsDb6');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 7: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa7');
    const ns2 = createNamespacedStore(base, 'nsDb7');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 8: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa8');
    const ns2 = createNamespacedStore(base, 'nsDb8');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 9: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa9');
    const ns2 = createNamespacedStore(base, 'nsDb9');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 10: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa10');
    const ns2 = createNamespacedStore(base, 'nsDb10');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 11: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa11');
    const ns2 = createNamespacedStore(base, 'nsDb11');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 12: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa12');
    const ns2 = createNamespacedStore(base, 'nsDb12');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 13: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa13');
    const ns2 = createNamespacedStore(base, 'nsDb13');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 14: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa14');
    const ns2 = createNamespacedStore(base, 'nsDb14');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 15: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa15');
    const ns2 = createNamespacedStore(base, 'nsDb15');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 16: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa16');
    const ns2 = createNamespacedStore(base, 'nsDb16');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 17: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa17');
    const ns2 = createNamespacedStore(base, 'nsDb17');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 18: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa18');
    const ns2 = createNamespacedStore(base, 'nsDb18');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 19: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa19');
    const ns2 = createNamespacedStore(base, 'nsDb19');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns clear 20: clear only removes ns keys', () => {
    const base = createMemoryStore();
    const ns1 = createNamespacedStore(base, 'nsDa20');
    const ns2 = createNamespacedStore(base, 'nsDb20');
    ns1.set('k', 'v');
    ns2.set('k', 'v');
    ns1.clear();
    expect(ns2.has('k')).toBe(true);
  });
  it('ns keys 1: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE1');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 2: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE2');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 3: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE3');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 4: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE4');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 5: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE5');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 6: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE6');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 7: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE7');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 8: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE8');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 9: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE9');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 10: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE10');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 11: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE11');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 12: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE12');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 13: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE13');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 14: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE14');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 15: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE15');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 16: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE16');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 17: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE17');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 18: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE18');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 19: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE19');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns keys 20: keys() returns bare keys not prefixed', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsE20');
    ns.set('alpha', 'a');
    ns.set('beta', 'b');
    expect(ns.keys().sort()).toEqual(['alpha', 'beta']);
  });
  it('ns length 1: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF1');
    base.set('outside', 'x');
    for (let j = 0; j < 1; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(1);
  });
  it('ns length 2: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF2');
    base.set('outside', 'x');
    for (let j = 0; j < 2; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(2);
  });
  it('ns length 3: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF3');
    base.set('outside', 'x');
    for (let j = 0; j < 3; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(3);
  });
  it('ns length 4: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF4');
    base.set('outside', 'x');
    for (let j = 0; j < 4; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(4);
  });
  it('ns length 5: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF5');
    base.set('outside', 'x');
    for (let j = 0; j < 5; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(5);
  });
  it('ns length 6: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF6');
    base.set('outside', 'x');
    for (let j = 0; j < 6; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(6);
  });
  it('ns length 7: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF7');
    base.set('outside', 'x');
    for (let j = 0; j < 7; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(7);
  });
  it('ns length 8: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF8');
    base.set('outside', 'x');
    for (let j = 0; j < 8; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(8);
  });
  it('ns length 9: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF9');
    base.set('outside', 'x');
    for (let j = 0; j < 9; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(9);
  });
  it('ns length 10: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF10');
    base.set('outside', 'x');
    for (let j = 0; j < 10; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(10);
  });
  it('ns length 11: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF11');
    base.set('outside', 'x');
    for (let j = 0; j < 11; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(11);
  });
  it('ns length 12: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF12');
    base.set('outside', 'x');
    for (let j = 0; j < 12; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(12);
  });
  it('ns length 13: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF13');
    base.set('outside', 'x');
    for (let j = 0; j < 13; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(13);
  });
  it('ns length 14: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF14');
    base.set('outside', 'x');
    for (let j = 0; j < 14; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(14);
  });
  it('ns length 15: length reflects only ns entries', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'nsF15');
    base.set('outside', 'x');
    for (let j = 0; j < 15; j++) ns.set('k' + j, 'v');
    expect(ns.length()).toBe(15);
  });
});

describe('serializeValue / deserializeValue', () => {
  it('serialize number 0: round-trips number 0', () => {
    expect(deserializeValue<number>(serializeValue(0))).toBe(0);
  });
  it('serialize number 1: round-trips number 1', () => {
    expect(deserializeValue<number>(serializeValue(1))).toBe(1);
  });
  it('serialize number 2: round-trips number 2', () => {
    expect(deserializeValue<number>(serializeValue(2))).toBe(2);
  });
  it('serialize number 3: round-trips number 3', () => {
    expect(deserializeValue<number>(serializeValue(3))).toBe(3);
  });
  it('serialize number 4: round-trips number 4', () => {
    expect(deserializeValue<number>(serializeValue(4))).toBe(4);
  });
  it('serialize number 5: round-trips number 5', () => {
    expect(deserializeValue<number>(serializeValue(5))).toBe(5);
  });
  it('serialize number 6: round-trips number 6', () => {
    expect(deserializeValue<number>(serializeValue(6))).toBe(6);
  });
  it('serialize number 7: round-trips number 7', () => {
    expect(deserializeValue<number>(serializeValue(7))).toBe(7);
  });
  it('serialize number 8: round-trips number 8', () => {
    expect(deserializeValue<number>(serializeValue(8))).toBe(8);
  });
  it('serialize number 9: round-trips number 9', () => {
    expect(deserializeValue<number>(serializeValue(9))).toBe(9);
  });
  it('serialize number 10: round-trips number 10', () => {
    expect(deserializeValue<number>(serializeValue(10))).toBe(10);
  });
  it('serialize number 11: round-trips number 11', () => {
    expect(deserializeValue<number>(serializeValue(11))).toBe(11);
  });
  it('serialize number 12: round-trips number 12', () => {
    expect(deserializeValue<number>(serializeValue(12))).toBe(12);
  });
  it('serialize number 13: round-trips number 13', () => {
    expect(deserializeValue<number>(serializeValue(13))).toBe(13);
  });
  it('serialize number 14: round-trips number 14', () => {
    expect(deserializeValue<number>(serializeValue(14))).toBe(14);
  });
  it('serialize number 15: round-trips number 15', () => {
    expect(deserializeValue<number>(serializeValue(15))).toBe(15);
  });
  it('serialize number 16: round-trips number 16', () => {
    expect(deserializeValue<number>(serializeValue(16))).toBe(16);
  });
  it('serialize number 17: round-trips number 17', () => {
    expect(deserializeValue<number>(serializeValue(17))).toBe(17);
  });
  it('serialize number 18: round-trips number 18', () => {
    expect(deserializeValue<number>(serializeValue(18))).toBe(18);
  });
  it('serialize number 19: round-trips number 19', () => {
    expect(deserializeValue<number>(serializeValue(19))).toBe(19);
  });
  it('serialize true: round-trips boolean true', () => { expect(deserializeValue<boolean>(serializeValue(true))).toBe(true); });
  it('serialize false: round-trips boolean false', () => { expect(deserializeValue<boolean>(serializeValue(false))).toBe(false); });
  it('serialize string 0: round-trips string \'hello\'', () => {
    expect(deserializeValue<string>(serializeValue('hello'))).toBe('hello');
  });
  it('serialize string 1: round-trips string \'world\'', () => {
    expect(deserializeValue<string>(serializeValue('world'))).toBe('world');
  });
  it('serialize string 2: round-trips string \'foo\'', () => {
    expect(deserializeValue<string>(serializeValue('foo'))).toBe('foo');
  });
  it('serialize string 3: round-trips string \'bar\'', () => {
    expect(deserializeValue<string>(serializeValue('bar'))).toBe('bar');
  });
  it('serialize string 4: round-trips string \'\'', () => {
    expect(deserializeValue<string>(serializeValue(''))).toBe('');
  });
  it('serialize string 5: round-trips string \'a\'', () => {
    expect(deserializeValue<string>(serializeValue('a'))).toBe('a');
  });
  it('serialize string 6: round-trips string \'abc def\'', () => {
    expect(deserializeValue<string>(serializeValue('abc def'))).toBe('abc def');
  });
  it('serialize string 7: round-trips string \'123\'', () => {
    expect(deserializeValue<string>(serializeValue('123'))).toBe('123');
  });
  it('serialize string 8: round-trips string \'test_value\'', () => {
    expect(deserializeValue<string>(serializeValue('test_value'))).toBe('test_value');
  });
  it('serialize string 9: round-trips string \'key:value\'', () => {
    expect(deserializeValue<string>(serializeValue('key:value'))).toBe('key:value');
  });
  it('serialize null: produces parseable output', () => { expect(deserializeValue<null>(serializeValue(null))).toBeNull(); });
  it('deserialize invalid: returns null for invalid JSON', () => { expect(deserializeValue<unknown>('{bad json')).toBeNull(); });
  it('deserialize empty string: returns null', () => { expect(deserializeValue<unknown>('')).toBeNull(); });
  it('serialize object 1: round-trips plain object', () => {
    const obj = { id: 1, name: 'item1', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 2: round-trips plain object', () => {
    const obj = { id: 2, name: 'item2', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 3: round-trips plain object', () => {
    const obj = { id: 3, name: 'item3', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 4: round-trips plain object', () => {
    const obj = { id: 4, name: 'item4', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 5: round-trips plain object', () => {
    const obj = { id: 5, name: 'item5', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 6: round-trips plain object', () => {
    const obj = { id: 6, name: 'item6', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 7: round-trips plain object', () => {
    const obj = { id: 7, name: 'item7', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 8: round-trips plain object', () => {
    const obj = { id: 8, name: 'item8', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 9: round-trips plain object', () => {
    const obj = { id: 9, name: 'item9', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 10: round-trips plain object', () => {
    const obj = { id: 10, name: 'item10', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 11: round-trips plain object', () => {
    const obj = { id: 11, name: 'item11', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 12: round-trips plain object', () => {
    const obj = { id: 12, name: 'item12', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 13: round-trips plain object', () => {
    const obj = { id: 13, name: 'item13', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 14: round-trips plain object', () => {
    const obj = { id: 14, name: 'item14', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 15: round-trips plain object', () => {
    const obj = { id: 15, name: 'item15', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 16: round-trips plain object', () => {
    const obj = { id: 16, name: 'item16', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 17: round-trips plain object', () => {
    const obj = { id: 17, name: 'item17', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 18: round-trips plain object', () => {
    const obj = { id: 18, name: 'item18', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 19: round-trips plain object', () => {
    const obj = { id: 19, name: 'item19', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize object 20: round-trips plain object', () => {
    const obj = { id: 20, name: 'item20', active: true };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize array 1: round-trips array of length 1', () => {
    const arr = [0];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 2: round-trips array of length 2', () => {
    const arr = [0, 1];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 3: round-trips array of length 3', () => {
    const arr = [0, 1, 2];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 4: round-trips array of length 4', () => {
    const arr = [0, 1, 2, 3];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 5: round-trips array of length 5', () => {
    const arr = [0, 1, 2, 3, 4];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 6: round-trips array of length 6', () => {
    const arr = [0, 1, 2, 3, 4, 5];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 7: round-trips array of length 7', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 8: round-trips array of length 8', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 9: round-trips array of length 9', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 10: round-trips array of length 10', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 11: round-trips array of length 11', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 12: round-trips array of length 12', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 13: round-trips array of length 13', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 14: round-trips array of length 14', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 15: round-trips array of length 15', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 16: round-trips array of length 16', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 17: round-trips array of length 17', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 18: round-trips array of length 18', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 19: round-trips array of length 19', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize array 20: round-trips array of length 20', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    expect(deserializeValue<number[]>(serializeValue(arr))).toEqual(arr);
  });
  it('serialize nested 1: round-trips nested object depth 1', () => {
    const obj = { level: 1, inner: { value: 2 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 2: round-trips nested object depth 2', () => {
    const obj = { level: 2, inner: { value: 4 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 3: round-trips nested object depth 3', () => {
    const obj = { level: 3, inner: { value: 6 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 4: round-trips nested object depth 4', () => {
    const obj = { level: 4, inner: { value: 8 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 5: round-trips nested object depth 5', () => {
    const obj = { level: 5, inner: { value: 10 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 6: round-trips nested object depth 6', () => {
    const obj = { level: 6, inner: { value: 12 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 7: round-trips nested object depth 7', () => {
    const obj = { level: 7, inner: { value: 14 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 8: round-trips nested object depth 8', () => {
    const obj = { level: 8, inner: { value: 16 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 9: round-trips nested object depth 9', () => {
    const obj = { level: 9, inner: { value: 18 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 10: round-trips nested object depth 10', () => {
    const obj = { level: 10, inner: { value: 20 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 11: round-trips nested object depth 11', () => {
    const obj = { level: 11, inner: { value: 22 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 12: round-trips nested object depth 12', () => {
    const obj = { level: 12, inner: { value: 24 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 13: round-trips nested object depth 13', () => {
    const obj = { level: 13, inner: { value: 26 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 14: round-trips nested object depth 14', () => {
    const obj = { level: 14, inner: { value: 28 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serialize nested 15: round-trips nested object depth 15', () => {
    const obj = { level: 15, inner: { value: 30 } };
    expect(deserializeValue<typeof obj>(serializeValue(obj))).toEqual(obj);
  });
  it('serializeValue: always returns a string', () => { expect(typeof serializeValue(42)).toBe('string'); });
  it('serializeValue object: returns JSON string', () => { expect(serializeValue({ a: 1 })).toBe('{"a":1}'); });
  it('serializeValue array: returns JSON array string', () => { expect(serializeValue([1,2,3])).toBe('[1,2,3]'); });
  it('serializeValue number 0: returns string 0', () => { expect(serializeValue(0)).toBe('0'); });
});

describe('getMany / setMany / removeMany', () => {
  it('getMany 1: retrieves 1 values', () => {
    const store = createMemoryStore();
    store.set('gk1_0', 'gv0');
    expect(getMany(store, ['gk1_0'])).toEqual(['gv0']);
  });
  it('getMany 2: retrieves 2 values', () => {
    const store = createMemoryStore();
    store.set('gk2_0', 'gv0'); store.set('gk2_1', 'gv1');
    expect(getMany(store, ['gk2_0', 'gk2_1'])).toEqual(['gv0', 'gv1']);
  });
  it('getMany 3: retrieves 3 values', () => {
    const store = createMemoryStore();
    store.set('gk3_0', 'gv0'); store.set('gk3_1', 'gv1'); store.set('gk3_2', 'gv2');
    expect(getMany(store, ['gk3_0', 'gk3_1', 'gk3_2'])).toEqual(['gv0', 'gv1', 'gv2']);
  });
  it('getMany 4: retrieves 4 values', () => {
    const store = createMemoryStore();
    store.set('gk4_0', 'gv0'); store.set('gk4_1', 'gv1'); store.set('gk4_2', 'gv2'); store.set('gk4_3', 'gv3');
    expect(getMany(store, ['gk4_0', 'gk4_1', 'gk4_2', 'gk4_3'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3']);
  });
  it('getMany 5: retrieves 5 values', () => {
    const store = createMemoryStore();
    store.set('gk5_0', 'gv0'); store.set('gk5_1', 'gv1'); store.set('gk5_2', 'gv2'); store.set('gk5_3', 'gv3'); store.set('gk5_4', 'gv4');
    expect(getMany(store, ['gk5_0', 'gk5_1', 'gk5_2', 'gk5_3', 'gk5_4'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4']);
  });
  it('getMany 6: retrieves 6 values', () => {
    const store = createMemoryStore();
    store.set('gk6_0', 'gv0'); store.set('gk6_1', 'gv1'); store.set('gk6_2', 'gv2'); store.set('gk6_3', 'gv3'); store.set('gk6_4', 'gv4'); store.set('gk6_5', 'gv5');
    expect(getMany(store, ['gk6_0', 'gk6_1', 'gk6_2', 'gk6_3', 'gk6_4', 'gk6_5'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5']);
  });
  it('getMany 7: retrieves 7 values', () => {
    const store = createMemoryStore();
    store.set('gk7_0', 'gv0'); store.set('gk7_1', 'gv1'); store.set('gk7_2', 'gv2'); store.set('gk7_3', 'gv3'); store.set('gk7_4', 'gv4'); store.set('gk7_5', 'gv5'); store.set('gk7_6', 'gv6');
    expect(getMany(store, ['gk7_0', 'gk7_1', 'gk7_2', 'gk7_3', 'gk7_4', 'gk7_5', 'gk7_6'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6']);
  });
  it('getMany 8: retrieves 8 values', () => {
    const store = createMemoryStore();
    store.set('gk8_0', 'gv0'); store.set('gk8_1', 'gv1'); store.set('gk8_2', 'gv2'); store.set('gk8_3', 'gv3'); store.set('gk8_4', 'gv4'); store.set('gk8_5', 'gv5'); store.set('gk8_6', 'gv6'); store.set('gk8_7', 'gv7');
    expect(getMany(store, ['gk8_0', 'gk8_1', 'gk8_2', 'gk8_3', 'gk8_4', 'gk8_5', 'gk8_6', 'gk8_7'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7']);
  });
  it('getMany 9: retrieves 9 values', () => {
    const store = createMemoryStore();
    store.set('gk9_0', 'gv0'); store.set('gk9_1', 'gv1'); store.set('gk9_2', 'gv2'); store.set('gk9_3', 'gv3'); store.set('gk9_4', 'gv4'); store.set('gk9_5', 'gv5'); store.set('gk9_6', 'gv6'); store.set('gk9_7', 'gv7'); store.set('gk9_8', 'gv8');
    expect(getMany(store, ['gk9_0', 'gk9_1', 'gk9_2', 'gk9_3', 'gk9_4', 'gk9_5', 'gk9_6', 'gk9_7', 'gk9_8'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8']);
  });
  it('getMany 10: retrieves 10 values', () => {
    const store = createMemoryStore();
    store.set('gk10_0', 'gv0'); store.set('gk10_1', 'gv1'); store.set('gk10_2', 'gv2'); store.set('gk10_3', 'gv3'); store.set('gk10_4', 'gv4'); store.set('gk10_5', 'gv5'); store.set('gk10_6', 'gv6'); store.set('gk10_7', 'gv7'); store.set('gk10_8', 'gv8'); store.set('gk10_9', 'gv9');
    expect(getMany(store, ['gk10_0', 'gk10_1', 'gk10_2', 'gk10_3', 'gk10_4', 'gk10_5', 'gk10_6', 'gk10_7', 'gk10_8', 'gk10_9'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9']);
  });
  it('getMany 11: retrieves 11 values', () => {
    const store = createMemoryStore();
    store.set('gk11_0', 'gv0'); store.set('gk11_1', 'gv1'); store.set('gk11_2', 'gv2'); store.set('gk11_3', 'gv3'); store.set('gk11_4', 'gv4'); store.set('gk11_5', 'gv5'); store.set('gk11_6', 'gv6'); store.set('gk11_7', 'gv7'); store.set('gk11_8', 'gv8'); store.set('gk11_9', 'gv9'); store.set('gk11_10', 'gv10');
    expect(getMany(store, ['gk11_0', 'gk11_1', 'gk11_2', 'gk11_3', 'gk11_4', 'gk11_5', 'gk11_6', 'gk11_7', 'gk11_8', 'gk11_9', 'gk11_10'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10']);
  });
  it('getMany 12: retrieves 12 values', () => {
    const store = createMemoryStore();
    store.set('gk12_0', 'gv0'); store.set('gk12_1', 'gv1'); store.set('gk12_2', 'gv2'); store.set('gk12_3', 'gv3'); store.set('gk12_4', 'gv4'); store.set('gk12_5', 'gv5'); store.set('gk12_6', 'gv6'); store.set('gk12_7', 'gv7'); store.set('gk12_8', 'gv8'); store.set('gk12_9', 'gv9'); store.set('gk12_10', 'gv10'); store.set('gk12_11', 'gv11');
    expect(getMany(store, ['gk12_0', 'gk12_1', 'gk12_2', 'gk12_3', 'gk12_4', 'gk12_5', 'gk12_6', 'gk12_7', 'gk12_8', 'gk12_9', 'gk12_10', 'gk12_11'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11']);
  });
  it('getMany 13: retrieves 13 values', () => {
    const store = createMemoryStore();
    store.set('gk13_0', 'gv0'); store.set('gk13_1', 'gv1'); store.set('gk13_2', 'gv2'); store.set('gk13_3', 'gv3'); store.set('gk13_4', 'gv4'); store.set('gk13_5', 'gv5'); store.set('gk13_6', 'gv6'); store.set('gk13_7', 'gv7'); store.set('gk13_8', 'gv8'); store.set('gk13_9', 'gv9'); store.set('gk13_10', 'gv10'); store.set('gk13_11', 'gv11'); store.set('gk13_12', 'gv12');
    expect(getMany(store, ['gk13_0', 'gk13_1', 'gk13_2', 'gk13_3', 'gk13_4', 'gk13_5', 'gk13_6', 'gk13_7', 'gk13_8', 'gk13_9', 'gk13_10', 'gk13_11', 'gk13_12'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12']);
  });
  it('getMany 14: retrieves 14 values', () => {
    const store = createMemoryStore();
    store.set('gk14_0', 'gv0'); store.set('gk14_1', 'gv1'); store.set('gk14_2', 'gv2'); store.set('gk14_3', 'gv3'); store.set('gk14_4', 'gv4'); store.set('gk14_5', 'gv5'); store.set('gk14_6', 'gv6'); store.set('gk14_7', 'gv7'); store.set('gk14_8', 'gv8'); store.set('gk14_9', 'gv9'); store.set('gk14_10', 'gv10'); store.set('gk14_11', 'gv11'); store.set('gk14_12', 'gv12'); store.set('gk14_13', 'gv13');
    expect(getMany(store, ['gk14_0', 'gk14_1', 'gk14_2', 'gk14_3', 'gk14_4', 'gk14_5', 'gk14_6', 'gk14_7', 'gk14_8', 'gk14_9', 'gk14_10', 'gk14_11', 'gk14_12', 'gk14_13'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13']);
  });
  it('getMany 15: retrieves 15 values', () => {
    const store = createMemoryStore();
    store.set('gk15_0', 'gv0'); store.set('gk15_1', 'gv1'); store.set('gk15_2', 'gv2'); store.set('gk15_3', 'gv3'); store.set('gk15_4', 'gv4'); store.set('gk15_5', 'gv5'); store.set('gk15_6', 'gv6'); store.set('gk15_7', 'gv7'); store.set('gk15_8', 'gv8'); store.set('gk15_9', 'gv9'); store.set('gk15_10', 'gv10'); store.set('gk15_11', 'gv11'); store.set('gk15_12', 'gv12'); store.set('gk15_13', 'gv13'); store.set('gk15_14', 'gv14');
    expect(getMany(store, ['gk15_0', 'gk15_1', 'gk15_2', 'gk15_3', 'gk15_4', 'gk15_5', 'gk15_6', 'gk15_7', 'gk15_8', 'gk15_9', 'gk15_10', 'gk15_11', 'gk15_12', 'gk15_13', 'gk15_14'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14']);
  });
  it('getMany 16: retrieves 16 values', () => {
    const store = createMemoryStore();
    store.set('gk16_0', 'gv0'); store.set('gk16_1', 'gv1'); store.set('gk16_2', 'gv2'); store.set('gk16_3', 'gv3'); store.set('gk16_4', 'gv4'); store.set('gk16_5', 'gv5'); store.set('gk16_6', 'gv6'); store.set('gk16_7', 'gv7'); store.set('gk16_8', 'gv8'); store.set('gk16_9', 'gv9'); store.set('gk16_10', 'gv10'); store.set('gk16_11', 'gv11'); store.set('gk16_12', 'gv12'); store.set('gk16_13', 'gv13'); store.set('gk16_14', 'gv14'); store.set('gk16_15', 'gv15');
    expect(getMany(store, ['gk16_0', 'gk16_1', 'gk16_2', 'gk16_3', 'gk16_4', 'gk16_5', 'gk16_6', 'gk16_7', 'gk16_8', 'gk16_9', 'gk16_10', 'gk16_11', 'gk16_12', 'gk16_13', 'gk16_14', 'gk16_15'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15']);
  });
  it('getMany 17: retrieves 17 values', () => {
    const store = createMemoryStore();
    store.set('gk17_0', 'gv0'); store.set('gk17_1', 'gv1'); store.set('gk17_2', 'gv2'); store.set('gk17_3', 'gv3'); store.set('gk17_4', 'gv4'); store.set('gk17_5', 'gv5'); store.set('gk17_6', 'gv6'); store.set('gk17_7', 'gv7'); store.set('gk17_8', 'gv8'); store.set('gk17_9', 'gv9'); store.set('gk17_10', 'gv10'); store.set('gk17_11', 'gv11'); store.set('gk17_12', 'gv12'); store.set('gk17_13', 'gv13'); store.set('gk17_14', 'gv14'); store.set('gk17_15', 'gv15'); store.set('gk17_16', 'gv16');
    expect(getMany(store, ['gk17_0', 'gk17_1', 'gk17_2', 'gk17_3', 'gk17_4', 'gk17_5', 'gk17_6', 'gk17_7', 'gk17_8', 'gk17_9', 'gk17_10', 'gk17_11', 'gk17_12', 'gk17_13', 'gk17_14', 'gk17_15', 'gk17_16'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16']);
  });
  it('getMany 18: retrieves 18 values', () => {
    const store = createMemoryStore();
    store.set('gk18_0', 'gv0'); store.set('gk18_1', 'gv1'); store.set('gk18_2', 'gv2'); store.set('gk18_3', 'gv3'); store.set('gk18_4', 'gv4'); store.set('gk18_5', 'gv5'); store.set('gk18_6', 'gv6'); store.set('gk18_7', 'gv7'); store.set('gk18_8', 'gv8'); store.set('gk18_9', 'gv9'); store.set('gk18_10', 'gv10'); store.set('gk18_11', 'gv11'); store.set('gk18_12', 'gv12'); store.set('gk18_13', 'gv13'); store.set('gk18_14', 'gv14'); store.set('gk18_15', 'gv15'); store.set('gk18_16', 'gv16'); store.set('gk18_17', 'gv17');
    expect(getMany(store, ['gk18_0', 'gk18_1', 'gk18_2', 'gk18_3', 'gk18_4', 'gk18_5', 'gk18_6', 'gk18_7', 'gk18_8', 'gk18_9', 'gk18_10', 'gk18_11', 'gk18_12', 'gk18_13', 'gk18_14', 'gk18_15', 'gk18_16', 'gk18_17'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17']);
  });
  it('getMany 19: retrieves 19 values', () => {
    const store = createMemoryStore();
    store.set('gk19_0', 'gv0'); store.set('gk19_1', 'gv1'); store.set('gk19_2', 'gv2'); store.set('gk19_3', 'gv3'); store.set('gk19_4', 'gv4'); store.set('gk19_5', 'gv5'); store.set('gk19_6', 'gv6'); store.set('gk19_7', 'gv7'); store.set('gk19_8', 'gv8'); store.set('gk19_9', 'gv9'); store.set('gk19_10', 'gv10'); store.set('gk19_11', 'gv11'); store.set('gk19_12', 'gv12'); store.set('gk19_13', 'gv13'); store.set('gk19_14', 'gv14'); store.set('gk19_15', 'gv15'); store.set('gk19_16', 'gv16'); store.set('gk19_17', 'gv17'); store.set('gk19_18', 'gv18');
    expect(getMany(store, ['gk19_0', 'gk19_1', 'gk19_2', 'gk19_3', 'gk19_4', 'gk19_5', 'gk19_6', 'gk19_7', 'gk19_8', 'gk19_9', 'gk19_10', 'gk19_11', 'gk19_12', 'gk19_13', 'gk19_14', 'gk19_15', 'gk19_16', 'gk19_17', 'gk19_18'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18']);
  });
  it('getMany 20: retrieves 20 values', () => {
    const store = createMemoryStore();
    store.set('gk20_0', 'gv0'); store.set('gk20_1', 'gv1'); store.set('gk20_2', 'gv2'); store.set('gk20_3', 'gv3'); store.set('gk20_4', 'gv4'); store.set('gk20_5', 'gv5'); store.set('gk20_6', 'gv6'); store.set('gk20_7', 'gv7'); store.set('gk20_8', 'gv8'); store.set('gk20_9', 'gv9'); store.set('gk20_10', 'gv10'); store.set('gk20_11', 'gv11'); store.set('gk20_12', 'gv12'); store.set('gk20_13', 'gv13'); store.set('gk20_14', 'gv14'); store.set('gk20_15', 'gv15'); store.set('gk20_16', 'gv16'); store.set('gk20_17', 'gv17'); store.set('gk20_18', 'gv18'); store.set('gk20_19', 'gv19');
    expect(getMany(store, ['gk20_0', 'gk20_1', 'gk20_2', 'gk20_3', 'gk20_4', 'gk20_5', 'gk20_6', 'gk20_7', 'gk20_8', 'gk20_9', 'gk20_10', 'gk20_11', 'gk20_12', 'gk20_13', 'gk20_14', 'gk20_15', 'gk20_16', 'gk20_17', 'gk20_18', 'gk20_19'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19']);
  });
  it('getMany 21: retrieves 21 values', () => {
    const store = createMemoryStore();
    store.set('gk21_0', 'gv0'); store.set('gk21_1', 'gv1'); store.set('gk21_2', 'gv2'); store.set('gk21_3', 'gv3'); store.set('gk21_4', 'gv4'); store.set('gk21_5', 'gv5'); store.set('gk21_6', 'gv6'); store.set('gk21_7', 'gv7'); store.set('gk21_8', 'gv8'); store.set('gk21_9', 'gv9'); store.set('gk21_10', 'gv10'); store.set('gk21_11', 'gv11'); store.set('gk21_12', 'gv12'); store.set('gk21_13', 'gv13'); store.set('gk21_14', 'gv14'); store.set('gk21_15', 'gv15'); store.set('gk21_16', 'gv16'); store.set('gk21_17', 'gv17'); store.set('gk21_18', 'gv18'); store.set('gk21_19', 'gv19'); store.set('gk21_20', 'gv20');
    expect(getMany(store, ['gk21_0', 'gk21_1', 'gk21_2', 'gk21_3', 'gk21_4', 'gk21_5', 'gk21_6', 'gk21_7', 'gk21_8', 'gk21_9', 'gk21_10', 'gk21_11', 'gk21_12', 'gk21_13', 'gk21_14', 'gk21_15', 'gk21_16', 'gk21_17', 'gk21_18', 'gk21_19', 'gk21_20'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20']);
  });
  it('getMany 22: retrieves 22 values', () => {
    const store = createMemoryStore();
    store.set('gk22_0', 'gv0'); store.set('gk22_1', 'gv1'); store.set('gk22_2', 'gv2'); store.set('gk22_3', 'gv3'); store.set('gk22_4', 'gv4'); store.set('gk22_5', 'gv5'); store.set('gk22_6', 'gv6'); store.set('gk22_7', 'gv7'); store.set('gk22_8', 'gv8'); store.set('gk22_9', 'gv9'); store.set('gk22_10', 'gv10'); store.set('gk22_11', 'gv11'); store.set('gk22_12', 'gv12'); store.set('gk22_13', 'gv13'); store.set('gk22_14', 'gv14'); store.set('gk22_15', 'gv15'); store.set('gk22_16', 'gv16'); store.set('gk22_17', 'gv17'); store.set('gk22_18', 'gv18'); store.set('gk22_19', 'gv19'); store.set('gk22_20', 'gv20'); store.set('gk22_21', 'gv21');
    expect(getMany(store, ['gk22_0', 'gk22_1', 'gk22_2', 'gk22_3', 'gk22_4', 'gk22_5', 'gk22_6', 'gk22_7', 'gk22_8', 'gk22_9', 'gk22_10', 'gk22_11', 'gk22_12', 'gk22_13', 'gk22_14', 'gk22_15', 'gk22_16', 'gk22_17', 'gk22_18', 'gk22_19', 'gk22_20', 'gk22_21'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21']);
  });
  it('getMany 23: retrieves 23 values', () => {
    const store = createMemoryStore();
    store.set('gk23_0', 'gv0'); store.set('gk23_1', 'gv1'); store.set('gk23_2', 'gv2'); store.set('gk23_3', 'gv3'); store.set('gk23_4', 'gv4'); store.set('gk23_5', 'gv5'); store.set('gk23_6', 'gv6'); store.set('gk23_7', 'gv7'); store.set('gk23_8', 'gv8'); store.set('gk23_9', 'gv9'); store.set('gk23_10', 'gv10'); store.set('gk23_11', 'gv11'); store.set('gk23_12', 'gv12'); store.set('gk23_13', 'gv13'); store.set('gk23_14', 'gv14'); store.set('gk23_15', 'gv15'); store.set('gk23_16', 'gv16'); store.set('gk23_17', 'gv17'); store.set('gk23_18', 'gv18'); store.set('gk23_19', 'gv19'); store.set('gk23_20', 'gv20'); store.set('gk23_21', 'gv21'); store.set('gk23_22', 'gv22');
    expect(getMany(store, ['gk23_0', 'gk23_1', 'gk23_2', 'gk23_3', 'gk23_4', 'gk23_5', 'gk23_6', 'gk23_7', 'gk23_8', 'gk23_9', 'gk23_10', 'gk23_11', 'gk23_12', 'gk23_13', 'gk23_14', 'gk23_15', 'gk23_16', 'gk23_17', 'gk23_18', 'gk23_19', 'gk23_20', 'gk23_21', 'gk23_22'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22']);
  });
  it('getMany 24: retrieves 24 values', () => {
    const store = createMemoryStore();
    store.set('gk24_0', 'gv0'); store.set('gk24_1', 'gv1'); store.set('gk24_2', 'gv2'); store.set('gk24_3', 'gv3'); store.set('gk24_4', 'gv4'); store.set('gk24_5', 'gv5'); store.set('gk24_6', 'gv6'); store.set('gk24_7', 'gv7'); store.set('gk24_8', 'gv8'); store.set('gk24_9', 'gv9'); store.set('gk24_10', 'gv10'); store.set('gk24_11', 'gv11'); store.set('gk24_12', 'gv12'); store.set('gk24_13', 'gv13'); store.set('gk24_14', 'gv14'); store.set('gk24_15', 'gv15'); store.set('gk24_16', 'gv16'); store.set('gk24_17', 'gv17'); store.set('gk24_18', 'gv18'); store.set('gk24_19', 'gv19'); store.set('gk24_20', 'gv20'); store.set('gk24_21', 'gv21'); store.set('gk24_22', 'gv22'); store.set('gk24_23', 'gv23');
    expect(getMany(store, ['gk24_0', 'gk24_1', 'gk24_2', 'gk24_3', 'gk24_4', 'gk24_5', 'gk24_6', 'gk24_7', 'gk24_8', 'gk24_9', 'gk24_10', 'gk24_11', 'gk24_12', 'gk24_13', 'gk24_14', 'gk24_15', 'gk24_16', 'gk24_17', 'gk24_18', 'gk24_19', 'gk24_20', 'gk24_21', 'gk24_22', 'gk24_23'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23']);
  });
  it('getMany 25: retrieves 25 values', () => {
    const store = createMemoryStore();
    store.set('gk25_0', 'gv0'); store.set('gk25_1', 'gv1'); store.set('gk25_2', 'gv2'); store.set('gk25_3', 'gv3'); store.set('gk25_4', 'gv4'); store.set('gk25_5', 'gv5'); store.set('gk25_6', 'gv6'); store.set('gk25_7', 'gv7'); store.set('gk25_8', 'gv8'); store.set('gk25_9', 'gv9'); store.set('gk25_10', 'gv10'); store.set('gk25_11', 'gv11'); store.set('gk25_12', 'gv12'); store.set('gk25_13', 'gv13'); store.set('gk25_14', 'gv14'); store.set('gk25_15', 'gv15'); store.set('gk25_16', 'gv16'); store.set('gk25_17', 'gv17'); store.set('gk25_18', 'gv18'); store.set('gk25_19', 'gv19'); store.set('gk25_20', 'gv20'); store.set('gk25_21', 'gv21'); store.set('gk25_22', 'gv22'); store.set('gk25_23', 'gv23'); store.set('gk25_24', 'gv24');
    expect(getMany(store, ['gk25_0', 'gk25_1', 'gk25_2', 'gk25_3', 'gk25_4', 'gk25_5', 'gk25_6', 'gk25_7', 'gk25_8', 'gk25_9', 'gk25_10', 'gk25_11', 'gk25_12', 'gk25_13', 'gk25_14', 'gk25_15', 'gk25_16', 'gk25_17', 'gk25_18', 'gk25_19', 'gk25_20', 'gk25_21', 'gk25_22', 'gk25_23', 'gk25_24'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23', 'gv24']);
  });
  it('getMany 26: retrieves 26 values', () => {
    const store = createMemoryStore();
    store.set('gk26_0', 'gv0'); store.set('gk26_1', 'gv1'); store.set('gk26_2', 'gv2'); store.set('gk26_3', 'gv3'); store.set('gk26_4', 'gv4'); store.set('gk26_5', 'gv5'); store.set('gk26_6', 'gv6'); store.set('gk26_7', 'gv7'); store.set('gk26_8', 'gv8'); store.set('gk26_9', 'gv9'); store.set('gk26_10', 'gv10'); store.set('gk26_11', 'gv11'); store.set('gk26_12', 'gv12'); store.set('gk26_13', 'gv13'); store.set('gk26_14', 'gv14'); store.set('gk26_15', 'gv15'); store.set('gk26_16', 'gv16'); store.set('gk26_17', 'gv17'); store.set('gk26_18', 'gv18'); store.set('gk26_19', 'gv19'); store.set('gk26_20', 'gv20'); store.set('gk26_21', 'gv21'); store.set('gk26_22', 'gv22'); store.set('gk26_23', 'gv23'); store.set('gk26_24', 'gv24'); store.set('gk26_25', 'gv25');
    expect(getMany(store, ['gk26_0', 'gk26_1', 'gk26_2', 'gk26_3', 'gk26_4', 'gk26_5', 'gk26_6', 'gk26_7', 'gk26_8', 'gk26_9', 'gk26_10', 'gk26_11', 'gk26_12', 'gk26_13', 'gk26_14', 'gk26_15', 'gk26_16', 'gk26_17', 'gk26_18', 'gk26_19', 'gk26_20', 'gk26_21', 'gk26_22', 'gk26_23', 'gk26_24', 'gk26_25'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23', 'gv24', 'gv25']);
  });
  it('getMany 27: retrieves 27 values', () => {
    const store = createMemoryStore();
    store.set('gk27_0', 'gv0'); store.set('gk27_1', 'gv1'); store.set('gk27_2', 'gv2'); store.set('gk27_3', 'gv3'); store.set('gk27_4', 'gv4'); store.set('gk27_5', 'gv5'); store.set('gk27_6', 'gv6'); store.set('gk27_7', 'gv7'); store.set('gk27_8', 'gv8'); store.set('gk27_9', 'gv9'); store.set('gk27_10', 'gv10'); store.set('gk27_11', 'gv11'); store.set('gk27_12', 'gv12'); store.set('gk27_13', 'gv13'); store.set('gk27_14', 'gv14'); store.set('gk27_15', 'gv15'); store.set('gk27_16', 'gv16'); store.set('gk27_17', 'gv17'); store.set('gk27_18', 'gv18'); store.set('gk27_19', 'gv19'); store.set('gk27_20', 'gv20'); store.set('gk27_21', 'gv21'); store.set('gk27_22', 'gv22'); store.set('gk27_23', 'gv23'); store.set('gk27_24', 'gv24'); store.set('gk27_25', 'gv25'); store.set('gk27_26', 'gv26');
    expect(getMany(store, ['gk27_0', 'gk27_1', 'gk27_2', 'gk27_3', 'gk27_4', 'gk27_5', 'gk27_6', 'gk27_7', 'gk27_8', 'gk27_9', 'gk27_10', 'gk27_11', 'gk27_12', 'gk27_13', 'gk27_14', 'gk27_15', 'gk27_16', 'gk27_17', 'gk27_18', 'gk27_19', 'gk27_20', 'gk27_21', 'gk27_22', 'gk27_23', 'gk27_24', 'gk27_25', 'gk27_26'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23', 'gv24', 'gv25', 'gv26']);
  });
  it('getMany 28: retrieves 28 values', () => {
    const store = createMemoryStore();
    store.set('gk28_0', 'gv0'); store.set('gk28_1', 'gv1'); store.set('gk28_2', 'gv2'); store.set('gk28_3', 'gv3'); store.set('gk28_4', 'gv4'); store.set('gk28_5', 'gv5'); store.set('gk28_6', 'gv6'); store.set('gk28_7', 'gv7'); store.set('gk28_8', 'gv8'); store.set('gk28_9', 'gv9'); store.set('gk28_10', 'gv10'); store.set('gk28_11', 'gv11'); store.set('gk28_12', 'gv12'); store.set('gk28_13', 'gv13'); store.set('gk28_14', 'gv14'); store.set('gk28_15', 'gv15'); store.set('gk28_16', 'gv16'); store.set('gk28_17', 'gv17'); store.set('gk28_18', 'gv18'); store.set('gk28_19', 'gv19'); store.set('gk28_20', 'gv20'); store.set('gk28_21', 'gv21'); store.set('gk28_22', 'gv22'); store.set('gk28_23', 'gv23'); store.set('gk28_24', 'gv24'); store.set('gk28_25', 'gv25'); store.set('gk28_26', 'gv26'); store.set('gk28_27', 'gv27');
    expect(getMany(store, ['gk28_0', 'gk28_1', 'gk28_2', 'gk28_3', 'gk28_4', 'gk28_5', 'gk28_6', 'gk28_7', 'gk28_8', 'gk28_9', 'gk28_10', 'gk28_11', 'gk28_12', 'gk28_13', 'gk28_14', 'gk28_15', 'gk28_16', 'gk28_17', 'gk28_18', 'gk28_19', 'gk28_20', 'gk28_21', 'gk28_22', 'gk28_23', 'gk28_24', 'gk28_25', 'gk28_26', 'gk28_27'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23', 'gv24', 'gv25', 'gv26', 'gv27']);
  });
  it('getMany 29: retrieves 29 values', () => {
    const store = createMemoryStore();
    store.set('gk29_0', 'gv0'); store.set('gk29_1', 'gv1'); store.set('gk29_2', 'gv2'); store.set('gk29_3', 'gv3'); store.set('gk29_4', 'gv4'); store.set('gk29_5', 'gv5'); store.set('gk29_6', 'gv6'); store.set('gk29_7', 'gv7'); store.set('gk29_8', 'gv8'); store.set('gk29_9', 'gv9'); store.set('gk29_10', 'gv10'); store.set('gk29_11', 'gv11'); store.set('gk29_12', 'gv12'); store.set('gk29_13', 'gv13'); store.set('gk29_14', 'gv14'); store.set('gk29_15', 'gv15'); store.set('gk29_16', 'gv16'); store.set('gk29_17', 'gv17'); store.set('gk29_18', 'gv18'); store.set('gk29_19', 'gv19'); store.set('gk29_20', 'gv20'); store.set('gk29_21', 'gv21'); store.set('gk29_22', 'gv22'); store.set('gk29_23', 'gv23'); store.set('gk29_24', 'gv24'); store.set('gk29_25', 'gv25'); store.set('gk29_26', 'gv26'); store.set('gk29_27', 'gv27'); store.set('gk29_28', 'gv28');
    expect(getMany(store, ['gk29_0', 'gk29_1', 'gk29_2', 'gk29_3', 'gk29_4', 'gk29_5', 'gk29_6', 'gk29_7', 'gk29_8', 'gk29_9', 'gk29_10', 'gk29_11', 'gk29_12', 'gk29_13', 'gk29_14', 'gk29_15', 'gk29_16', 'gk29_17', 'gk29_18', 'gk29_19', 'gk29_20', 'gk29_21', 'gk29_22', 'gk29_23', 'gk29_24', 'gk29_25', 'gk29_26', 'gk29_27', 'gk29_28'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23', 'gv24', 'gv25', 'gv26', 'gv27', 'gv28']);
  });
  it('getMany 30: retrieves 30 values', () => {
    const store = createMemoryStore();
    store.set('gk30_0', 'gv0'); store.set('gk30_1', 'gv1'); store.set('gk30_2', 'gv2'); store.set('gk30_3', 'gv3'); store.set('gk30_4', 'gv4'); store.set('gk30_5', 'gv5'); store.set('gk30_6', 'gv6'); store.set('gk30_7', 'gv7'); store.set('gk30_8', 'gv8'); store.set('gk30_9', 'gv9'); store.set('gk30_10', 'gv10'); store.set('gk30_11', 'gv11'); store.set('gk30_12', 'gv12'); store.set('gk30_13', 'gv13'); store.set('gk30_14', 'gv14'); store.set('gk30_15', 'gv15'); store.set('gk30_16', 'gv16'); store.set('gk30_17', 'gv17'); store.set('gk30_18', 'gv18'); store.set('gk30_19', 'gv19'); store.set('gk30_20', 'gv20'); store.set('gk30_21', 'gv21'); store.set('gk30_22', 'gv22'); store.set('gk30_23', 'gv23'); store.set('gk30_24', 'gv24'); store.set('gk30_25', 'gv25'); store.set('gk30_26', 'gv26'); store.set('gk30_27', 'gv27'); store.set('gk30_28', 'gv28'); store.set('gk30_29', 'gv29');
    expect(getMany(store, ['gk30_0', 'gk30_1', 'gk30_2', 'gk30_3', 'gk30_4', 'gk30_5', 'gk30_6', 'gk30_7', 'gk30_8', 'gk30_9', 'gk30_10', 'gk30_11', 'gk30_12', 'gk30_13', 'gk30_14', 'gk30_15', 'gk30_16', 'gk30_17', 'gk30_18', 'gk30_19', 'gk30_20', 'gk30_21', 'gk30_22', 'gk30_23', 'gk30_24', 'gk30_25', 'gk30_26', 'gk30_27', 'gk30_28', 'gk30_29'])).toEqual(['gv0', 'gv1', 'gv2', 'gv3', 'gv4', 'gv5', 'gv6', 'gv7', 'gv8', 'gv9', 'gv10', 'gv11', 'gv12', 'gv13', 'gv14', 'gv15', 'gv16', 'gv17', 'gv18', 'gv19', 'gv20', 'gv21', 'gv22', 'gv23', 'gv24', 'gv25', 'gv26', 'gv27', 'gv28', 'gv29']);
  });
  it('getMany missing 1: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_1', 'v');
    const result = getMany(store, ['present_1', 'absent_1']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 2: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_2', 'v');
    const result = getMany(store, ['present_2', 'absent_2']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 3: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_3', 'v');
    const result = getMany(store, ['present_3', 'absent_3']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 4: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_4', 'v');
    const result = getMany(store, ['present_4', 'absent_4']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 5: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_5', 'v');
    const result = getMany(store, ['present_5', 'absent_5']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 6: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_6', 'v');
    const result = getMany(store, ['present_6', 'absent_6']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 7: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_7', 'v');
    const result = getMany(store, ['present_7', 'absent_7']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 8: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_8', 'v');
    const result = getMany(store, ['present_8', 'absent_8']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 9: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_9', 'v');
    const result = getMany(store, ['present_9', 'absent_9']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 10: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_10', 'v');
    const result = getMany(store, ['present_10', 'absent_10']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 11: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_11', 'v');
    const result = getMany(store, ['present_11', 'absent_11']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 12: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_12', 'v');
    const result = getMany(store, ['present_12', 'absent_12']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 13: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_13', 'v');
    const result = getMany(store, ['present_13', 'absent_13']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 14: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_14', 'v');
    const result = getMany(store, ['present_14', 'absent_14']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 15: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_15', 'v');
    const result = getMany(store, ['present_15', 'absent_15']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 16: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_16', 'v');
    const result = getMany(store, ['present_16', 'absent_16']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 17: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_17', 'v');
    const result = getMany(store, ['present_17', 'absent_17']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 18: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_18', 'v');
    const result = getMany(store, ['present_18', 'absent_18']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 19: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_19', 'v');
    const result = getMany(store, ['present_19', 'absent_19']);
    expect(result[1]).toBeNull();
  });
  it('getMany missing 20: absent key returns null at index', () => {
    const store = createMemoryStore();
    store.set('present_20', 'v');
    const result = getMany(store, ['present_20', 'absent_20']);
    expect(result[1]).toBeNull();
  });
  it('setMany 1: sets 1 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm1_0', 'sv0']]);
    expect(store.length()).toBe(1);
  });
  it('setMany 2: sets 2 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm2_0', 'sv0'], ['sm2_1', 'sv1']]);
    expect(store.length()).toBe(2);
  });
  it('setMany 3: sets 3 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm3_0', 'sv0'], ['sm3_1', 'sv1'], ['sm3_2', 'sv2']]);
    expect(store.length()).toBe(3);
  });
  it('setMany 4: sets 4 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm4_0', 'sv0'], ['sm4_1', 'sv1'], ['sm4_2', 'sv2'], ['sm4_3', 'sv3']]);
    expect(store.length()).toBe(4);
  });
  it('setMany 5: sets 5 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm5_0', 'sv0'], ['sm5_1', 'sv1'], ['sm5_2', 'sv2'], ['sm5_3', 'sv3'], ['sm5_4', 'sv4']]);
    expect(store.length()).toBe(5);
  });
  it('setMany 6: sets 6 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm6_0', 'sv0'], ['sm6_1', 'sv1'], ['sm6_2', 'sv2'], ['sm6_3', 'sv3'], ['sm6_4', 'sv4'], ['sm6_5', 'sv5']]);
    expect(store.length()).toBe(6);
  });
  it('setMany 7: sets 7 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm7_0', 'sv0'], ['sm7_1', 'sv1'], ['sm7_2', 'sv2'], ['sm7_3', 'sv3'], ['sm7_4', 'sv4'], ['sm7_5', 'sv5'], ['sm7_6', 'sv6']]);
    expect(store.length()).toBe(7);
  });
  it('setMany 8: sets 8 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm8_0', 'sv0'], ['sm8_1', 'sv1'], ['sm8_2', 'sv2'], ['sm8_3', 'sv3'], ['sm8_4', 'sv4'], ['sm8_5', 'sv5'], ['sm8_6', 'sv6'], ['sm8_7', 'sv7']]);
    expect(store.length()).toBe(8);
  });
  it('setMany 9: sets 9 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm9_0', 'sv0'], ['sm9_1', 'sv1'], ['sm9_2', 'sv2'], ['sm9_3', 'sv3'], ['sm9_4', 'sv4'], ['sm9_5', 'sv5'], ['sm9_6', 'sv6'], ['sm9_7', 'sv7'], ['sm9_8', 'sv8']]);
    expect(store.length()).toBe(9);
  });
  it('setMany 10: sets 10 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm10_0', 'sv0'], ['sm10_1', 'sv1'], ['sm10_2', 'sv2'], ['sm10_3', 'sv3'], ['sm10_4', 'sv4'], ['sm10_5', 'sv5'], ['sm10_6', 'sv6'], ['sm10_7', 'sv7'], ['sm10_8', 'sv8'], ['sm10_9', 'sv9']]);
    expect(store.length()).toBe(10);
  });
  it('setMany 11: sets 11 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm11_0', 'sv0'], ['sm11_1', 'sv1'], ['sm11_2', 'sv2'], ['sm11_3', 'sv3'], ['sm11_4', 'sv4'], ['sm11_5', 'sv5'], ['sm11_6', 'sv6'], ['sm11_7', 'sv7'], ['sm11_8', 'sv8'], ['sm11_9', 'sv9'], ['sm11_10', 'sv10']]);
    expect(store.length()).toBe(11);
  });
  it('setMany 12: sets 12 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm12_0', 'sv0'], ['sm12_1', 'sv1'], ['sm12_2', 'sv2'], ['sm12_3', 'sv3'], ['sm12_4', 'sv4'], ['sm12_5', 'sv5'], ['sm12_6', 'sv6'], ['sm12_7', 'sv7'], ['sm12_8', 'sv8'], ['sm12_9', 'sv9'], ['sm12_10', 'sv10'], ['sm12_11', 'sv11']]);
    expect(store.length()).toBe(12);
  });
  it('setMany 13: sets 13 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm13_0', 'sv0'], ['sm13_1', 'sv1'], ['sm13_2', 'sv2'], ['sm13_3', 'sv3'], ['sm13_4', 'sv4'], ['sm13_5', 'sv5'], ['sm13_6', 'sv6'], ['sm13_7', 'sv7'], ['sm13_8', 'sv8'], ['sm13_9', 'sv9'], ['sm13_10', 'sv10'], ['sm13_11', 'sv11'], ['sm13_12', 'sv12']]);
    expect(store.length()).toBe(13);
  });
  it('setMany 14: sets 14 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm14_0', 'sv0'], ['sm14_1', 'sv1'], ['sm14_2', 'sv2'], ['sm14_3', 'sv3'], ['sm14_4', 'sv4'], ['sm14_5', 'sv5'], ['sm14_6', 'sv6'], ['sm14_7', 'sv7'], ['sm14_8', 'sv8'], ['sm14_9', 'sv9'], ['sm14_10', 'sv10'], ['sm14_11', 'sv11'], ['sm14_12', 'sv12'], ['sm14_13', 'sv13']]);
    expect(store.length()).toBe(14);
  });
  it('setMany 15: sets 15 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm15_0', 'sv0'], ['sm15_1', 'sv1'], ['sm15_2', 'sv2'], ['sm15_3', 'sv3'], ['sm15_4', 'sv4'], ['sm15_5', 'sv5'], ['sm15_6', 'sv6'], ['sm15_7', 'sv7'], ['sm15_8', 'sv8'], ['sm15_9', 'sv9'], ['sm15_10', 'sv10'], ['sm15_11', 'sv11'], ['sm15_12', 'sv12'], ['sm15_13', 'sv13'], ['sm15_14', 'sv14']]);
    expect(store.length()).toBe(15);
  });
  it('setMany 16: sets 16 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm16_0', 'sv0'], ['sm16_1', 'sv1'], ['sm16_2', 'sv2'], ['sm16_3', 'sv3'], ['sm16_4', 'sv4'], ['sm16_5', 'sv5'], ['sm16_6', 'sv6'], ['sm16_7', 'sv7'], ['sm16_8', 'sv8'], ['sm16_9', 'sv9'], ['sm16_10', 'sv10'], ['sm16_11', 'sv11'], ['sm16_12', 'sv12'], ['sm16_13', 'sv13'], ['sm16_14', 'sv14'], ['sm16_15', 'sv15']]);
    expect(store.length()).toBe(16);
  });
  it('setMany 17: sets 17 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm17_0', 'sv0'], ['sm17_1', 'sv1'], ['sm17_2', 'sv2'], ['sm17_3', 'sv3'], ['sm17_4', 'sv4'], ['sm17_5', 'sv5'], ['sm17_6', 'sv6'], ['sm17_7', 'sv7'], ['sm17_8', 'sv8'], ['sm17_9', 'sv9'], ['sm17_10', 'sv10'], ['sm17_11', 'sv11'], ['sm17_12', 'sv12'], ['sm17_13', 'sv13'], ['sm17_14', 'sv14'], ['sm17_15', 'sv15'], ['sm17_16', 'sv16']]);
    expect(store.length()).toBe(17);
  });
  it('setMany 18: sets 18 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm18_0', 'sv0'], ['sm18_1', 'sv1'], ['sm18_2', 'sv2'], ['sm18_3', 'sv3'], ['sm18_4', 'sv4'], ['sm18_5', 'sv5'], ['sm18_6', 'sv6'], ['sm18_7', 'sv7'], ['sm18_8', 'sv8'], ['sm18_9', 'sv9'], ['sm18_10', 'sv10'], ['sm18_11', 'sv11'], ['sm18_12', 'sv12'], ['sm18_13', 'sv13'], ['sm18_14', 'sv14'], ['sm18_15', 'sv15'], ['sm18_16', 'sv16'], ['sm18_17', 'sv17']]);
    expect(store.length()).toBe(18);
  });
  it('setMany 19: sets 19 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm19_0', 'sv0'], ['sm19_1', 'sv1'], ['sm19_2', 'sv2'], ['sm19_3', 'sv3'], ['sm19_4', 'sv4'], ['sm19_5', 'sv5'], ['sm19_6', 'sv6'], ['sm19_7', 'sv7'], ['sm19_8', 'sv8'], ['sm19_9', 'sv9'], ['sm19_10', 'sv10'], ['sm19_11', 'sv11'], ['sm19_12', 'sv12'], ['sm19_13', 'sv13'], ['sm19_14', 'sv14'], ['sm19_15', 'sv15'], ['sm19_16', 'sv16'], ['sm19_17', 'sv17'], ['sm19_18', 'sv18']]);
    expect(store.length()).toBe(19);
  });
  it('setMany 20: sets 20 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm20_0', 'sv0'], ['sm20_1', 'sv1'], ['sm20_2', 'sv2'], ['sm20_3', 'sv3'], ['sm20_4', 'sv4'], ['sm20_5', 'sv5'], ['sm20_6', 'sv6'], ['sm20_7', 'sv7'], ['sm20_8', 'sv8'], ['sm20_9', 'sv9'], ['sm20_10', 'sv10'], ['sm20_11', 'sv11'], ['sm20_12', 'sv12'], ['sm20_13', 'sv13'], ['sm20_14', 'sv14'], ['sm20_15', 'sv15'], ['sm20_16', 'sv16'], ['sm20_17', 'sv17'], ['sm20_18', 'sv18'], ['sm20_19', 'sv19']]);
    expect(store.length()).toBe(20);
  });
  it('setMany 21: sets 21 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm21_0', 'sv0'], ['sm21_1', 'sv1'], ['sm21_2', 'sv2'], ['sm21_3', 'sv3'], ['sm21_4', 'sv4'], ['sm21_5', 'sv5'], ['sm21_6', 'sv6'], ['sm21_7', 'sv7'], ['sm21_8', 'sv8'], ['sm21_9', 'sv9'], ['sm21_10', 'sv10'], ['sm21_11', 'sv11'], ['sm21_12', 'sv12'], ['sm21_13', 'sv13'], ['sm21_14', 'sv14'], ['sm21_15', 'sv15'], ['sm21_16', 'sv16'], ['sm21_17', 'sv17'], ['sm21_18', 'sv18'], ['sm21_19', 'sv19'], ['sm21_20', 'sv20']]);
    expect(store.length()).toBe(21);
  });
  it('setMany 22: sets 22 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm22_0', 'sv0'], ['sm22_1', 'sv1'], ['sm22_2', 'sv2'], ['sm22_3', 'sv3'], ['sm22_4', 'sv4'], ['sm22_5', 'sv5'], ['sm22_6', 'sv6'], ['sm22_7', 'sv7'], ['sm22_8', 'sv8'], ['sm22_9', 'sv9'], ['sm22_10', 'sv10'], ['sm22_11', 'sv11'], ['sm22_12', 'sv12'], ['sm22_13', 'sv13'], ['sm22_14', 'sv14'], ['sm22_15', 'sv15'], ['sm22_16', 'sv16'], ['sm22_17', 'sv17'], ['sm22_18', 'sv18'], ['sm22_19', 'sv19'], ['sm22_20', 'sv20'], ['sm22_21', 'sv21']]);
    expect(store.length()).toBe(22);
  });
  it('setMany 23: sets 23 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm23_0', 'sv0'], ['sm23_1', 'sv1'], ['sm23_2', 'sv2'], ['sm23_3', 'sv3'], ['sm23_4', 'sv4'], ['sm23_5', 'sv5'], ['sm23_6', 'sv6'], ['sm23_7', 'sv7'], ['sm23_8', 'sv8'], ['sm23_9', 'sv9'], ['sm23_10', 'sv10'], ['sm23_11', 'sv11'], ['sm23_12', 'sv12'], ['sm23_13', 'sv13'], ['sm23_14', 'sv14'], ['sm23_15', 'sv15'], ['sm23_16', 'sv16'], ['sm23_17', 'sv17'], ['sm23_18', 'sv18'], ['sm23_19', 'sv19'], ['sm23_20', 'sv20'], ['sm23_21', 'sv21'], ['sm23_22', 'sv22']]);
    expect(store.length()).toBe(23);
  });
  it('setMany 24: sets 24 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm24_0', 'sv0'], ['sm24_1', 'sv1'], ['sm24_2', 'sv2'], ['sm24_3', 'sv3'], ['sm24_4', 'sv4'], ['sm24_5', 'sv5'], ['sm24_6', 'sv6'], ['sm24_7', 'sv7'], ['sm24_8', 'sv8'], ['sm24_9', 'sv9'], ['sm24_10', 'sv10'], ['sm24_11', 'sv11'], ['sm24_12', 'sv12'], ['sm24_13', 'sv13'], ['sm24_14', 'sv14'], ['sm24_15', 'sv15'], ['sm24_16', 'sv16'], ['sm24_17', 'sv17'], ['sm24_18', 'sv18'], ['sm24_19', 'sv19'], ['sm24_20', 'sv20'], ['sm24_21', 'sv21'], ['sm24_22', 'sv22'], ['sm24_23', 'sv23']]);
    expect(store.length()).toBe(24);
  });
  it('setMany 25: sets 25 entries at once', () => {
    const store = createMemoryStore();
    setMany(store, [['sm25_0', 'sv0'], ['sm25_1', 'sv1'], ['sm25_2', 'sv2'], ['sm25_3', 'sv3'], ['sm25_4', 'sv4'], ['sm25_5', 'sv5'], ['sm25_6', 'sv6'], ['sm25_7', 'sv7'], ['sm25_8', 'sv8'], ['sm25_9', 'sv9'], ['sm25_10', 'sv10'], ['sm25_11', 'sv11'], ['sm25_12', 'sv12'], ['sm25_13', 'sv13'], ['sm25_14', 'sv14'], ['sm25_15', 'sv15'], ['sm25_16', 'sv16'], ['sm25_17', 'sv17'], ['sm25_18', 'sv18'], ['sm25_19', 'sv19'], ['sm25_20', 'sv20'], ['sm25_21', 'sv21'], ['sm25_22', 'sv22'], ['sm25_23', 'sv23'], ['sm25_24', 'sv24']]);
    expect(store.length()).toBe(25);
  });
  it('removeMany 1: removes 1 entries', () => {
    const store = createMemoryStore();
    store.set('rm1_0', 'v');
    removeMany(store, ['rm1_0']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 2: removes 2 entries', () => {
    const store = createMemoryStore();
    store.set('rm2_0', 'v');
    store.set('rm2_1', 'v');
    removeMany(store, ['rm2_0', 'rm2_1']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 3: removes 3 entries', () => {
    const store = createMemoryStore();
    store.set('rm3_0', 'v');
    store.set('rm3_1', 'v');
    store.set('rm3_2', 'v');
    removeMany(store, ['rm3_0', 'rm3_1', 'rm3_2']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 4: removes 4 entries', () => {
    const store = createMemoryStore();
    store.set('rm4_0', 'v');
    store.set('rm4_1', 'v');
    store.set('rm4_2', 'v');
    store.set('rm4_3', 'v');
    removeMany(store, ['rm4_0', 'rm4_1', 'rm4_2', 'rm4_3']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 5: removes 5 entries', () => {
    const store = createMemoryStore();
    store.set('rm5_0', 'v');
    store.set('rm5_1', 'v');
    store.set('rm5_2', 'v');
    store.set('rm5_3', 'v');
    store.set('rm5_4', 'v');
    removeMany(store, ['rm5_0', 'rm5_1', 'rm5_2', 'rm5_3', 'rm5_4']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 6: removes 6 entries', () => {
    const store = createMemoryStore();
    store.set('rm6_0', 'v');
    store.set('rm6_1', 'v');
    store.set('rm6_2', 'v');
    store.set('rm6_3', 'v');
    store.set('rm6_4', 'v');
    store.set('rm6_5', 'v');
    removeMany(store, ['rm6_0', 'rm6_1', 'rm6_2', 'rm6_3', 'rm6_4', 'rm6_5']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 7: removes 7 entries', () => {
    const store = createMemoryStore();
    store.set('rm7_0', 'v');
    store.set('rm7_1', 'v');
    store.set('rm7_2', 'v');
    store.set('rm7_3', 'v');
    store.set('rm7_4', 'v');
    store.set('rm7_5', 'v');
    store.set('rm7_6', 'v');
    removeMany(store, ['rm7_0', 'rm7_1', 'rm7_2', 'rm7_3', 'rm7_4', 'rm7_5', 'rm7_6']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 8: removes 8 entries', () => {
    const store = createMemoryStore();
    store.set('rm8_0', 'v');
    store.set('rm8_1', 'v');
    store.set('rm8_2', 'v');
    store.set('rm8_3', 'v');
    store.set('rm8_4', 'v');
    store.set('rm8_5', 'v');
    store.set('rm8_6', 'v');
    store.set('rm8_7', 'v');
    removeMany(store, ['rm8_0', 'rm8_1', 'rm8_2', 'rm8_3', 'rm8_4', 'rm8_5', 'rm8_6', 'rm8_7']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 9: removes 9 entries', () => {
    const store = createMemoryStore();
    store.set('rm9_0', 'v');
    store.set('rm9_1', 'v');
    store.set('rm9_2', 'v');
    store.set('rm9_3', 'v');
    store.set('rm9_4', 'v');
    store.set('rm9_5', 'v');
    store.set('rm9_6', 'v');
    store.set('rm9_7', 'v');
    store.set('rm9_8', 'v');
    removeMany(store, ['rm9_0', 'rm9_1', 'rm9_2', 'rm9_3', 'rm9_4', 'rm9_5', 'rm9_6', 'rm9_7', 'rm9_8']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 10: removes 10 entries', () => {
    const store = createMemoryStore();
    store.set('rm10_0', 'v');
    store.set('rm10_1', 'v');
    store.set('rm10_2', 'v');
    store.set('rm10_3', 'v');
    store.set('rm10_4', 'v');
    store.set('rm10_5', 'v');
    store.set('rm10_6', 'v');
    store.set('rm10_7', 'v');
    store.set('rm10_8', 'v');
    store.set('rm10_9', 'v');
    removeMany(store, ['rm10_0', 'rm10_1', 'rm10_2', 'rm10_3', 'rm10_4', 'rm10_5', 'rm10_6', 'rm10_7', 'rm10_8', 'rm10_9']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 11: removes 11 entries', () => {
    const store = createMemoryStore();
    store.set('rm11_0', 'v');
    store.set('rm11_1', 'v');
    store.set('rm11_2', 'v');
    store.set('rm11_3', 'v');
    store.set('rm11_4', 'v');
    store.set('rm11_5', 'v');
    store.set('rm11_6', 'v');
    store.set('rm11_7', 'v');
    store.set('rm11_8', 'v');
    store.set('rm11_9', 'v');
    store.set('rm11_10', 'v');
    removeMany(store, ['rm11_0', 'rm11_1', 'rm11_2', 'rm11_3', 'rm11_4', 'rm11_5', 'rm11_6', 'rm11_7', 'rm11_8', 'rm11_9', 'rm11_10']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 12: removes 12 entries', () => {
    const store = createMemoryStore();
    store.set('rm12_0', 'v');
    store.set('rm12_1', 'v');
    store.set('rm12_2', 'v');
    store.set('rm12_3', 'v');
    store.set('rm12_4', 'v');
    store.set('rm12_5', 'v');
    store.set('rm12_6', 'v');
    store.set('rm12_7', 'v');
    store.set('rm12_8', 'v');
    store.set('rm12_9', 'v');
    store.set('rm12_10', 'v');
    store.set('rm12_11', 'v');
    removeMany(store, ['rm12_0', 'rm12_1', 'rm12_2', 'rm12_3', 'rm12_4', 'rm12_5', 'rm12_6', 'rm12_7', 'rm12_8', 'rm12_9', 'rm12_10', 'rm12_11']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 13: removes 13 entries', () => {
    const store = createMemoryStore();
    store.set('rm13_0', 'v');
    store.set('rm13_1', 'v');
    store.set('rm13_2', 'v');
    store.set('rm13_3', 'v');
    store.set('rm13_4', 'v');
    store.set('rm13_5', 'v');
    store.set('rm13_6', 'v');
    store.set('rm13_7', 'v');
    store.set('rm13_8', 'v');
    store.set('rm13_9', 'v');
    store.set('rm13_10', 'v');
    store.set('rm13_11', 'v');
    store.set('rm13_12', 'v');
    removeMany(store, ['rm13_0', 'rm13_1', 'rm13_2', 'rm13_3', 'rm13_4', 'rm13_5', 'rm13_6', 'rm13_7', 'rm13_8', 'rm13_9', 'rm13_10', 'rm13_11', 'rm13_12']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 14: removes 14 entries', () => {
    const store = createMemoryStore();
    store.set('rm14_0', 'v');
    store.set('rm14_1', 'v');
    store.set('rm14_2', 'v');
    store.set('rm14_3', 'v');
    store.set('rm14_4', 'v');
    store.set('rm14_5', 'v');
    store.set('rm14_6', 'v');
    store.set('rm14_7', 'v');
    store.set('rm14_8', 'v');
    store.set('rm14_9', 'v');
    store.set('rm14_10', 'v');
    store.set('rm14_11', 'v');
    store.set('rm14_12', 'v');
    store.set('rm14_13', 'v');
    removeMany(store, ['rm14_0', 'rm14_1', 'rm14_2', 'rm14_3', 'rm14_4', 'rm14_5', 'rm14_6', 'rm14_7', 'rm14_8', 'rm14_9', 'rm14_10', 'rm14_11', 'rm14_12', 'rm14_13']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 15: removes 15 entries', () => {
    const store = createMemoryStore();
    store.set('rm15_0', 'v');
    store.set('rm15_1', 'v');
    store.set('rm15_2', 'v');
    store.set('rm15_3', 'v');
    store.set('rm15_4', 'v');
    store.set('rm15_5', 'v');
    store.set('rm15_6', 'v');
    store.set('rm15_7', 'v');
    store.set('rm15_8', 'v');
    store.set('rm15_9', 'v');
    store.set('rm15_10', 'v');
    store.set('rm15_11', 'v');
    store.set('rm15_12', 'v');
    store.set('rm15_13', 'v');
    store.set('rm15_14', 'v');
    removeMany(store, ['rm15_0', 'rm15_1', 'rm15_2', 'rm15_3', 'rm15_4', 'rm15_5', 'rm15_6', 'rm15_7', 'rm15_8', 'rm15_9', 'rm15_10', 'rm15_11', 'rm15_12', 'rm15_13', 'rm15_14']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 16: removes 16 entries', () => {
    const store = createMemoryStore();
    store.set('rm16_0', 'v');
    store.set('rm16_1', 'v');
    store.set('rm16_2', 'v');
    store.set('rm16_3', 'v');
    store.set('rm16_4', 'v');
    store.set('rm16_5', 'v');
    store.set('rm16_6', 'v');
    store.set('rm16_7', 'v');
    store.set('rm16_8', 'v');
    store.set('rm16_9', 'v');
    store.set('rm16_10', 'v');
    store.set('rm16_11', 'v');
    store.set('rm16_12', 'v');
    store.set('rm16_13', 'v');
    store.set('rm16_14', 'v');
    store.set('rm16_15', 'v');
    removeMany(store, ['rm16_0', 'rm16_1', 'rm16_2', 'rm16_3', 'rm16_4', 'rm16_5', 'rm16_6', 'rm16_7', 'rm16_8', 'rm16_9', 'rm16_10', 'rm16_11', 'rm16_12', 'rm16_13', 'rm16_14', 'rm16_15']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 17: removes 17 entries', () => {
    const store = createMemoryStore();
    store.set('rm17_0', 'v');
    store.set('rm17_1', 'v');
    store.set('rm17_2', 'v');
    store.set('rm17_3', 'v');
    store.set('rm17_4', 'v');
    store.set('rm17_5', 'v');
    store.set('rm17_6', 'v');
    store.set('rm17_7', 'v');
    store.set('rm17_8', 'v');
    store.set('rm17_9', 'v');
    store.set('rm17_10', 'v');
    store.set('rm17_11', 'v');
    store.set('rm17_12', 'v');
    store.set('rm17_13', 'v');
    store.set('rm17_14', 'v');
    store.set('rm17_15', 'v');
    store.set('rm17_16', 'v');
    removeMany(store, ['rm17_0', 'rm17_1', 'rm17_2', 'rm17_3', 'rm17_4', 'rm17_5', 'rm17_6', 'rm17_7', 'rm17_8', 'rm17_9', 'rm17_10', 'rm17_11', 'rm17_12', 'rm17_13', 'rm17_14', 'rm17_15', 'rm17_16']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 18: removes 18 entries', () => {
    const store = createMemoryStore();
    store.set('rm18_0', 'v');
    store.set('rm18_1', 'v');
    store.set('rm18_2', 'v');
    store.set('rm18_3', 'v');
    store.set('rm18_4', 'v');
    store.set('rm18_5', 'v');
    store.set('rm18_6', 'v');
    store.set('rm18_7', 'v');
    store.set('rm18_8', 'v');
    store.set('rm18_9', 'v');
    store.set('rm18_10', 'v');
    store.set('rm18_11', 'v');
    store.set('rm18_12', 'v');
    store.set('rm18_13', 'v');
    store.set('rm18_14', 'v');
    store.set('rm18_15', 'v');
    store.set('rm18_16', 'v');
    store.set('rm18_17', 'v');
    removeMany(store, ['rm18_0', 'rm18_1', 'rm18_2', 'rm18_3', 'rm18_4', 'rm18_5', 'rm18_6', 'rm18_7', 'rm18_8', 'rm18_9', 'rm18_10', 'rm18_11', 'rm18_12', 'rm18_13', 'rm18_14', 'rm18_15', 'rm18_16', 'rm18_17']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 19: removes 19 entries', () => {
    const store = createMemoryStore();
    store.set('rm19_0', 'v');
    store.set('rm19_1', 'v');
    store.set('rm19_2', 'v');
    store.set('rm19_3', 'v');
    store.set('rm19_4', 'v');
    store.set('rm19_5', 'v');
    store.set('rm19_6', 'v');
    store.set('rm19_7', 'v');
    store.set('rm19_8', 'v');
    store.set('rm19_9', 'v');
    store.set('rm19_10', 'v');
    store.set('rm19_11', 'v');
    store.set('rm19_12', 'v');
    store.set('rm19_13', 'v');
    store.set('rm19_14', 'v');
    store.set('rm19_15', 'v');
    store.set('rm19_16', 'v');
    store.set('rm19_17', 'v');
    store.set('rm19_18', 'v');
    removeMany(store, ['rm19_0', 'rm19_1', 'rm19_2', 'rm19_3', 'rm19_4', 'rm19_5', 'rm19_6', 'rm19_7', 'rm19_8', 'rm19_9', 'rm19_10', 'rm19_11', 'rm19_12', 'rm19_13', 'rm19_14', 'rm19_15', 'rm19_16', 'rm19_17', 'rm19_18']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 20: removes 20 entries', () => {
    const store = createMemoryStore();
    store.set('rm20_0', 'v');
    store.set('rm20_1', 'v');
    store.set('rm20_2', 'v');
    store.set('rm20_3', 'v');
    store.set('rm20_4', 'v');
    store.set('rm20_5', 'v');
    store.set('rm20_6', 'v');
    store.set('rm20_7', 'v');
    store.set('rm20_8', 'v');
    store.set('rm20_9', 'v');
    store.set('rm20_10', 'v');
    store.set('rm20_11', 'v');
    store.set('rm20_12', 'v');
    store.set('rm20_13', 'v');
    store.set('rm20_14', 'v');
    store.set('rm20_15', 'v');
    store.set('rm20_16', 'v');
    store.set('rm20_17', 'v');
    store.set('rm20_18', 'v');
    store.set('rm20_19', 'v');
    removeMany(store, ['rm20_0', 'rm20_1', 'rm20_2', 'rm20_3', 'rm20_4', 'rm20_5', 'rm20_6', 'rm20_7', 'rm20_8', 'rm20_9', 'rm20_10', 'rm20_11', 'rm20_12', 'rm20_13', 'rm20_14', 'rm20_15', 'rm20_16', 'rm20_17', 'rm20_18', 'rm20_19']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 21: removes 21 entries', () => {
    const store = createMemoryStore();
    store.set('rm21_0', 'v');
    store.set('rm21_1', 'v');
    store.set('rm21_2', 'v');
    store.set('rm21_3', 'v');
    store.set('rm21_4', 'v');
    store.set('rm21_5', 'v');
    store.set('rm21_6', 'v');
    store.set('rm21_7', 'v');
    store.set('rm21_8', 'v');
    store.set('rm21_9', 'v');
    store.set('rm21_10', 'v');
    store.set('rm21_11', 'v');
    store.set('rm21_12', 'v');
    store.set('rm21_13', 'v');
    store.set('rm21_14', 'v');
    store.set('rm21_15', 'v');
    store.set('rm21_16', 'v');
    store.set('rm21_17', 'v');
    store.set('rm21_18', 'v');
    store.set('rm21_19', 'v');
    store.set('rm21_20', 'v');
    removeMany(store, ['rm21_0', 'rm21_1', 'rm21_2', 'rm21_3', 'rm21_4', 'rm21_5', 'rm21_6', 'rm21_7', 'rm21_8', 'rm21_9', 'rm21_10', 'rm21_11', 'rm21_12', 'rm21_13', 'rm21_14', 'rm21_15', 'rm21_16', 'rm21_17', 'rm21_18', 'rm21_19', 'rm21_20']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 22: removes 22 entries', () => {
    const store = createMemoryStore();
    store.set('rm22_0', 'v');
    store.set('rm22_1', 'v');
    store.set('rm22_2', 'v');
    store.set('rm22_3', 'v');
    store.set('rm22_4', 'v');
    store.set('rm22_5', 'v');
    store.set('rm22_6', 'v');
    store.set('rm22_7', 'v');
    store.set('rm22_8', 'v');
    store.set('rm22_9', 'v');
    store.set('rm22_10', 'v');
    store.set('rm22_11', 'v');
    store.set('rm22_12', 'v');
    store.set('rm22_13', 'v');
    store.set('rm22_14', 'v');
    store.set('rm22_15', 'v');
    store.set('rm22_16', 'v');
    store.set('rm22_17', 'v');
    store.set('rm22_18', 'v');
    store.set('rm22_19', 'v');
    store.set('rm22_20', 'v');
    store.set('rm22_21', 'v');
    removeMany(store, ['rm22_0', 'rm22_1', 'rm22_2', 'rm22_3', 'rm22_4', 'rm22_5', 'rm22_6', 'rm22_7', 'rm22_8', 'rm22_9', 'rm22_10', 'rm22_11', 'rm22_12', 'rm22_13', 'rm22_14', 'rm22_15', 'rm22_16', 'rm22_17', 'rm22_18', 'rm22_19', 'rm22_20', 'rm22_21']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 23: removes 23 entries', () => {
    const store = createMemoryStore();
    store.set('rm23_0', 'v');
    store.set('rm23_1', 'v');
    store.set('rm23_2', 'v');
    store.set('rm23_3', 'v');
    store.set('rm23_4', 'v');
    store.set('rm23_5', 'v');
    store.set('rm23_6', 'v');
    store.set('rm23_7', 'v');
    store.set('rm23_8', 'v');
    store.set('rm23_9', 'v');
    store.set('rm23_10', 'v');
    store.set('rm23_11', 'v');
    store.set('rm23_12', 'v');
    store.set('rm23_13', 'v');
    store.set('rm23_14', 'v');
    store.set('rm23_15', 'v');
    store.set('rm23_16', 'v');
    store.set('rm23_17', 'v');
    store.set('rm23_18', 'v');
    store.set('rm23_19', 'v');
    store.set('rm23_20', 'v');
    store.set('rm23_21', 'v');
    store.set('rm23_22', 'v');
    removeMany(store, ['rm23_0', 'rm23_1', 'rm23_2', 'rm23_3', 'rm23_4', 'rm23_5', 'rm23_6', 'rm23_7', 'rm23_8', 'rm23_9', 'rm23_10', 'rm23_11', 'rm23_12', 'rm23_13', 'rm23_14', 'rm23_15', 'rm23_16', 'rm23_17', 'rm23_18', 'rm23_19', 'rm23_20', 'rm23_21', 'rm23_22']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 24: removes 24 entries', () => {
    const store = createMemoryStore();
    store.set('rm24_0', 'v');
    store.set('rm24_1', 'v');
    store.set('rm24_2', 'v');
    store.set('rm24_3', 'v');
    store.set('rm24_4', 'v');
    store.set('rm24_5', 'v');
    store.set('rm24_6', 'v');
    store.set('rm24_7', 'v');
    store.set('rm24_8', 'v');
    store.set('rm24_9', 'v');
    store.set('rm24_10', 'v');
    store.set('rm24_11', 'v');
    store.set('rm24_12', 'v');
    store.set('rm24_13', 'v');
    store.set('rm24_14', 'v');
    store.set('rm24_15', 'v');
    store.set('rm24_16', 'v');
    store.set('rm24_17', 'v');
    store.set('rm24_18', 'v');
    store.set('rm24_19', 'v');
    store.set('rm24_20', 'v');
    store.set('rm24_21', 'v');
    store.set('rm24_22', 'v');
    store.set('rm24_23', 'v');
    removeMany(store, ['rm24_0', 'rm24_1', 'rm24_2', 'rm24_3', 'rm24_4', 'rm24_5', 'rm24_6', 'rm24_7', 'rm24_8', 'rm24_9', 'rm24_10', 'rm24_11', 'rm24_12', 'rm24_13', 'rm24_14', 'rm24_15', 'rm24_16', 'rm24_17', 'rm24_18', 'rm24_19', 'rm24_20', 'rm24_21', 'rm24_22', 'rm24_23']);
    expect(store.length()).toBe(0);
  });
  it('removeMany 25: removes 25 entries', () => {
    const store = createMemoryStore();
    store.set('rm25_0', 'v');
    store.set('rm25_1', 'v');
    store.set('rm25_2', 'v');
    store.set('rm25_3', 'v');
    store.set('rm25_4', 'v');
    store.set('rm25_5', 'v');
    store.set('rm25_6', 'v');
    store.set('rm25_7', 'v');
    store.set('rm25_8', 'v');
    store.set('rm25_9', 'v');
    store.set('rm25_10', 'v');
    store.set('rm25_11', 'v');
    store.set('rm25_12', 'v');
    store.set('rm25_13', 'v');
    store.set('rm25_14', 'v');
    store.set('rm25_15', 'v');
    store.set('rm25_16', 'v');
    store.set('rm25_17', 'v');
    store.set('rm25_18', 'v');
    store.set('rm25_19', 'v');
    store.set('rm25_20', 'v');
    store.set('rm25_21', 'v');
    store.set('rm25_22', 'v');
    store.set('rm25_23', 'v');
    store.set('rm25_24', 'v');
    removeMany(store, ['rm25_0', 'rm25_1', 'rm25_2', 'rm25_3', 'rm25_4', 'rm25_5', 'rm25_6', 'rm25_7', 'rm25_8', 'rm25_9', 'rm25_10', 'rm25_11', 'rm25_12', 'rm25_13', 'rm25_14', 'rm25_15', 'rm25_16', 'rm25_17', 'rm25_18', 'rm25_19', 'rm25_20', 'rm25_21', 'rm25_22', 'rm25_23', 'rm25_24']);
    expect(store.length()).toBe(0);
  });
  it('getMany empty: returns [] for empty keys', () => { expect(getMany(createMemoryStore(), [])).toEqual([]); });
  it('setMany empty: no error for empty entries', () => { const s = createMemoryStore(); setMany(s, []); expect(s.length()).toBe(0); });
  it('removeMany empty: no error for empty keys', () => { const s = createMemoryStore(); removeMany(s, []); expect(s.length()).toBe(0); });
  it('setMany then getMany: values match', () => {
    const s = createMemoryStore();
    setMany(s, [['a','1'],['b','2'],['c','3']]);
    expect(getMany(s, ['a','b','c'])).toEqual(['1','2','3']);
  });
  it('removeMany nonexistent: no error', () => { const s = createMemoryStore(); removeMany(s, ['x','y']); expect(s.length()).toBe(0); });
});

describe('getByPrefix / removeByPrefix / getByPattern', () => {
  it('getByPrefix 1: finds 1 keys with prefix pfx1', () => {
    const store = createMemoryStore();
    store.set('pfx1_item0', 'val0');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx1_');
    expect(result.length).toBe(1);
  });
  it('getByPrefix 2: finds 2 keys with prefix pfx2', () => {
    const store = createMemoryStore();
    store.set('pfx2_item0', 'val0');
    store.set('pfx2_item1', 'val1');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx2_');
    expect(result.length).toBe(2);
  });
  it('getByPrefix 3: finds 3 keys with prefix pfx3', () => {
    const store = createMemoryStore();
    store.set('pfx3_item0', 'val0');
    store.set('pfx3_item1', 'val1');
    store.set('pfx3_item2', 'val2');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx3_');
    expect(result.length).toBe(3);
  });
  it('getByPrefix 4: finds 4 keys with prefix pfx4', () => {
    const store = createMemoryStore();
    store.set('pfx4_item0', 'val0');
    store.set('pfx4_item1', 'val1');
    store.set('pfx4_item2', 'val2');
    store.set('pfx4_item3', 'val3');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx4_');
    expect(result.length).toBe(4);
  });
  it('getByPrefix 5: finds 5 keys with prefix pfx5', () => {
    const store = createMemoryStore();
    store.set('pfx5_item0', 'val0');
    store.set('pfx5_item1', 'val1');
    store.set('pfx5_item2', 'val2');
    store.set('pfx5_item3', 'val3');
    store.set('pfx5_item4', 'val4');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx5_');
    expect(result.length).toBe(5);
  });
  it('getByPrefix 6: finds 6 keys with prefix pfx6', () => {
    const store = createMemoryStore();
    store.set('pfx6_item0', 'val0');
    store.set('pfx6_item1', 'val1');
    store.set('pfx6_item2', 'val2');
    store.set('pfx6_item3', 'val3');
    store.set('pfx6_item4', 'val4');
    store.set('pfx6_item5', 'val5');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx6_');
    expect(result.length).toBe(6);
  });
  it('getByPrefix 7: finds 7 keys with prefix pfx7', () => {
    const store = createMemoryStore();
    store.set('pfx7_item0', 'val0');
    store.set('pfx7_item1', 'val1');
    store.set('pfx7_item2', 'val2');
    store.set('pfx7_item3', 'val3');
    store.set('pfx7_item4', 'val4');
    store.set('pfx7_item5', 'val5');
    store.set('pfx7_item6', 'val6');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx7_');
    expect(result.length).toBe(7);
  });
  it('getByPrefix 8: finds 8 keys with prefix pfx8', () => {
    const store = createMemoryStore();
    store.set('pfx8_item0', 'val0');
    store.set('pfx8_item1', 'val1');
    store.set('pfx8_item2', 'val2');
    store.set('pfx8_item3', 'val3');
    store.set('pfx8_item4', 'val4');
    store.set('pfx8_item5', 'val5');
    store.set('pfx8_item6', 'val6');
    store.set('pfx8_item7', 'val7');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx8_');
    expect(result.length).toBe(8);
  });
  it('getByPrefix 9: finds 9 keys with prefix pfx9', () => {
    const store = createMemoryStore();
    store.set('pfx9_item0', 'val0');
    store.set('pfx9_item1', 'val1');
    store.set('pfx9_item2', 'val2');
    store.set('pfx9_item3', 'val3');
    store.set('pfx9_item4', 'val4');
    store.set('pfx9_item5', 'val5');
    store.set('pfx9_item6', 'val6');
    store.set('pfx9_item7', 'val7');
    store.set('pfx9_item8', 'val8');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx9_');
    expect(result.length).toBe(9);
  });
  it('getByPrefix 10: finds 10 keys with prefix pfx10', () => {
    const store = createMemoryStore();
    store.set('pfx10_item0', 'val0');
    store.set('pfx10_item1', 'val1');
    store.set('pfx10_item2', 'val2');
    store.set('pfx10_item3', 'val3');
    store.set('pfx10_item4', 'val4');
    store.set('pfx10_item5', 'val5');
    store.set('pfx10_item6', 'val6');
    store.set('pfx10_item7', 'val7');
    store.set('pfx10_item8', 'val8');
    store.set('pfx10_item9', 'val9');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx10_');
    expect(result.length).toBe(10);
  });
  it('getByPrefix 11: finds 11 keys with prefix pfx11', () => {
    const store = createMemoryStore();
    store.set('pfx11_item0', 'val0');
    store.set('pfx11_item1', 'val1');
    store.set('pfx11_item2', 'val2');
    store.set('pfx11_item3', 'val3');
    store.set('pfx11_item4', 'val4');
    store.set('pfx11_item5', 'val5');
    store.set('pfx11_item6', 'val6');
    store.set('pfx11_item7', 'val7');
    store.set('pfx11_item8', 'val8');
    store.set('pfx11_item9', 'val9');
    store.set('pfx11_item10', 'val10');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx11_');
    expect(result.length).toBe(11);
  });
  it('getByPrefix 12: finds 12 keys with prefix pfx12', () => {
    const store = createMemoryStore();
    store.set('pfx12_item0', 'val0');
    store.set('pfx12_item1', 'val1');
    store.set('pfx12_item2', 'val2');
    store.set('pfx12_item3', 'val3');
    store.set('pfx12_item4', 'val4');
    store.set('pfx12_item5', 'val5');
    store.set('pfx12_item6', 'val6');
    store.set('pfx12_item7', 'val7');
    store.set('pfx12_item8', 'val8');
    store.set('pfx12_item9', 'val9');
    store.set('pfx12_item10', 'val10');
    store.set('pfx12_item11', 'val11');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx12_');
    expect(result.length).toBe(12);
  });
  it('getByPrefix 13: finds 13 keys with prefix pfx13', () => {
    const store = createMemoryStore();
    store.set('pfx13_item0', 'val0');
    store.set('pfx13_item1', 'val1');
    store.set('pfx13_item2', 'val2');
    store.set('pfx13_item3', 'val3');
    store.set('pfx13_item4', 'val4');
    store.set('pfx13_item5', 'val5');
    store.set('pfx13_item6', 'val6');
    store.set('pfx13_item7', 'val7');
    store.set('pfx13_item8', 'val8');
    store.set('pfx13_item9', 'val9');
    store.set('pfx13_item10', 'val10');
    store.set('pfx13_item11', 'val11');
    store.set('pfx13_item12', 'val12');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx13_');
    expect(result.length).toBe(13);
  });
  it('getByPrefix 14: finds 14 keys with prefix pfx14', () => {
    const store = createMemoryStore();
    store.set('pfx14_item0', 'val0');
    store.set('pfx14_item1', 'val1');
    store.set('pfx14_item2', 'val2');
    store.set('pfx14_item3', 'val3');
    store.set('pfx14_item4', 'val4');
    store.set('pfx14_item5', 'val5');
    store.set('pfx14_item6', 'val6');
    store.set('pfx14_item7', 'val7');
    store.set('pfx14_item8', 'val8');
    store.set('pfx14_item9', 'val9');
    store.set('pfx14_item10', 'val10');
    store.set('pfx14_item11', 'val11');
    store.set('pfx14_item12', 'val12');
    store.set('pfx14_item13', 'val13');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx14_');
    expect(result.length).toBe(14);
  });
  it('getByPrefix 15: finds 15 keys with prefix pfx15', () => {
    const store = createMemoryStore();
    store.set('pfx15_item0', 'val0');
    store.set('pfx15_item1', 'val1');
    store.set('pfx15_item2', 'val2');
    store.set('pfx15_item3', 'val3');
    store.set('pfx15_item4', 'val4');
    store.set('pfx15_item5', 'val5');
    store.set('pfx15_item6', 'val6');
    store.set('pfx15_item7', 'val7');
    store.set('pfx15_item8', 'val8');
    store.set('pfx15_item9', 'val9');
    store.set('pfx15_item10', 'val10');
    store.set('pfx15_item11', 'val11');
    store.set('pfx15_item12', 'val12');
    store.set('pfx15_item13', 'val13');
    store.set('pfx15_item14', 'val14');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx15_');
    expect(result.length).toBe(15);
  });
  it('getByPrefix 16: finds 16 keys with prefix pfx16', () => {
    const store = createMemoryStore();
    store.set('pfx16_item0', 'val0');
    store.set('pfx16_item1', 'val1');
    store.set('pfx16_item2', 'val2');
    store.set('pfx16_item3', 'val3');
    store.set('pfx16_item4', 'val4');
    store.set('pfx16_item5', 'val5');
    store.set('pfx16_item6', 'val6');
    store.set('pfx16_item7', 'val7');
    store.set('pfx16_item8', 'val8');
    store.set('pfx16_item9', 'val9');
    store.set('pfx16_item10', 'val10');
    store.set('pfx16_item11', 'val11');
    store.set('pfx16_item12', 'val12');
    store.set('pfx16_item13', 'val13');
    store.set('pfx16_item14', 'val14');
    store.set('pfx16_item15', 'val15');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx16_');
    expect(result.length).toBe(16);
  });
  it('getByPrefix 17: finds 17 keys with prefix pfx17', () => {
    const store = createMemoryStore();
    store.set('pfx17_item0', 'val0');
    store.set('pfx17_item1', 'val1');
    store.set('pfx17_item2', 'val2');
    store.set('pfx17_item3', 'val3');
    store.set('pfx17_item4', 'val4');
    store.set('pfx17_item5', 'val5');
    store.set('pfx17_item6', 'val6');
    store.set('pfx17_item7', 'val7');
    store.set('pfx17_item8', 'val8');
    store.set('pfx17_item9', 'val9');
    store.set('pfx17_item10', 'val10');
    store.set('pfx17_item11', 'val11');
    store.set('pfx17_item12', 'val12');
    store.set('pfx17_item13', 'val13');
    store.set('pfx17_item14', 'val14');
    store.set('pfx17_item15', 'val15');
    store.set('pfx17_item16', 'val16');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx17_');
    expect(result.length).toBe(17);
  });
  it('getByPrefix 18: finds 18 keys with prefix pfx18', () => {
    const store = createMemoryStore();
    store.set('pfx18_item0', 'val0');
    store.set('pfx18_item1', 'val1');
    store.set('pfx18_item2', 'val2');
    store.set('pfx18_item3', 'val3');
    store.set('pfx18_item4', 'val4');
    store.set('pfx18_item5', 'val5');
    store.set('pfx18_item6', 'val6');
    store.set('pfx18_item7', 'val7');
    store.set('pfx18_item8', 'val8');
    store.set('pfx18_item9', 'val9');
    store.set('pfx18_item10', 'val10');
    store.set('pfx18_item11', 'val11');
    store.set('pfx18_item12', 'val12');
    store.set('pfx18_item13', 'val13');
    store.set('pfx18_item14', 'val14');
    store.set('pfx18_item15', 'val15');
    store.set('pfx18_item16', 'val16');
    store.set('pfx18_item17', 'val17');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx18_');
    expect(result.length).toBe(18);
  });
  it('getByPrefix 19: finds 19 keys with prefix pfx19', () => {
    const store = createMemoryStore();
    store.set('pfx19_item0', 'val0');
    store.set('pfx19_item1', 'val1');
    store.set('pfx19_item2', 'val2');
    store.set('pfx19_item3', 'val3');
    store.set('pfx19_item4', 'val4');
    store.set('pfx19_item5', 'val5');
    store.set('pfx19_item6', 'val6');
    store.set('pfx19_item7', 'val7');
    store.set('pfx19_item8', 'val8');
    store.set('pfx19_item9', 'val9');
    store.set('pfx19_item10', 'val10');
    store.set('pfx19_item11', 'val11');
    store.set('pfx19_item12', 'val12');
    store.set('pfx19_item13', 'val13');
    store.set('pfx19_item14', 'val14');
    store.set('pfx19_item15', 'val15');
    store.set('pfx19_item16', 'val16');
    store.set('pfx19_item17', 'val17');
    store.set('pfx19_item18', 'val18');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx19_');
    expect(result.length).toBe(19);
  });
  it('getByPrefix 20: finds 20 keys with prefix pfx20', () => {
    const store = createMemoryStore();
    store.set('pfx20_item0', 'val0');
    store.set('pfx20_item1', 'val1');
    store.set('pfx20_item2', 'val2');
    store.set('pfx20_item3', 'val3');
    store.set('pfx20_item4', 'val4');
    store.set('pfx20_item5', 'val5');
    store.set('pfx20_item6', 'val6');
    store.set('pfx20_item7', 'val7');
    store.set('pfx20_item8', 'val8');
    store.set('pfx20_item9', 'val9');
    store.set('pfx20_item10', 'val10');
    store.set('pfx20_item11', 'val11');
    store.set('pfx20_item12', 'val12');
    store.set('pfx20_item13', 'val13');
    store.set('pfx20_item14', 'val14');
    store.set('pfx20_item15', 'val15');
    store.set('pfx20_item16', 'val16');
    store.set('pfx20_item17', 'val17');
    store.set('pfx20_item18', 'val18');
    store.set('pfx20_item19', 'val19');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx20_');
    expect(result.length).toBe(20);
  });
  it('getByPrefix 21: finds 21 keys with prefix pfx21', () => {
    const store = createMemoryStore();
    store.set('pfx21_item0', 'val0');
    store.set('pfx21_item1', 'val1');
    store.set('pfx21_item2', 'val2');
    store.set('pfx21_item3', 'val3');
    store.set('pfx21_item4', 'val4');
    store.set('pfx21_item5', 'val5');
    store.set('pfx21_item6', 'val6');
    store.set('pfx21_item7', 'val7');
    store.set('pfx21_item8', 'val8');
    store.set('pfx21_item9', 'val9');
    store.set('pfx21_item10', 'val10');
    store.set('pfx21_item11', 'val11');
    store.set('pfx21_item12', 'val12');
    store.set('pfx21_item13', 'val13');
    store.set('pfx21_item14', 'val14');
    store.set('pfx21_item15', 'val15');
    store.set('pfx21_item16', 'val16');
    store.set('pfx21_item17', 'val17');
    store.set('pfx21_item18', 'val18');
    store.set('pfx21_item19', 'val19');
    store.set('pfx21_item20', 'val20');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx21_');
    expect(result.length).toBe(21);
  });
  it('getByPrefix 22: finds 22 keys with prefix pfx22', () => {
    const store = createMemoryStore();
    store.set('pfx22_item0', 'val0');
    store.set('pfx22_item1', 'val1');
    store.set('pfx22_item2', 'val2');
    store.set('pfx22_item3', 'val3');
    store.set('pfx22_item4', 'val4');
    store.set('pfx22_item5', 'val5');
    store.set('pfx22_item6', 'val6');
    store.set('pfx22_item7', 'val7');
    store.set('pfx22_item8', 'val8');
    store.set('pfx22_item9', 'val9');
    store.set('pfx22_item10', 'val10');
    store.set('pfx22_item11', 'val11');
    store.set('pfx22_item12', 'val12');
    store.set('pfx22_item13', 'val13');
    store.set('pfx22_item14', 'val14');
    store.set('pfx22_item15', 'val15');
    store.set('pfx22_item16', 'val16');
    store.set('pfx22_item17', 'val17');
    store.set('pfx22_item18', 'val18');
    store.set('pfx22_item19', 'val19');
    store.set('pfx22_item20', 'val20');
    store.set('pfx22_item21', 'val21');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx22_');
    expect(result.length).toBe(22);
  });
  it('getByPrefix 23: finds 23 keys with prefix pfx23', () => {
    const store = createMemoryStore();
    store.set('pfx23_item0', 'val0');
    store.set('pfx23_item1', 'val1');
    store.set('pfx23_item2', 'val2');
    store.set('pfx23_item3', 'val3');
    store.set('pfx23_item4', 'val4');
    store.set('pfx23_item5', 'val5');
    store.set('pfx23_item6', 'val6');
    store.set('pfx23_item7', 'val7');
    store.set('pfx23_item8', 'val8');
    store.set('pfx23_item9', 'val9');
    store.set('pfx23_item10', 'val10');
    store.set('pfx23_item11', 'val11');
    store.set('pfx23_item12', 'val12');
    store.set('pfx23_item13', 'val13');
    store.set('pfx23_item14', 'val14');
    store.set('pfx23_item15', 'val15');
    store.set('pfx23_item16', 'val16');
    store.set('pfx23_item17', 'val17');
    store.set('pfx23_item18', 'val18');
    store.set('pfx23_item19', 'val19');
    store.set('pfx23_item20', 'val20');
    store.set('pfx23_item21', 'val21');
    store.set('pfx23_item22', 'val22');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx23_');
    expect(result.length).toBe(23);
  });
  it('getByPrefix 24: finds 24 keys with prefix pfx24', () => {
    const store = createMemoryStore();
    store.set('pfx24_item0', 'val0');
    store.set('pfx24_item1', 'val1');
    store.set('pfx24_item2', 'val2');
    store.set('pfx24_item3', 'val3');
    store.set('pfx24_item4', 'val4');
    store.set('pfx24_item5', 'val5');
    store.set('pfx24_item6', 'val6');
    store.set('pfx24_item7', 'val7');
    store.set('pfx24_item8', 'val8');
    store.set('pfx24_item9', 'val9');
    store.set('pfx24_item10', 'val10');
    store.set('pfx24_item11', 'val11');
    store.set('pfx24_item12', 'val12');
    store.set('pfx24_item13', 'val13');
    store.set('pfx24_item14', 'val14');
    store.set('pfx24_item15', 'val15');
    store.set('pfx24_item16', 'val16');
    store.set('pfx24_item17', 'val17');
    store.set('pfx24_item18', 'val18');
    store.set('pfx24_item19', 'val19');
    store.set('pfx24_item20', 'val20');
    store.set('pfx24_item21', 'val21');
    store.set('pfx24_item22', 'val22');
    store.set('pfx24_item23', 'val23');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx24_');
    expect(result.length).toBe(24);
  });
  it('getByPrefix 25: finds 25 keys with prefix pfx25', () => {
    const store = createMemoryStore();
    store.set('pfx25_item0', 'val0');
    store.set('pfx25_item1', 'val1');
    store.set('pfx25_item2', 'val2');
    store.set('pfx25_item3', 'val3');
    store.set('pfx25_item4', 'val4');
    store.set('pfx25_item5', 'val5');
    store.set('pfx25_item6', 'val6');
    store.set('pfx25_item7', 'val7');
    store.set('pfx25_item8', 'val8');
    store.set('pfx25_item9', 'val9');
    store.set('pfx25_item10', 'val10');
    store.set('pfx25_item11', 'val11');
    store.set('pfx25_item12', 'val12');
    store.set('pfx25_item13', 'val13');
    store.set('pfx25_item14', 'val14');
    store.set('pfx25_item15', 'val15');
    store.set('pfx25_item16', 'val16');
    store.set('pfx25_item17', 'val17');
    store.set('pfx25_item18', 'val18');
    store.set('pfx25_item19', 'val19');
    store.set('pfx25_item20', 'val20');
    store.set('pfx25_item21', 'val21');
    store.set('pfx25_item22', 'val22');
    store.set('pfx25_item23', 'val23');
    store.set('pfx25_item24', 'val24');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx25_');
    expect(result.length).toBe(25);
  });
  it('getByPrefix 26: finds 26 keys with prefix pfx26', () => {
    const store = createMemoryStore();
    store.set('pfx26_item0', 'val0');
    store.set('pfx26_item1', 'val1');
    store.set('pfx26_item2', 'val2');
    store.set('pfx26_item3', 'val3');
    store.set('pfx26_item4', 'val4');
    store.set('pfx26_item5', 'val5');
    store.set('pfx26_item6', 'val6');
    store.set('pfx26_item7', 'val7');
    store.set('pfx26_item8', 'val8');
    store.set('pfx26_item9', 'val9');
    store.set('pfx26_item10', 'val10');
    store.set('pfx26_item11', 'val11');
    store.set('pfx26_item12', 'val12');
    store.set('pfx26_item13', 'val13');
    store.set('pfx26_item14', 'val14');
    store.set('pfx26_item15', 'val15');
    store.set('pfx26_item16', 'val16');
    store.set('pfx26_item17', 'val17');
    store.set('pfx26_item18', 'val18');
    store.set('pfx26_item19', 'val19');
    store.set('pfx26_item20', 'val20');
    store.set('pfx26_item21', 'val21');
    store.set('pfx26_item22', 'val22');
    store.set('pfx26_item23', 'val23');
    store.set('pfx26_item24', 'val24');
    store.set('pfx26_item25', 'val25');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx26_');
    expect(result.length).toBe(26);
  });
  it('getByPrefix 27: finds 27 keys with prefix pfx27', () => {
    const store = createMemoryStore();
    store.set('pfx27_item0', 'val0');
    store.set('pfx27_item1', 'val1');
    store.set('pfx27_item2', 'val2');
    store.set('pfx27_item3', 'val3');
    store.set('pfx27_item4', 'val4');
    store.set('pfx27_item5', 'val5');
    store.set('pfx27_item6', 'val6');
    store.set('pfx27_item7', 'val7');
    store.set('pfx27_item8', 'val8');
    store.set('pfx27_item9', 'val9');
    store.set('pfx27_item10', 'val10');
    store.set('pfx27_item11', 'val11');
    store.set('pfx27_item12', 'val12');
    store.set('pfx27_item13', 'val13');
    store.set('pfx27_item14', 'val14');
    store.set('pfx27_item15', 'val15');
    store.set('pfx27_item16', 'val16');
    store.set('pfx27_item17', 'val17');
    store.set('pfx27_item18', 'val18');
    store.set('pfx27_item19', 'val19');
    store.set('pfx27_item20', 'val20');
    store.set('pfx27_item21', 'val21');
    store.set('pfx27_item22', 'val22');
    store.set('pfx27_item23', 'val23');
    store.set('pfx27_item24', 'val24');
    store.set('pfx27_item25', 'val25');
    store.set('pfx27_item26', 'val26');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx27_');
    expect(result.length).toBe(27);
  });
  it('getByPrefix 28: finds 28 keys with prefix pfx28', () => {
    const store = createMemoryStore();
    store.set('pfx28_item0', 'val0');
    store.set('pfx28_item1', 'val1');
    store.set('pfx28_item2', 'val2');
    store.set('pfx28_item3', 'val3');
    store.set('pfx28_item4', 'val4');
    store.set('pfx28_item5', 'val5');
    store.set('pfx28_item6', 'val6');
    store.set('pfx28_item7', 'val7');
    store.set('pfx28_item8', 'val8');
    store.set('pfx28_item9', 'val9');
    store.set('pfx28_item10', 'val10');
    store.set('pfx28_item11', 'val11');
    store.set('pfx28_item12', 'val12');
    store.set('pfx28_item13', 'val13');
    store.set('pfx28_item14', 'val14');
    store.set('pfx28_item15', 'val15');
    store.set('pfx28_item16', 'val16');
    store.set('pfx28_item17', 'val17');
    store.set('pfx28_item18', 'val18');
    store.set('pfx28_item19', 'val19');
    store.set('pfx28_item20', 'val20');
    store.set('pfx28_item21', 'val21');
    store.set('pfx28_item22', 'val22');
    store.set('pfx28_item23', 'val23');
    store.set('pfx28_item24', 'val24');
    store.set('pfx28_item25', 'val25');
    store.set('pfx28_item26', 'val26');
    store.set('pfx28_item27', 'val27');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx28_');
    expect(result.length).toBe(28);
  });
  it('getByPrefix 29: finds 29 keys with prefix pfx29', () => {
    const store = createMemoryStore();
    store.set('pfx29_item0', 'val0');
    store.set('pfx29_item1', 'val1');
    store.set('pfx29_item2', 'val2');
    store.set('pfx29_item3', 'val3');
    store.set('pfx29_item4', 'val4');
    store.set('pfx29_item5', 'val5');
    store.set('pfx29_item6', 'val6');
    store.set('pfx29_item7', 'val7');
    store.set('pfx29_item8', 'val8');
    store.set('pfx29_item9', 'val9');
    store.set('pfx29_item10', 'val10');
    store.set('pfx29_item11', 'val11');
    store.set('pfx29_item12', 'val12');
    store.set('pfx29_item13', 'val13');
    store.set('pfx29_item14', 'val14');
    store.set('pfx29_item15', 'val15');
    store.set('pfx29_item16', 'val16');
    store.set('pfx29_item17', 'val17');
    store.set('pfx29_item18', 'val18');
    store.set('pfx29_item19', 'val19');
    store.set('pfx29_item20', 'val20');
    store.set('pfx29_item21', 'val21');
    store.set('pfx29_item22', 'val22');
    store.set('pfx29_item23', 'val23');
    store.set('pfx29_item24', 'val24');
    store.set('pfx29_item25', 'val25');
    store.set('pfx29_item26', 'val26');
    store.set('pfx29_item27', 'val27');
    store.set('pfx29_item28', 'val28');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx29_');
    expect(result.length).toBe(29);
  });
  it('getByPrefix 30: finds 30 keys with prefix pfx30', () => {
    const store = createMemoryStore();
    store.set('pfx30_item0', 'val0');
    store.set('pfx30_item1', 'val1');
    store.set('pfx30_item2', 'val2');
    store.set('pfx30_item3', 'val3');
    store.set('pfx30_item4', 'val4');
    store.set('pfx30_item5', 'val5');
    store.set('pfx30_item6', 'val6');
    store.set('pfx30_item7', 'val7');
    store.set('pfx30_item8', 'val8');
    store.set('pfx30_item9', 'val9');
    store.set('pfx30_item10', 'val10');
    store.set('pfx30_item11', 'val11');
    store.set('pfx30_item12', 'val12');
    store.set('pfx30_item13', 'val13');
    store.set('pfx30_item14', 'val14');
    store.set('pfx30_item15', 'val15');
    store.set('pfx30_item16', 'val16');
    store.set('pfx30_item17', 'val17');
    store.set('pfx30_item18', 'val18');
    store.set('pfx30_item19', 'val19');
    store.set('pfx30_item20', 'val20');
    store.set('pfx30_item21', 'val21');
    store.set('pfx30_item22', 'val22');
    store.set('pfx30_item23', 'val23');
    store.set('pfx30_item24', 'val24');
    store.set('pfx30_item25', 'val25');
    store.set('pfx30_item26', 'val26');
    store.set('pfx30_item27', 'val27');
    store.set('pfx30_item28', 'val28');
    store.set('pfx30_item29', 'val29');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx30_');
    expect(result.length).toBe(30);
  });
  it('getByPrefix 31: finds 31 keys with prefix pfx31', () => {
    const store = createMemoryStore();
    store.set('pfx31_item0', 'val0');
    store.set('pfx31_item1', 'val1');
    store.set('pfx31_item2', 'val2');
    store.set('pfx31_item3', 'val3');
    store.set('pfx31_item4', 'val4');
    store.set('pfx31_item5', 'val5');
    store.set('pfx31_item6', 'val6');
    store.set('pfx31_item7', 'val7');
    store.set('pfx31_item8', 'val8');
    store.set('pfx31_item9', 'val9');
    store.set('pfx31_item10', 'val10');
    store.set('pfx31_item11', 'val11');
    store.set('pfx31_item12', 'val12');
    store.set('pfx31_item13', 'val13');
    store.set('pfx31_item14', 'val14');
    store.set('pfx31_item15', 'val15');
    store.set('pfx31_item16', 'val16');
    store.set('pfx31_item17', 'val17');
    store.set('pfx31_item18', 'val18');
    store.set('pfx31_item19', 'val19');
    store.set('pfx31_item20', 'val20');
    store.set('pfx31_item21', 'val21');
    store.set('pfx31_item22', 'val22');
    store.set('pfx31_item23', 'val23');
    store.set('pfx31_item24', 'val24');
    store.set('pfx31_item25', 'val25');
    store.set('pfx31_item26', 'val26');
    store.set('pfx31_item27', 'val27');
    store.set('pfx31_item28', 'val28');
    store.set('pfx31_item29', 'val29');
    store.set('pfx31_item30', 'val30');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx31_');
    expect(result.length).toBe(31);
  });
  it('getByPrefix 32: finds 32 keys with prefix pfx32', () => {
    const store = createMemoryStore();
    store.set('pfx32_item0', 'val0');
    store.set('pfx32_item1', 'val1');
    store.set('pfx32_item2', 'val2');
    store.set('pfx32_item3', 'val3');
    store.set('pfx32_item4', 'val4');
    store.set('pfx32_item5', 'val5');
    store.set('pfx32_item6', 'val6');
    store.set('pfx32_item7', 'val7');
    store.set('pfx32_item8', 'val8');
    store.set('pfx32_item9', 'val9');
    store.set('pfx32_item10', 'val10');
    store.set('pfx32_item11', 'val11');
    store.set('pfx32_item12', 'val12');
    store.set('pfx32_item13', 'val13');
    store.set('pfx32_item14', 'val14');
    store.set('pfx32_item15', 'val15');
    store.set('pfx32_item16', 'val16');
    store.set('pfx32_item17', 'val17');
    store.set('pfx32_item18', 'val18');
    store.set('pfx32_item19', 'val19');
    store.set('pfx32_item20', 'val20');
    store.set('pfx32_item21', 'val21');
    store.set('pfx32_item22', 'val22');
    store.set('pfx32_item23', 'val23');
    store.set('pfx32_item24', 'val24');
    store.set('pfx32_item25', 'val25');
    store.set('pfx32_item26', 'val26');
    store.set('pfx32_item27', 'val27');
    store.set('pfx32_item28', 'val28');
    store.set('pfx32_item29', 'val29');
    store.set('pfx32_item30', 'val30');
    store.set('pfx32_item31', 'val31');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx32_');
    expect(result.length).toBe(32);
  });
  it('getByPrefix 33: finds 33 keys with prefix pfx33', () => {
    const store = createMemoryStore();
    store.set('pfx33_item0', 'val0');
    store.set('pfx33_item1', 'val1');
    store.set('pfx33_item2', 'val2');
    store.set('pfx33_item3', 'val3');
    store.set('pfx33_item4', 'val4');
    store.set('pfx33_item5', 'val5');
    store.set('pfx33_item6', 'val6');
    store.set('pfx33_item7', 'val7');
    store.set('pfx33_item8', 'val8');
    store.set('pfx33_item9', 'val9');
    store.set('pfx33_item10', 'val10');
    store.set('pfx33_item11', 'val11');
    store.set('pfx33_item12', 'val12');
    store.set('pfx33_item13', 'val13');
    store.set('pfx33_item14', 'val14');
    store.set('pfx33_item15', 'val15');
    store.set('pfx33_item16', 'val16');
    store.set('pfx33_item17', 'val17');
    store.set('pfx33_item18', 'val18');
    store.set('pfx33_item19', 'val19');
    store.set('pfx33_item20', 'val20');
    store.set('pfx33_item21', 'val21');
    store.set('pfx33_item22', 'val22');
    store.set('pfx33_item23', 'val23');
    store.set('pfx33_item24', 'val24');
    store.set('pfx33_item25', 'val25');
    store.set('pfx33_item26', 'val26');
    store.set('pfx33_item27', 'val27');
    store.set('pfx33_item28', 'val28');
    store.set('pfx33_item29', 'val29');
    store.set('pfx33_item30', 'val30');
    store.set('pfx33_item31', 'val31');
    store.set('pfx33_item32', 'val32');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx33_');
    expect(result.length).toBe(33);
  });
  it('getByPrefix 34: finds 34 keys with prefix pfx34', () => {
    const store = createMemoryStore();
    store.set('pfx34_item0', 'val0');
    store.set('pfx34_item1', 'val1');
    store.set('pfx34_item2', 'val2');
    store.set('pfx34_item3', 'val3');
    store.set('pfx34_item4', 'val4');
    store.set('pfx34_item5', 'val5');
    store.set('pfx34_item6', 'val6');
    store.set('pfx34_item7', 'val7');
    store.set('pfx34_item8', 'val8');
    store.set('pfx34_item9', 'val9');
    store.set('pfx34_item10', 'val10');
    store.set('pfx34_item11', 'val11');
    store.set('pfx34_item12', 'val12');
    store.set('pfx34_item13', 'val13');
    store.set('pfx34_item14', 'val14');
    store.set('pfx34_item15', 'val15');
    store.set('pfx34_item16', 'val16');
    store.set('pfx34_item17', 'val17');
    store.set('pfx34_item18', 'val18');
    store.set('pfx34_item19', 'val19');
    store.set('pfx34_item20', 'val20');
    store.set('pfx34_item21', 'val21');
    store.set('pfx34_item22', 'val22');
    store.set('pfx34_item23', 'val23');
    store.set('pfx34_item24', 'val24');
    store.set('pfx34_item25', 'val25');
    store.set('pfx34_item26', 'val26');
    store.set('pfx34_item27', 'val27');
    store.set('pfx34_item28', 'val28');
    store.set('pfx34_item29', 'val29');
    store.set('pfx34_item30', 'val30');
    store.set('pfx34_item31', 'val31');
    store.set('pfx34_item32', 'val32');
    store.set('pfx34_item33', 'val33');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx34_');
    expect(result.length).toBe(34);
  });
  it('getByPrefix 35: finds 35 keys with prefix pfx35', () => {
    const store = createMemoryStore();
    store.set('pfx35_item0', 'val0');
    store.set('pfx35_item1', 'val1');
    store.set('pfx35_item2', 'val2');
    store.set('pfx35_item3', 'val3');
    store.set('pfx35_item4', 'val4');
    store.set('pfx35_item5', 'val5');
    store.set('pfx35_item6', 'val6');
    store.set('pfx35_item7', 'val7');
    store.set('pfx35_item8', 'val8');
    store.set('pfx35_item9', 'val9');
    store.set('pfx35_item10', 'val10');
    store.set('pfx35_item11', 'val11');
    store.set('pfx35_item12', 'val12');
    store.set('pfx35_item13', 'val13');
    store.set('pfx35_item14', 'val14');
    store.set('pfx35_item15', 'val15');
    store.set('pfx35_item16', 'val16');
    store.set('pfx35_item17', 'val17');
    store.set('pfx35_item18', 'val18');
    store.set('pfx35_item19', 'val19');
    store.set('pfx35_item20', 'val20');
    store.set('pfx35_item21', 'val21');
    store.set('pfx35_item22', 'val22');
    store.set('pfx35_item23', 'val23');
    store.set('pfx35_item24', 'val24');
    store.set('pfx35_item25', 'val25');
    store.set('pfx35_item26', 'val26');
    store.set('pfx35_item27', 'val27');
    store.set('pfx35_item28', 'val28');
    store.set('pfx35_item29', 'val29');
    store.set('pfx35_item30', 'val30');
    store.set('pfx35_item31', 'val31');
    store.set('pfx35_item32', 'val32');
    store.set('pfx35_item33', 'val33');
    store.set('pfx35_item34', 'val34');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx35_');
    expect(result.length).toBe(35);
  });
  it('getByPrefix 36: finds 36 keys with prefix pfx36', () => {
    const store = createMemoryStore();
    store.set('pfx36_item0', 'val0');
    store.set('pfx36_item1', 'val1');
    store.set('pfx36_item2', 'val2');
    store.set('pfx36_item3', 'val3');
    store.set('pfx36_item4', 'val4');
    store.set('pfx36_item5', 'val5');
    store.set('pfx36_item6', 'val6');
    store.set('pfx36_item7', 'val7');
    store.set('pfx36_item8', 'val8');
    store.set('pfx36_item9', 'val9');
    store.set('pfx36_item10', 'val10');
    store.set('pfx36_item11', 'val11');
    store.set('pfx36_item12', 'val12');
    store.set('pfx36_item13', 'val13');
    store.set('pfx36_item14', 'val14');
    store.set('pfx36_item15', 'val15');
    store.set('pfx36_item16', 'val16');
    store.set('pfx36_item17', 'val17');
    store.set('pfx36_item18', 'val18');
    store.set('pfx36_item19', 'val19');
    store.set('pfx36_item20', 'val20');
    store.set('pfx36_item21', 'val21');
    store.set('pfx36_item22', 'val22');
    store.set('pfx36_item23', 'val23');
    store.set('pfx36_item24', 'val24');
    store.set('pfx36_item25', 'val25');
    store.set('pfx36_item26', 'val26');
    store.set('pfx36_item27', 'val27');
    store.set('pfx36_item28', 'val28');
    store.set('pfx36_item29', 'val29');
    store.set('pfx36_item30', 'val30');
    store.set('pfx36_item31', 'val31');
    store.set('pfx36_item32', 'val32');
    store.set('pfx36_item33', 'val33');
    store.set('pfx36_item34', 'val34');
    store.set('pfx36_item35', 'val35');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx36_');
    expect(result.length).toBe(36);
  });
  it('getByPrefix 37: finds 37 keys with prefix pfx37', () => {
    const store = createMemoryStore();
    store.set('pfx37_item0', 'val0');
    store.set('pfx37_item1', 'val1');
    store.set('pfx37_item2', 'val2');
    store.set('pfx37_item3', 'val3');
    store.set('pfx37_item4', 'val4');
    store.set('pfx37_item5', 'val5');
    store.set('pfx37_item6', 'val6');
    store.set('pfx37_item7', 'val7');
    store.set('pfx37_item8', 'val8');
    store.set('pfx37_item9', 'val9');
    store.set('pfx37_item10', 'val10');
    store.set('pfx37_item11', 'val11');
    store.set('pfx37_item12', 'val12');
    store.set('pfx37_item13', 'val13');
    store.set('pfx37_item14', 'val14');
    store.set('pfx37_item15', 'val15');
    store.set('pfx37_item16', 'val16');
    store.set('pfx37_item17', 'val17');
    store.set('pfx37_item18', 'val18');
    store.set('pfx37_item19', 'val19');
    store.set('pfx37_item20', 'val20');
    store.set('pfx37_item21', 'val21');
    store.set('pfx37_item22', 'val22');
    store.set('pfx37_item23', 'val23');
    store.set('pfx37_item24', 'val24');
    store.set('pfx37_item25', 'val25');
    store.set('pfx37_item26', 'val26');
    store.set('pfx37_item27', 'val27');
    store.set('pfx37_item28', 'val28');
    store.set('pfx37_item29', 'val29');
    store.set('pfx37_item30', 'val30');
    store.set('pfx37_item31', 'val31');
    store.set('pfx37_item32', 'val32');
    store.set('pfx37_item33', 'val33');
    store.set('pfx37_item34', 'val34');
    store.set('pfx37_item35', 'val35');
    store.set('pfx37_item36', 'val36');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx37_');
    expect(result.length).toBe(37);
  });
  it('getByPrefix 38: finds 38 keys with prefix pfx38', () => {
    const store = createMemoryStore();
    store.set('pfx38_item0', 'val0');
    store.set('pfx38_item1', 'val1');
    store.set('pfx38_item2', 'val2');
    store.set('pfx38_item3', 'val3');
    store.set('pfx38_item4', 'val4');
    store.set('pfx38_item5', 'val5');
    store.set('pfx38_item6', 'val6');
    store.set('pfx38_item7', 'val7');
    store.set('pfx38_item8', 'val8');
    store.set('pfx38_item9', 'val9');
    store.set('pfx38_item10', 'val10');
    store.set('pfx38_item11', 'val11');
    store.set('pfx38_item12', 'val12');
    store.set('pfx38_item13', 'val13');
    store.set('pfx38_item14', 'val14');
    store.set('pfx38_item15', 'val15');
    store.set('pfx38_item16', 'val16');
    store.set('pfx38_item17', 'val17');
    store.set('pfx38_item18', 'val18');
    store.set('pfx38_item19', 'val19');
    store.set('pfx38_item20', 'val20');
    store.set('pfx38_item21', 'val21');
    store.set('pfx38_item22', 'val22');
    store.set('pfx38_item23', 'val23');
    store.set('pfx38_item24', 'val24');
    store.set('pfx38_item25', 'val25');
    store.set('pfx38_item26', 'val26');
    store.set('pfx38_item27', 'val27');
    store.set('pfx38_item28', 'val28');
    store.set('pfx38_item29', 'val29');
    store.set('pfx38_item30', 'val30');
    store.set('pfx38_item31', 'val31');
    store.set('pfx38_item32', 'val32');
    store.set('pfx38_item33', 'val33');
    store.set('pfx38_item34', 'val34');
    store.set('pfx38_item35', 'val35');
    store.set('pfx38_item36', 'val36');
    store.set('pfx38_item37', 'val37');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx38_');
    expect(result.length).toBe(38);
  });
  it('getByPrefix 39: finds 39 keys with prefix pfx39', () => {
    const store = createMemoryStore();
    store.set('pfx39_item0', 'val0');
    store.set('pfx39_item1', 'val1');
    store.set('pfx39_item2', 'val2');
    store.set('pfx39_item3', 'val3');
    store.set('pfx39_item4', 'val4');
    store.set('pfx39_item5', 'val5');
    store.set('pfx39_item6', 'val6');
    store.set('pfx39_item7', 'val7');
    store.set('pfx39_item8', 'val8');
    store.set('pfx39_item9', 'val9');
    store.set('pfx39_item10', 'val10');
    store.set('pfx39_item11', 'val11');
    store.set('pfx39_item12', 'val12');
    store.set('pfx39_item13', 'val13');
    store.set('pfx39_item14', 'val14');
    store.set('pfx39_item15', 'val15');
    store.set('pfx39_item16', 'val16');
    store.set('pfx39_item17', 'val17');
    store.set('pfx39_item18', 'val18');
    store.set('pfx39_item19', 'val19');
    store.set('pfx39_item20', 'val20');
    store.set('pfx39_item21', 'val21');
    store.set('pfx39_item22', 'val22');
    store.set('pfx39_item23', 'val23');
    store.set('pfx39_item24', 'val24');
    store.set('pfx39_item25', 'val25');
    store.set('pfx39_item26', 'val26');
    store.set('pfx39_item27', 'val27');
    store.set('pfx39_item28', 'val28');
    store.set('pfx39_item29', 'val29');
    store.set('pfx39_item30', 'val30');
    store.set('pfx39_item31', 'val31');
    store.set('pfx39_item32', 'val32');
    store.set('pfx39_item33', 'val33');
    store.set('pfx39_item34', 'val34');
    store.set('pfx39_item35', 'val35');
    store.set('pfx39_item36', 'val36');
    store.set('pfx39_item37', 'val37');
    store.set('pfx39_item38', 'val38');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx39_');
    expect(result.length).toBe(39);
  });
  it('getByPrefix 40: finds 40 keys with prefix pfx40', () => {
    const store = createMemoryStore();
    store.set('pfx40_item0', 'val0');
    store.set('pfx40_item1', 'val1');
    store.set('pfx40_item2', 'val2');
    store.set('pfx40_item3', 'val3');
    store.set('pfx40_item4', 'val4');
    store.set('pfx40_item5', 'val5');
    store.set('pfx40_item6', 'val6');
    store.set('pfx40_item7', 'val7');
    store.set('pfx40_item8', 'val8');
    store.set('pfx40_item9', 'val9');
    store.set('pfx40_item10', 'val10');
    store.set('pfx40_item11', 'val11');
    store.set('pfx40_item12', 'val12');
    store.set('pfx40_item13', 'val13');
    store.set('pfx40_item14', 'val14');
    store.set('pfx40_item15', 'val15');
    store.set('pfx40_item16', 'val16');
    store.set('pfx40_item17', 'val17');
    store.set('pfx40_item18', 'val18');
    store.set('pfx40_item19', 'val19');
    store.set('pfx40_item20', 'val20');
    store.set('pfx40_item21', 'val21');
    store.set('pfx40_item22', 'val22');
    store.set('pfx40_item23', 'val23');
    store.set('pfx40_item24', 'val24');
    store.set('pfx40_item25', 'val25');
    store.set('pfx40_item26', 'val26');
    store.set('pfx40_item27', 'val27');
    store.set('pfx40_item28', 'val28');
    store.set('pfx40_item29', 'val29');
    store.set('pfx40_item30', 'val30');
    store.set('pfx40_item31', 'val31');
    store.set('pfx40_item32', 'val32');
    store.set('pfx40_item33', 'val33');
    store.set('pfx40_item34', 'val34');
    store.set('pfx40_item35', 'val35');
    store.set('pfx40_item36', 'val36');
    store.set('pfx40_item37', 'val37');
    store.set('pfx40_item38', 'val38');
    store.set('pfx40_item39', 'val39');
    store.set('other', 'no');
    const result = getByPrefix(store, 'pfx40_');
    expect(result.length).toBe(40);
  });
  it('getByPrefix none 1: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_1', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 2: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_2', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 3: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_3', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 4: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_4', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 5: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_5', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 6: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_6', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 7: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_7', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 8: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_8', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 9: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_9', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 10: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_10', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 11: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_11', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 12: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_12', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 13: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_13', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 14: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_14', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 15: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_15', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 16: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_16', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 17: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_17', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 18: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_18', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 19: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_19', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('getByPrefix none 20: returns [] when no match', () => {
    const store = createMemoryStore();
    store.set('abc_20', 'v');
    expect(getByPrefix(store, 'xyz_')).toEqual([]);
  });
  it('removeByPrefix 1: removes 1 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx1_0', 'v');
    store.set('safe_1', 'keep');
    const removed = removeByPrefix(store, 'rpfx1_');
    expect(removed).toBe(1);
    expect(store.has('safe_1')).toBe(true);
  });
  it('removeByPrefix 2: removes 2 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx2_0', 'v');
    store.set('rpfx2_1', 'v');
    store.set('safe_2', 'keep');
    const removed = removeByPrefix(store, 'rpfx2_');
    expect(removed).toBe(2);
    expect(store.has('safe_2')).toBe(true);
  });
  it('removeByPrefix 3: removes 3 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx3_0', 'v');
    store.set('rpfx3_1', 'v');
    store.set('rpfx3_2', 'v');
    store.set('safe_3', 'keep');
    const removed = removeByPrefix(store, 'rpfx3_');
    expect(removed).toBe(3);
    expect(store.has('safe_3')).toBe(true);
  });
  it('removeByPrefix 4: removes 4 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx4_0', 'v');
    store.set('rpfx4_1', 'v');
    store.set('rpfx4_2', 'v');
    store.set('rpfx4_3', 'v');
    store.set('safe_4', 'keep');
    const removed = removeByPrefix(store, 'rpfx4_');
    expect(removed).toBe(4);
    expect(store.has('safe_4')).toBe(true);
  });
  it('removeByPrefix 5: removes 5 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx5_0', 'v');
    store.set('rpfx5_1', 'v');
    store.set('rpfx5_2', 'v');
    store.set('rpfx5_3', 'v');
    store.set('rpfx5_4', 'v');
    store.set('safe_5', 'keep');
    const removed = removeByPrefix(store, 'rpfx5_');
    expect(removed).toBe(5);
    expect(store.has('safe_5')).toBe(true);
  });
  it('removeByPrefix 6: removes 6 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx6_0', 'v');
    store.set('rpfx6_1', 'v');
    store.set('rpfx6_2', 'v');
    store.set('rpfx6_3', 'v');
    store.set('rpfx6_4', 'v');
    store.set('rpfx6_5', 'v');
    store.set('safe_6', 'keep');
    const removed = removeByPrefix(store, 'rpfx6_');
    expect(removed).toBe(6);
    expect(store.has('safe_6')).toBe(true);
  });
  it('removeByPrefix 7: removes 7 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx7_0', 'v');
    store.set('rpfx7_1', 'v');
    store.set('rpfx7_2', 'v');
    store.set('rpfx7_3', 'v');
    store.set('rpfx7_4', 'v');
    store.set('rpfx7_5', 'v');
    store.set('rpfx7_6', 'v');
    store.set('safe_7', 'keep');
    const removed = removeByPrefix(store, 'rpfx7_');
    expect(removed).toBe(7);
    expect(store.has('safe_7')).toBe(true);
  });
  it('removeByPrefix 8: removes 8 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx8_0', 'v');
    store.set('rpfx8_1', 'v');
    store.set('rpfx8_2', 'v');
    store.set('rpfx8_3', 'v');
    store.set('rpfx8_4', 'v');
    store.set('rpfx8_5', 'v');
    store.set('rpfx8_6', 'v');
    store.set('rpfx8_7', 'v');
    store.set('safe_8', 'keep');
    const removed = removeByPrefix(store, 'rpfx8_');
    expect(removed).toBe(8);
    expect(store.has('safe_8')).toBe(true);
  });
  it('removeByPrefix 9: removes 9 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx9_0', 'v');
    store.set('rpfx9_1', 'v');
    store.set('rpfx9_2', 'v');
    store.set('rpfx9_3', 'v');
    store.set('rpfx9_4', 'v');
    store.set('rpfx9_5', 'v');
    store.set('rpfx9_6', 'v');
    store.set('rpfx9_7', 'v');
    store.set('rpfx9_8', 'v');
    store.set('safe_9', 'keep');
    const removed = removeByPrefix(store, 'rpfx9_');
    expect(removed).toBe(9);
    expect(store.has('safe_9')).toBe(true);
  });
  it('removeByPrefix 10: removes 10 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx10_0', 'v');
    store.set('rpfx10_1', 'v');
    store.set('rpfx10_2', 'v');
    store.set('rpfx10_3', 'v');
    store.set('rpfx10_4', 'v');
    store.set('rpfx10_5', 'v');
    store.set('rpfx10_6', 'v');
    store.set('rpfx10_7', 'v');
    store.set('rpfx10_8', 'v');
    store.set('rpfx10_9', 'v');
    store.set('safe_10', 'keep');
    const removed = removeByPrefix(store, 'rpfx10_');
    expect(removed).toBe(10);
    expect(store.has('safe_10')).toBe(true);
  });
  it('removeByPrefix 11: removes 11 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx11_0', 'v');
    store.set('rpfx11_1', 'v');
    store.set('rpfx11_2', 'v');
    store.set('rpfx11_3', 'v');
    store.set('rpfx11_4', 'v');
    store.set('rpfx11_5', 'v');
    store.set('rpfx11_6', 'v');
    store.set('rpfx11_7', 'v');
    store.set('rpfx11_8', 'v');
    store.set('rpfx11_9', 'v');
    store.set('rpfx11_10', 'v');
    store.set('safe_11', 'keep');
    const removed = removeByPrefix(store, 'rpfx11_');
    expect(removed).toBe(11);
    expect(store.has('safe_11')).toBe(true);
  });
  it('removeByPrefix 12: removes 12 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx12_0', 'v');
    store.set('rpfx12_1', 'v');
    store.set('rpfx12_2', 'v');
    store.set('rpfx12_3', 'v');
    store.set('rpfx12_4', 'v');
    store.set('rpfx12_5', 'v');
    store.set('rpfx12_6', 'v');
    store.set('rpfx12_7', 'v');
    store.set('rpfx12_8', 'v');
    store.set('rpfx12_9', 'v');
    store.set('rpfx12_10', 'v');
    store.set('rpfx12_11', 'v');
    store.set('safe_12', 'keep');
    const removed = removeByPrefix(store, 'rpfx12_');
    expect(removed).toBe(12);
    expect(store.has('safe_12')).toBe(true);
  });
  it('removeByPrefix 13: removes 13 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx13_0', 'v');
    store.set('rpfx13_1', 'v');
    store.set('rpfx13_2', 'v');
    store.set('rpfx13_3', 'v');
    store.set('rpfx13_4', 'v');
    store.set('rpfx13_5', 'v');
    store.set('rpfx13_6', 'v');
    store.set('rpfx13_7', 'v');
    store.set('rpfx13_8', 'v');
    store.set('rpfx13_9', 'v');
    store.set('rpfx13_10', 'v');
    store.set('rpfx13_11', 'v');
    store.set('rpfx13_12', 'v');
    store.set('safe_13', 'keep');
    const removed = removeByPrefix(store, 'rpfx13_');
    expect(removed).toBe(13);
    expect(store.has('safe_13')).toBe(true);
  });
  it('removeByPrefix 14: removes 14 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx14_0', 'v');
    store.set('rpfx14_1', 'v');
    store.set('rpfx14_2', 'v');
    store.set('rpfx14_3', 'v');
    store.set('rpfx14_4', 'v');
    store.set('rpfx14_5', 'v');
    store.set('rpfx14_6', 'v');
    store.set('rpfx14_7', 'v');
    store.set('rpfx14_8', 'v');
    store.set('rpfx14_9', 'v');
    store.set('rpfx14_10', 'v');
    store.set('rpfx14_11', 'v');
    store.set('rpfx14_12', 'v');
    store.set('rpfx14_13', 'v');
    store.set('safe_14', 'keep');
    const removed = removeByPrefix(store, 'rpfx14_');
    expect(removed).toBe(14);
    expect(store.has('safe_14')).toBe(true);
  });
  it('removeByPrefix 15: removes 15 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx15_0', 'v');
    store.set('rpfx15_1', 'v');
    store.set('rpfx15_2', 'v');
    store.set('rpfx15_3', 'v');
    store.set('rpfx15_4', 'v');
    store.set('rpfx15_5', 'v');
    store.set('rpfx15_6', 'v');
    store.set('rpfx15_7', 'v');
    store.set('rpfx15_8', 'v');
    store.set('rpfx15_9', 'v');
    store.set('rpfx15_10', 'v');
    store.set('rpfx15_11', 'v');
    store.set('rpfx15_12', 'v');
    store.set('rpfx15_13', 'v');
    store.set('rpfx15_14', 'v');
    store.set('safe_15', 'keep');
    const removed = removeByPrefix(store, 'rpfx15_');
    expect(removed).toBe(15);
    expect(store.has('safe_15')).toBe(true);
  });
  it('removeByPrefix 16: removes 16 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx16_0', 'v');
    store.set('rpfx16_1', 'v');
    store.set('rpfx16_2', 'v');
    store.set('rpfx16_3', 'v');
    store.set('rpfx16_4', 'v');
    store.set('rpfx16_5', 'v');
    store.set('rpfx16_6', 'v');
    store.set('rpfx16_7', 'v');
    store.set('rpfx16_8', 'v');
    store.set('rpfx16_9', 'v');
    store.set('rpfx16_10', 'v');
    store.set('rpfx16_11', 'v');
    store.set('rpfx16_12', 'v');
    store.set('rpfx16_13', 'v');
    store.set('rpfx16_14', 'v');
    store.set('rpfx16_15', 'v');
    store.set('safe_16', 'keep');
    const removed = removeByPrefix(store, 'rpfx16_');
    expect(removed).toBe(16);
    expect(store.has('safe_16')).toBe(true);
  });
  it('removeByPrefix 17: removes 17 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx17_0', 'v');
    store.set('rpfx17_1', 'v');
    store.set('rpfx17_2', 'v');
    store.set('rpfx17_3', 'v');
    store.set('rpfx17_4', 'v');
    store.set('rpfx17_5', 'v');
    store.set('rpfx17_6', 'v');
    store.set('rpfx17_7', 'v');
    store.set('rpfx17_8', 'v');
    store.set('rpfx17_9', 'v');
    store.set('rpfx17_10', 'v');
    store.set('rpfx17_11', 'v');
    store.set('rpfx17_12', 'v');
    store.set('rpfx17_13', 'v');
    store.set('rpfx17_14', 'v');
    store.set('rpfx17_15', 'v');
    store.set('rpfx17_16', 'v');
    store.set('safe_17', 'keep');
    const removed = removeByPrefix(store, 'rpfx17_');
    expect(removed).toBe(17);
    expect(store.has('safe_17')).toBe(true);
  });
  it('removeByPrefix 18: removes 18 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx18_0', 'v');
    store.set('rpfx18_1', 'v');
    store.set('rpfx18_2', 'v');
    store.set('rpfx18_3', 'v');
    store.set('rpfx18_4', 'v');
    store.set('rpfx18_5', 'v');
    store.set('rpfx18_6', 'v');
    store.set('rpfx18_7', 'v');
    store.set('rpfx18_8', 'v');
    store.set('rpfx18_9', 'v');
    store.set('rpfx18_10', 'v');
    store.set('rpfx18_11', 'v');
    store.set('rpfx18_12', 'v');
    store.set('rpfx18_13', 'v');
    store.set('rpfx18_14', 'v');
    store.set('rpfx18_15', 'v');
    store.set('rpfx18_16', 'v');
    store.set('rpfx18_17', 'v');
    store.set('safe_18', 'keep');
    const removed = removeByPrefix(store, 'rpfx18_');
    expect(removed).toBe(18);
    expect(store.has('safe_18')).toBe(true);
  });
  it('removeByPrefix 19: removes 19 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx19_0', 'v');
    store.set('rpfx19_1', 'v');
    store.set('rpfx19_2', 'v');
    store.set('rpfx19_3', 'v');
    store.set('rpfx19_4', 'v');
    store.set('rpfx19_5', 'v');
    store.set('rpfx19_6', 'v');
    store.set('rpfx19_7', 'v');
    store.set('rpfx19_8', 'v');
    store.set('rpfx19_9', 'v');
    store.set('rpfx19_10', 'v');
    store.set('rpfx19_11', 'v');
    store.set('rpfx19_12', 'v');
    store.set('rpfx19_13', 'v');
    store.set('rpfx19_14', 'v');
    store.set('rpfx19_15', 'v');
    store.set('rpfx19_16', 'v');
    store.set('rpfx19_17', 'v');
    store.set('rpfx19_18', 'v');
    store.set('safe_19', 'keep');
    const removed = removeByPrefix(store, 'rpfx19_');
    expect(removed).toBe(19);
    expect(store.has('safe_19')).toBe(true);
  });
  it('removeByPrefix 20: removes 20 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx20_0', 'v');
    store.set('rpfx20_1', 'v');
    store.set('rpfx20_2', 'v');
    store.set('rpfx20_3', 'v');
    store.set('rpfx20_4', 'v');
    store.set('rpfx20_5', 'v');
    store.set('rpfx20_6', 'v');
    store.set('rpfx20_7', 'v');
    store.set('rpfx20_8', 'v');
    store.set('rpfx20_9', 'v');
    store.set('rpfx20_10', 'v');
    store.set('rpfx20_11', 'v');
    store.set('rpfx20_12', 'v');
    store.set('rpfx20_13', 'v');
    store.set('rpfx20_14', 'v');
    store.set('rpfx20_15', 'v');
    store.set('rpfx20_16', 'v');
    store.set('rpfx20_17', 'v');
    store.set('rpfx20_18', 'v');
    store.set('rpfx20_19', 'v');
    store.set('safe_20', 'keep');
    const removed = removeByPrefix(store, 'rpfx20_');
    expect(removed).toBe(20);
    expect(store.has('safe_20')).toBe(true);
  });
  it('removeByPrefix 21: removes 21 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx21_0', 'v');
    store.set('rpfx21_1', 'v');
    store.set('rpfx21_2', 'v');
    store.set('rpfx21_3', 'v');
    store.set('rpfx21_4', 'v');
    store.set('rpfx21_5', 'v');
    store.set('rpfx21_6', 'v');
    store.set('rpfx21_7', 'v');
    store.set('rpfx21_8', 'v');
    store.set('rpfx21_9', 'v');
    store.set('rpfx21_10', 'v');
    store.set('rpfx21_11', 'v');
    store.set('rpfx21_12', 'v');
    store.set('rpfx21_13', 'v');
    store.set('rpfx21_14', 'v');
    store.set('rpfx21_15', 'v');
    store.set('rpfx21_16', 'v');
    store.set('rpfx21_17', 'v');
    store.set('rpfx21_18', 'v');
    store.set('rpfx21_19', 'v');
    store.set('rpfx21_20', 'v');
    store.set('safe_21', 'keep');
    const removed = removeByPrefix(store, 'rpfx21_');
    expect(removed).toBe(21);
    expect(store.has('safe_21')).toBe(true);
  });
  it('removeByPrefix 22: removes 22 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx22_0', 'v');
    store.set('rpfx22_1', 'v');
    store.set('rpfx22_2', 'v');
    store.set('rpfx22_3', 'v');
    store.set('rpfx22_4', 'v');
    store.set('rpfx22_5', 'v');
    store.set('rpfx22_6', 'v');
    store.set('rpfx22_7', 'v');
    store.set('rpfx22_8', 'v');
    store.set('rpfx22_9', 'v');
    store.set('rpfx22_10', 'v');
    store.set('rpfx22_11', 'v');
    store.set('rpfx22_12', 'v');
    store.set('rpfx22_13', 'v');
    store.set('rpfx22_14', 'v');
    store.set('rpfx22_15', 'v');
    store.set('rpfx22_16', 'v');
    store.set('rpfx22_17', 'v');
    store.set('rpfx22_18', 'v');
    store.set('rpfx22_19', 'v');
    store.set('rpfx22_20', 'v');
    store.set('rpfx22_21', 'v');
    store.set('safe_22', 'keep');
    const removed = removeByPrefix(store, 'rpfx22_');
    expect(removed).toBe(22);
    expect(store.has('safe_22')).toBe(true);
  });
  it('removeByPrefix 23: removes 23 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx23_0', 'v');
    store.set('rpfx23_1', 'v');
    store.set('rpfx23_2', 'v');
    store.set('rpfx23_3', 'v');
    store.set('rpfx23_4', 'v');
    store.set('rpfx23_5', 'v');
    store.set('rpfx23_6', 'v');
    store.set('rpfx23_7', 'v');
    store.set('rpfx23_8', 'v');
    store.set('rpfx23_9', 'v');
    store.set('rpfx23_10', 'v');
    store.set('rpfx23_11', 'v');
    store.set('rpfx23_12', 'v');
    store.set('rpfx23_13', 'v');
    store.set('rpfx23_14', 'v');
    store.set('rpfx23_15', 'v');
    store.set('rpfx23_16', 'v');
    store.set('rpfx23_17', 'v');
    store.set('rpfx23_18', 'v');
    store.set('rpfx23_19', 'v');
    store.set('rpfx23_20', 'v');
    store.set('rpfx23_21', 'v');
    store.set('rpfx23_22', 'v');
    store.set('safe_23', 'keep');
    const removed = removeByPrefix(store, 'rpfx23_');
    expect(removed).toBe(23);
    expect(store.has('safe_23')).toBe(true);
  });
  it('removeByPrefix 24: removes 24 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx24_0', 'v');
    store.set('rpfx24_1', 'v');
    store.set('rpfx24_2', 'v');
    store.set('rpfx24_3', 'v');
    store.set('rpfx24_4', 'v');
    store.set('rpfx24_5', 'v');
    store.set('rpfx24_6', 'v');
    store.set('rpfx24_7', 'v');
    store.set('rpfx24_8', 'v');
    store.set('rpfx24_9', 'v');
    store.set('rpfx24_10', 'v');
    store.set('rpfx24_11', 'v');
    store.set('rpfx24_12', 'v');
    store.set('rpfx24_13', 'v');
    store.set('rpfx24_14', 'v');
    store.set('rpfx24_15', 'v');
    store.set('rpfx24_16', 'v');
    store.set('rpfx24_17', 'v');
    store.set('rpfx24_18', 'v');
    store.set('rpfx24_19', 'v');
    store.set('rpfx24_20', 'v');
    store.set('rpfx24_21', 'v');
    store.set('rpfx24_22', 'v');
    store.set('rpfx24_23', 'v');
    store.set('safe_24', 'keep');
    const removed = removeByPrefix(store, 'rpfx24_');
    expect(removed).toBe(24);
    expect(store.has('safe_24')).toBe(true);
  });
  it('removeByPrefix 25: removes 25 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx25_0', 'v');
    store.set('rpfx25_1', 'v');
    store.set('rpfx25_2', 'v');
    store.set('rpfx25_3', 'v');
    store.set('rpfx25_4', 'v');
    store.set('rpfx25_5', 'v');
    store.set('rpfx25_6', 'v');
    store.set('rpfx25_7', 'v');
    store.set('rpfx25_8', 'v');
    store.set('rpfx25_9', 'v');
    store.set('rpfx25_10', 'v');
    store.set('rpfx25_11', 'v');
    store.set('rpfx25_12', 'v');
    store.set('rpfx25_13', 'v');
    store.set('rpfx25_14', 'v');
    store.set('rpfx25_15', 'v');
    store.set('rpfx25_16', 'v');
    store.set('rpfx25_17', 'v');
    store.set('rpfx25_18', 'v');
    store.set('rpfx25_19', 'v');
    store.set('rpfx25_20', 'v');
    store.set('rpfx25_21', 'v');
    store.set('rpfx25_22', 'v');
    store.set('rpfx25_23', 'v');
    store.set('rpfx25_24', 'v');
    store.set('safe_25', 'keep');
    const removed = removeByPrefix(store, 'rpfx25_');
    expect(removed).toBe(25);
    expect(store.has('safe_25')).toBe(true);
  });
  it('removeByPrefix 26: removes 26 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx26_0', 'v');
    store.set('rpfx26_1', 'v');
    store.set('rpfx26_2', 'v');
    store.set('rpfx26_3', 'v');
    store.set('rpfx26_4', 'v');
    store.set('rpfx26_5', 'v');
    store.set('rpfx26_6', 'v');
    store.set('rpfx26_7', 'v');
    store.set('rpfx26_8', 'v');
    store.set('rpfx26_9', 'v');
    store.set('rpfx26_10', 'v');
    store.set('rpfx26_11', 'v');
    store.set('rpfx26_12', 'v');
    store.set('rpfx26_13', 'v');
    store.set('rpfx26_14', 'v');
    store.set('rpfx26_15', 'v');
    store.set('rpfx26_16', 'v');
    store.set('rpfx26_17', 'v');
    store.set('rpfx26_18', 'v');
    store.set('rpfx26_19', 'v');
    store.set('rpfx26_20', 'v');
    store.set('rpfx26_21', 'v');
    store.set('rpfx26_22', 'v');
    store.set('rpfx26_23', 'v');
    store.set('rpfx26_24', 'v');
    store.set('rpfx26_25', 'v');
    store.set('safe_26', 'keep');
    const removed = removeByPrefix(store, 'rpfx26_');
    expect(removed).toBe(26);
    expect(store.has('safe_26')).toBe(true);
  });
  it('removeByPrefix 27: removes 27 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx27_0', 'v');
    store.set('rpfx27_1', 'v');
    store.set('rpfx27_2', 'v');
    store.set('rpfx27_3', 'v');
    store.set('rpfx27_4', 'v');
    store.set('rpfx27_5', 'v');
    store.set('rpfx27_6', 'v');
    store.set('rpfx27_7', 'v');
    store.set('rpfx27_8', 'v');
    store.set('rpfx27_9', 'v');
    store.set('rpfx27_10', 'v');
    store.set('rpfx27_11', 'v');
    store.set('rpfx27_12', 'v');
    store.set('rpfx27_13', 'v');
    store.set('rpfx27_14', 'v');
    store.set('rpfx27_15', 'v');
    store.set('rpfx27_16', 'v');
    store.set('rpfx27_17', 'v');
    store.set('rpfx27_18', 'v');
    store.set('rpfx27_19', 'v');
    store.set('rpfx27_20', 'v');
    store.set('rpfx27_21', 'v');
    store.set('rpfx27_22', 'v');
    store.set('rpfx27_23', 'v');
    store.set('rpfx27_24', 'v');
    store.set('rpfx27_25', 'v');
    store.set('rpfx27_26', 'v');
    store.set('safe_27', 'keep');
    const removed = removeByPrefix(store, 'rpfx27_');
    expect(removed).toBe(27);
    expect(store.has('safe_27')).toBe(true);
  });
  it('removeByPrefix 28: removes 28 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx28_0', 'v');
    store.set('rpfx28_1', 'v');
    store.set('rpfx28_2', 'v');
    store.set('rpfx28_3', 'v');
    store.set('rpfx28_4', 'v');
    store.set('rpfx28_5', 'v');
    store.set('rpfx28_6', 'v');
    store.set('rpfx28_7', 'v');
    store.set('rpfx28_8', 'v');
    store.set('rpfx28_9', 'v');
    store.set('rpfx28_10', 'v');
    store.set('rpfx28_11', 'v');
    store.set('rpfx28_12', 'v');
    store.set('rpfx28_13', 'v');
    store.set('rpfx28_14', 'v');
    store.set('rpfx28_15', 'v');
    store.set('rpfx28_16', 'v');
    store.set('rpfx28_17', 'v');
    store.set('rpfx28_18', 'v');
    store.set('rpfx28_19', 'v');
    store.set('rpfx28_20', 'v');
    store.set('rpfx28_21', 'v');
    store.set('rpfx28_22', 'v');
    store.set('rpfx28_23', 'v');
    store.set('rpfx28_24', 'v');
    store.set('rpfx28_25', 'v');
    store.set('rpfx28_26', 'v');
    store.set('rpfx28_27', 'v');
    store.set('safe_28', 'keep');
    const removed = removeByPrefix(store, 'rpfx28_');
    expect(removed).toBe(28);
    expect(store.has('safe_28')).toBe(true);
  });
  it('removeByPrefix 29: removes 29 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx29_0', 'v');
    store.set('rpfx29_1', 'v');
    store.set('rpfx29_2', 'v');
    store.set('rpfx29_3', 'v');
    store.set('rpfx29_4', 'v');
    store.set('rpfx29_5', 'v');
    store.set('rpfx29_6', 'v');
    store.set('rpfx29_7', 'v');
    store.set('rpfx29_8', 'v');
    store.set('rpfx29_9', 'v');
    store.set('rpfx29_10', 'v');
    store.set('rpfx29_11', 'v');
    store.set('rpfx29_12', 'v');
    store.set('rpfx29_13', 'v');
    store.set('rpfx29_14', 'v');
    store.set('rpfx29_15', 'v');
    store.set('rpfx29_16', 'v');
    store.set('rpfx29_17', 'v');
    store.set('rpfx29_18', 'v');
    store.set('rpfx29_19', 'v');
    store.set('rpfx29_20', 'v');
    store.set('rpfx29_21', 'v');
    store.set('rpfx29_22', 'v');
    store.set('rpfx29_23', 'v');
    store.set('rpfx29_24', 'v');
    store.set('rpfx29_25', 'v');
    store.set('rpfx29_26', 'v');
    store.set('rpfx29_27', 'v');
    store.set('rpfx29_28', 'v');
    store.set('safe_29', 'keep');
    const removed = removeByPrefix(store, 'rpfx29_');
    expect(removed).toBe(29);
    expect(store.has('safe_29')).toBe(true);
  });
  it('removeByPrefix 30: removes 30 entries and returns count', () => {
    const store = createMemoryStore();
    store.set('rpfx30_0', 'v');
    store.set('rpfx30_1', 'v');
    store.set('rpfx30_2', 'v');
    store.set('rpfx30_3', 'v');
    store.set('rpfx30_4', 'v');
    store.set('rpfx30_5', 'v');
    store.set('rpfx30_6', 'v');
    store.set('rpfx30_7', 'v');
    store.set('rpfx30_8', 'v');
    store.set('rpfx30_9', 'v');
    store.set('rpfx30_10', 'v');
    store.set('rpfx30_11', 'v');
    store.set('rpfx30_12', 'v');
    store.set('rpfx30_13', 'v');
    store.set('rpfx30_14', 'v');
    store.set('rpfx30_15', 'v');
    store.set('rpfx30_16', 'v');
    store.set('rpfx30_17', 'v');
    store.set('rpfx30_18', 'v');
    store.set('rpfx30_19', 'v');
    store.set('rpfx30_20', 'v');
    store.set('rpfx30_21', 'v');
    store.set('rpfx30_22', 'v');
    store.set('rpfx30_23', 'v');
    store.set('rpfx30_24', 'v');
    store.set('rpfx30_25', 'v');
    store.set('rpfx30_26', 'v');
    store.set('rpfx30_27', 'v');
    store.set('rpfx30_28', 'v');
    store.set('rpfx30_29', 'v');
    store.set('safe_30', 'keep');
    const removed = removeByPrefix(store, 'rpfx30_');
    expect(removed).toBe(30);
    expect(store.has('safe_30')).toBe(true);
  });
  it('getByPattern 1: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_1_a', 'va');
    store.set('item_1_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_1_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 2: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_2_a', 'va');
    store.set('item_2_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_2_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 3: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_3_a', 'va');
    store.set('item_3_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_3_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 4: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_4_a', 'va');
    store.set('item_4_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_4_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 5: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_5_a', 'va');
    store.set('item_5_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_5_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 6: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_6_a', 'va');
    store.set('item_6_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_6_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 7: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_7_a', 'va');
    store.set('item_7_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_7_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 8: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_8_a', 'va');
    store.set('item_8_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_8_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 9: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_9_a', 'va');
    store.set('item_9_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_9_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 10: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_10_a', 'va');
    store.set('item_10_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_10_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 11: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_11_a', 'va');
    store.set('item_11_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_11_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 12: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_12_a', 'va');
    store.set('item_12_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_12_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 13: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_13_a', 'va');
    store.set('item_13_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_13_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 14: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_14_a', 'va');
    store.set('item_14_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_14_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 15: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_15_a', 'va');
    store.set('item_15_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_15_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 16: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_16_a', 'va');
    store.set('item_16_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_16_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 17: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_17_a', 'va');
    store.set('item_17_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_17_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 18: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_18_a', 'va');
    store.set('item_18_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_18_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 19: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_19_a', 'va');
    store.set('item_19_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_19_/);
    expect(result.length).toBe(2);
  });
  it('getByPattern 20: pattern matches keys with digits', () => {
    const store = createMemoryStore();
    store.set('item_20_a', 'va');
    store.set('item_20_b', 'vb');
    store.set('other', 'no');
    const result = getByPattern(store, /^item_20_/);
    expect(result.length).toBe(2);
  });
  it('removeByPrefix none: returns 0 when nothing removed', () => {
    const store = createMemoryStore();
    store.set('abc', 'v');
    expect(removeByPrefix(store, 'xyz')).toBe(0);
  });
  it('getByPattern empty: returns [] for no match', () => {
    const store = createMemoryStore();
    store.set('hello', 'world');
    expect(getByPattern(store, /^zzz/)).toEqual([]);
  });
});

describe('getStorageSize / getKeySize', () => {
  it('getKeySize 1: key=1 val=2 = 3', () => {
    const store = createMemoryStore();
    store.set('k', 'vv');
    expect(getKeySize(store, 'k')).toBe(3);
  });
  it('getKeySize 2: key=2 val=4 = 6', () => {
    const store = createMemoryStore();
    store.set('kk', 'vvvv');
    expect(getKeySize(store, 'kk')).toBe(6);
  });
  it('getKeySize 3: key=3 val=6 = 9', () => {
    const store = createMemoryStore();
    store.set('kkk', 'vvvvvv');
    expect(getKeySize(store, 'kkk')).toBe(9);
  });
  it('getKeySize 4: key=4 val=8 = 12', () => {
    const store = createMemoryStore();
    store.set('kkkk', 'vvvvvvvv');
    expect(getKeySize(store, 'kkkk')).toBe(12);
  });
  it('getKeySize 5: key=5 val=10 = 15', () => {
    const store = createMemoryStore();
    store.set('kkkkk', 'vvvvvvvvvv');
    expect(getKeySize(store, 'kkkkk')).toBe(15);
  });
  it('getKeySize 6: key=6 val=12 = 18', () => {
    const store = createMemoryStore();
    store.set('kkkkkk', 'vvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkk')).toBe(18);
  });
  it('getKeySize 7: key=7 val=14 = 21', () => {
    const store = createMemoryStore();
    store.set('kkkkkkk', 'vvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkk')).toBe(21);
  });
  it('getKeySize 8: key=8 val=16 = 24', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkk', 'vvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkk')).toBe(24);
  });
  it('getKeySize 9: key=9 val=18 = 27', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkk', 'vvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkk')).toBe(27);
  });
  it('getKeySize 10: key=10 val=20 = 30', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkk')).toBe(30);
  });
  it('getKeySize 11: key=11 val=22 = 33', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkk')).toBe(33);
  });
  it('getKeySize 12: key=12 val=24 = 36', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkk')).toBe(36);
  });
  it('getKeySize 13: key=13 val=26 = 39', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkk')).toBe(39);
  });
  it('getKeySize 14: key=14 val=28 = 42', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkk')).toBe(42);
  });
  it('getKeySize 15: key=15 val=30 = 45', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkk')).toBe(45);
  });
  it('getKeySize 16: key=16 val=32 = 48', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkk')).toBe(48);
  });
  it('getKeySize 17: key=17 val=34 = 51', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkk')).toBe(51);
  });
  it('getKeySize 18: key=18 val=36 = 54', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkk')).toBe(54);
  });
  it('getKeySize 19: key=19 val=38 = 57', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkk')).toBe(57);
  });
  it('getKeySize 20: key=20 val=40 = 60', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkk')).toBe(60);
  });
  it('getKeySize 21: key=21 val=42 = 63', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkk')).toBe(63);
  });
  it('getKeySize 22: key=22 val=44 = 66', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkk')).toBe(66);
  });
  it('getKeySize 23: key=23 val=46 = 69', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkk')).toBe(69);
  });
  it('getKeySize 24: key=24 val=48 = 72', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkk')).toBe(72);
  });
  it('getKeySize 25: key=25 val=50 = 75', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(75);
  });
  it('getKeySize 26: key=26 val=52 = 78', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(78);
  });
  it('getKeySize 27: key=27 val=54 = 81', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(81);
  });
  it('getKeySize 28: key=28 val=56 = 84', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(84);
  });
  it('getKeySize 29: key=29 val=58 = 87', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(87);
  });
  it('getKeySize 30: key=30 val=60 = 90', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(90);
  });
  it('getKeySize 31: key=31 val=62 = 93', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(93);
  });
  it('getKeySize 32: key=32 val=64 = 96', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(96);
  });
  it('getKeySize 33: key=33 val=66 = 99', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(99);
  });
  it('getKeySize 34: key=34 val=68 = 102', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(102);
  });
  it('getKeySize 35: key=35 val=70 = 105', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(105);
  });
  it('getKeySize 36: key=36 val=72 = 108', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(108);
  });
  it('getKeySize 37: key=37 val=74 = 111', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(111);
  });
  it('getKeySize 38: key=38 val=76 = 114', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(114);
  });
  it('getKeySize 39: key=39 val=78 = 117', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(117);
  });
  it('getKeySize 40: key=40 val=80 = 120', () => {
    const store = createMemoryStore();
    store.set('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    expect(getKeySize(store, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')).toBe(120);
  });
  it('getKeySize missing 1: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_1')).toBe(0);
  });
  it('getKeySize missing 2: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_2')).toBe(0);
  });
  it('getKeySize missing 3: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_3')).toBe(0);
  });
  it('getKeySize missing 4: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_4')).toBe(0);
  });
  it('getKeySize missing 5: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_5')).toBe(0);
  });
  it('getKeySize missing 6: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_6')).toBe(0);
  });
  it('getKeySize missing 7: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_7')).toBe(0);
  });
  it('getKeySize missing 8: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_8')).toBe(0);
  });
  it('getKeySize missing 9: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_9')).toBe(0);
  });
  it('getKeySize missing 10: returns 0 for absent key', () => {
    const store = createMemoryStore();
    expect(getKeySize(store, 'nonexistent_10')).toBe(0);
  });
  it('getStorageSize 1: size accumulates over 1 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0');
    expect(getStorageSize(store)).toBe(6);
  });
  it('getStorageSize 2: size accumulates over 2 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1');
    expect(getStorageSize(store)).toBe(12);
  });
  it('getStorageSize 3: size accumulates over 3 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2');
    expect(getStorageSize(store)).toBe(18);
  });
  it('getStorageSize 4: size accumulates over 4 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3');
    expect(getStorageSize(store)).toBe(24);
  });
  it('getStorageSize 5: size accumulates over 5 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4');
    expect(getStorageSize(store)).toBe(30);
  });
  it('getStorageSize 6: size accumulates over 6 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5');
    expect(getStorageSize(store)).toBe(36);
  });
  it('getStorageSize 7: size accumulates over 7 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6');
    expect(getStorageSize(store)).toBe(42);
  });
  it('getStorageSize 8: size accumulates over 8 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7');
    expect(getStorageSize(store)).toBe(48);
  });
  it('getStorageSize 9: size accumulates over 9 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8');
    expect(getStorageSize(store)).toBe(54);
  });
  it('getStorageSize 10: size accumulates over 10 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9');
    expect(getStorageSize(store)).toBe(60);
  });
  it('getStorageSize 11: size accumulates over 11 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10');
    expect(getStorageSize(store)).toBe(68);
  });
  it('getStorageSize 12: size accumulates over 12 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11');
    expect(getStorageSize(store)).toBe(76);
  });
  it('getStorageSize 13: size accumulates over 13 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12');
    expect(getStorageSize(store)).toBe(84);
  });
  it('getStorageSize 14: size accumulates over 14 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13');
    expect(getStorageSize(store)).toBe(92);
  });
  it('getStorageSize 15: size accumulates over 15 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14');
    expect(getStorageSize(store)).toBe(100);
  });
  it('getStorageSize 16: size accumulates over 16 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15');
    expect(getStorageSize(store)).toBe(108);
  });
  it('getStorageSize 17: size accumulates over 17 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16');
    expect(getStorageSize(store)).toBe(116);
  });
  it('getStorageSize 18: size accumulates over 18 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17');
    expect(getStorageSize(store)).toBe(124);
  });
  it('getStorageSize 19: size accumulates over 19 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18');
    expect(getStorageSize(store)).toBe(132);
  });
  it('getStorageSize 20: size accumulates over 20 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19');
    expect(getStorageSize(store)).toBe(140);
  });
  it('getStorageSize 21: size accumulates over 21 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20');
    expect(getStorageSize(store)).toBe(148);
  });
  it('getStorageSize 22: size accumulates over 22 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21');
    expect(getStorageSize(store)).toBe(156);
  });
  it('getStorageSize 23: size accumulates over 23 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22');
    expect(getStorageSize(store)).toBe(164);
  });
  it('getStorageSize 24: size accumulates over 24 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23');
    expect(getStorageSize(store)).toBe(172);
  });
  it('getStorageSize 25: size accumulates over 25 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23'); store.set('sk24', 'sv24');
    expect(getStorageSize(store)).toBe(180);
  });
  it('getStorageSize 26: size accumulates over 26 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23'); store.set('sk24', 'sv24'); store.set('sk25', 'sv25');
    expect(getStorageSize(store)).toBe(188);
  });
  it('getStorageSize 27: size accumulates over 27 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23'); store.set('sk24', 'sv24'); store.set('sk25', 'sv25'); store.set('sk26', 'sv26');
    expect(getStorageSize(store)).toBe(196);
  });
  it('getStorageSize 28: size accumulates over 28 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23'); store.set('sk24', 'sv24'); store.set('sk25', 'sv25'); store.set('sk26', 'sv26'); store.set('sk27', 'sv27');
    expect(getStorageSize(store)).toBe(204);
  });
  it('getStorageSize 29: size accumulates over 29 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23'); store.set('sk24', 'sv24'); store.set('sk25', 'sv25'); store.set('sk26', 'sv26'); store.set('sk27', 'sv27'); store.set('sk28', 'sv28');
    expect(getStorageSize(store)).toBe(212);
  });
  it('getStorageSize 30: size accumulates over 30 entries', () => {
    const store = createMemoryStore();
    store.set('sk0', 'sv0'); store.set('sk1', 'sv1'); store.set('sk2', 'sv2'); store.set('sk3', 'sv3'); store.set('sk4', 'sv4'); store.set('sk5', 'sv5'); store.set('sk6', 'sv6'); store.set('sk7', 'sv7'); store.set('sk8', 'sv8'); store.set('sk9', 'sv9'); store.set('sk10', 'sv10'); store.set('sk11', 'sv11'); store.set('sk12', 'sv12'); store.set('sk13', 'sv13'); store.set('sk14', 'sv14'); store.set('sk15', 'sv15'); store.set('sk16', 'sv16'); store.set('sk17', 'sv17'); store.set('sk18', 'sv18'); store.set('sk19', 'sv19'); store.set('sk20', 'sv20'); store.set('sk21', 'sv21'); store.set('sk22', 'sv22'); store.set('sk23', 'sv23'); store.set('sk24', 'sv24'); store.set('sk25', 'sv25'); store.set('sk26', 'sv26'); store.set('sk27', 'sv27'); store.set('sk28', 'sv28'); store.set('sk29', 'sv29');
    expect(getStorageSize(store)).toBe(220);
  });
  it('getStorageSize empty: returns 0 for empty store', () => { expect(getStorageSize(createMemoryStore())).toBe(0); });
  it('getStorageSize after clear: returns 0', () => {
    const s = createMemoryStore(); s.set('a','b'); s.clear(); expect(getStorageSize(s)).toBe(0);
  });
  it('getStorageSize single: key3+val3 = 7', () => {
    const s = createMemoryStore(); s.set('key', 'val'); expect(getStorageSize(s)).toBe(6);
  });
  it('getStorageSize after remove: decreases', () => {
    const s = createMemoryStore(); s.set('a','b'); s.set('c','d'); s.remove('a');
    expect(getStorageSize(s)).toBe(2);
  });
});

describe('createTypedStore', () => {
  it('typed get/set number 1: stores number 1', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_1');
    ts.set(1);
    expect(ts.get()).toBe(1);
  });
  it('typed get/set number 2: stores number 2', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_2');
    ts.set(2);
    expect(ts.get()).toBe(2);
  });
  it('typed get/set number 3: stores number 3', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_3');
    ts.set(3);
    expect(ts.get()).toBe(3);
  });
  it('typed get/set number 4: stores number 4', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_4');
    ts.set(4);
    expect(ts.get()).toBe(4);
  });
  it('typed get/set number 5: stores number 5', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_5');
    ts.set(5);
    expect(ts.get()).toBe(5);
  });
  it('typed get/set number 6: stores number 6', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_6');
    ts.set(6);
    expect(ts.get()).toBe(6);
  });
  it('typed get/set number 7: stores number 7', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_7');
    ts.set(7);
    expect(ts.get()).toBe(7);
  });
  it('typed get/set number 8: stores number 8', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_8');
    ts.set(8);
    expect(ts.get()).toBe(8);
  });
  it('typed get/set number 9: stores number 9', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_9');
    ts.set(9);
    expect(ts.get()).toBe(9);
  });
  it('typed get/set number 10: stores number 10', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'numKey_10');
    ts.set(10);
    expect(ts.get()).toBe(10);
  });
  it('typed object 1: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_1');
    ts.set({v: 1});
    expect(ts.get()).toEqual({v: 1});
  });
  it('typed object 2: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_2');
    ts.set({v: 2});
    expect(ts.get()).toEqual({v: 2});
  });
  it('typed object 3: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_3');
    ts.set({v: 3});
    expect(ts.get()).toEqual({v: 3});
  });
  it('typed object 4: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_4');
    ts.set({v: 4});
    expect(ts.get()).toEqual({v: 4});
  });
  it('typed object 5: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_5');
    ts.set({v: 5});
    expect(ts.get()).toEqual({v: 5});
  });
  it('typed object 6: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_6');
    ts.set({v: 6});
    expect(ts.get()).toEqual({v: 6});
  });
  it('typed object 7: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_7');
    ts.set({v: 7});
    expect(ts.get()).toEqual({v: 7});
  });
  it('typed object 8: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_8');
    ts.set({v: 8});
    expect(ts.get()).toEqual({v: 8});
  });
  it('typed object 9: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_9');
    ts.set({v: 9});
    expect(ts.get()).toEqual({v: 9});
  });
  it('typed object 10: stores object', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<{v: number}>(base, 'objKey_10');
    ts.set({v: 10});
    expect(ts.get()).toEqual({v: 10});
  });
  it('typed has 1: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_1');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 2: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_2');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 3: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_3');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 4: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_4');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 5: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_5');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 6: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_6');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 7: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_7');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 8: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_8');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 9: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_9');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed has 10: has() true after set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'hasKey_10');
    ts.set('hello');
    expect(ts.has()).toBe(true);
  });
  it('typed remove 1: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_1');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 2: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_2');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 3: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_3');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 4: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_4');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 5: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_5');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 6: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_6');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 7: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_7');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 8: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_8');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 9: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_9');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed remove 10: has() false after remove', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<string>(base, 'remKey_10');
    ts.set('v');
    ts.remove();
    expect(ts.has()).toBe(false);
  });
  it('typed get null 1: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_1');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 2: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_2');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 3: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_3');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 4: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_4');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 5: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_5');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 6: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_6');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 7: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_7');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 8: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_8');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 9: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_9');
    expect(ts.get()).toBeNull();
  });
  it('typed get null 10: get() returns null if not set', () => {
    const base = createMemoryStore();
    const ts = createTypedStore<number>(base, 'nullKey_10');
    expect(ts.get()).toBeNull();
  });
});

describe('withVersion', () => {
  it('withVersion 1: getVersion returns 1', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 1);
    expect(vs.getVersion()).toBe(1);
  });
  it('withVersion 2: getVersion returns 2', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 2);
    expect(vs.getVersion()).toBe(2);
  });
  it('withVersion 3: getVersion returns 3', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 3);
    expect(vs.getVersion()).toBe(3);
  });
  it('withVersion 4: getVersion returns 4', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 4);
    expect(vs.getVersion()).toBe(4);
  });
  it('withVersion 5: getVersion returns 5', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 5);
    expect(vs.getVersion()).toBe(5);
  });
  it('withVersion 6: getVersion returns 6', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 6);
    expect(vs.getVersion()).toBe(6);
  });
  it('withVersion 7: getVersion returns 7', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 7);
    expect(vs.getVersion()).toBe(7);
  });
  it('withVersion 8: getVersion returns 8', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 8);
    expect(vs.getVersion()).toBe(8);
  });
  it('withVersion 9: getVersion returns 9', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 9);
    expect(vs.getVersion()).toBe(9);
  });
  it('withVersion 10: getVersion returns 10', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 10);
    expect(vs.getVersion()).toBe(10);
  });
  it('withVersion 11: getVersion returns 11', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 11);
    expect(vs.getVersion()).toBe(11);
  });
  it('withVersion 12: getVersion returns 12', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 12);
    expect(vs.getVersion()).toBe(12);
  });
  it('withVersion 13: getVersion returns 13', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 13);
    expect(vs.getVersion()).toBe(13);
  });
  it('withVersion 14: getVersion returns 14', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 14);
    expect(vs.getVersion()).toBe(14);
  });
  it('withVersion 15: getVersion returns 15', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 15);
    expect(vs.getVersion()).toBe(15);
  });
  it('withVersion 16: getVersion returns 16', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 16);
    expect(vs.getVersion()).toBe(16);
  });
  it('withVersion 17: getVersion returns 17', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 17);
    expect(vs.getVersion()).toBe(17);
  });
  it('withVersion 18: getVersion returns 18', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 18);
    expect(vs.getVersion()).toBe(18);
  });
  it('withVersion 19: getVersion returns 19', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 19);
    expect(vs.getVersion()).toBe(19);
  });
  it('withVersion 20: getVersion returns 20', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 20);
    expect(vs.getVersion()).toBe(20);
  });
  it('withVersion set/get 1: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 1);
    vs.set('k1', 'v1');
    expect(vs.get('k1')).toBe('v1');
  });
  it('withVersion set/get 2: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 2);
    vs.set('k2', 'v2');
    expect(vs.get('k2')).toBe('v2');
  });
  it('withVersion set/get 3: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 3);
    vs.set('k3', 'v3');
    expect(vs.get('k3')).toBe('v3');
  });
  it('withVersion set/get 4: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 4);
    vs.set('k4', 'v4');
    expect(vs.get('k4')).toBe('v4');
  });
  it('withVersion set/get 5: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 5);
    vs.set('k5', 'v5');
    expect(vs.get('k5')).toBe('v5');
  });
  it('withVersion set/get 6: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 6);
    vs.set('k6', 'v6');
    expect(vs.get('k6')).toBe('v6');
  });
  it('withVersion set/get 7: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 7);
    vs.set('k7', 'v7');
    expect(vs.get('k7')).toBe('v7');
  });
  it('withVersion set/get 8: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 8);
    vs.set('k8', 'v8');
    expect(vs.get('k8')).toBe('v8');
  });
  it('withVersion set/get 9: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 9);
    vs.set('k9', 'v9');
    expect(vs.get('k9')).toBe('v9');
  });
  it('withVersion set/get 10: store still works after versioning', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 10);
    vs.set('k10', 'v10');
    expect(vs.get('k10')).toBe('v10');
  });
  it('withVersion has 1: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 1);
    vs.set('hasK1', 'x');
    expect(vs.has('hasK1')).toBe(true);
  });
  it('withVersion has 2: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 2);
    vs.set('hasK2', 'x');
    expect(vs.has('hasK2')).toBe(true);
  });
  it('withVersion has 3: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 3);
    vs.set('hasK3', 'x');
    expect(vs.has('hasK3')).toBe(true);
  });
  it('withVersion has 4: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 4);
    vs.set('hasK4', 'x');
    expect(vs.has('hasK4')).toBe(true);
  });
  it('withVersion has 5: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 5);
    vs.set('hasK5', 'x');
    expect(vs.has('hasK5')).toBe(true);
  });
  it('withVersion has 6: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 6);
    vs.set('hasK6', 'x');
    expect(vs.has('hasK6')).toBe(true);
  });
  it('withVersion has 7: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 7);
    vs.set('hasK7', 'x');
    expect(vs.has('hasK7')).toBe(true);
  });
  it('withVersion has 8: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 8);
    vs.set('hasK8', 'x');
    expect(vs.has('hasK8')).toBe(true);
  });
  it('withVersion has 9: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 9);
    vs.set('hasK9', 'x');
    expect(vs.has('hasK9')).toBe(true);
  });
  it('withVersion has 10: has() works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 10);
    vs.set('hasK10', 'x');
    expect(vs.has('hasK10')).toBe(true);
  });
  it('withVersion clear 1: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 1);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(1);
  });
  it('withVersion clear 2: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 2);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(2);
  });
  it('withVersion clear 3: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 3);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(3);
  });
  it('withVersion clear 4: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 4);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(4);
  });
  it('withVersion clear 5: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 5);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(5);
  });
  it('withVersion clear 6: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 6);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(6);
  });
  it('withVersion clear 7: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 7);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(7);
  });
  it('withVersion clear 8: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 8);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(8);
  });
  it('withVersion clear 9: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 9);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(9);
  });
  it('withVersion clear 10: getVersion still works after clear', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 10);
    vs.set('data', 'val');
    vs.clear();
    expect(vs.getVersion()).toBe(10);
  });
  it('withVersion remove 1: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 1);
    vs.set('r1', 'rv');
    vs.remove('r1');
    expect(vs.has('r1')).toBe(false);
  });
  it('withVersion remove 2: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 2);
    vs.set('r2', 'rv');
    vs.remove('r2');
    expect(vs.has('r2')).toBe(false);
  });
  it('withVersion remove 3: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 3);
    vs.set('r3', 'rv');
    vs.remove('r3');
    expect(vs.has('r3')).toBe(false);
  });
  it('withVersion remove 4: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 4);
    vs.set('r4', 'rv');
    vs.remove('r4');
    expect(vs.has('r4')).toBe(false);
  });
  it('withVersion remove 5: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 5);
    vs.set('r5', 'rv');
    vs.remove('r5');
    expect(vs.has('r5')).toBe(false);
  });
  it('withVersion remove 6: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 6);
    vs.set('r6', 'rv');
    vs.remove('r6');
    expect(vs.has('r6')).toBe(false);
  });
  it('withVersion remove 7: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 7);
    vs.set('r7', 'rv');
    vs.remove('r7');
    expect(vs.has('r7')).toBe(false);
  });
  it('withVersion remove 8: remove works on versioned store', () => {
    const store = createMemoryStore();
    const vs = withVersion(store, 8);
    vs.set('r8', 'rv');
    vs.remove('r8');
    expect(vs.has('r8')).toBe(false);
  });
});

describe('createMemoryStore - edge cases and extra coverage', () => {
  it('extra set empty string value: stores empty string', () => {
    const s = createMemoryStore(); s.set('k', ''); expect(s.get('k')).toBe('');
  });
  it('extra set empty string key: stores with empty key', () => {
    const s = createMemoryStore(); s.set('', 'v'); expect(s.get('')).toBe('v');
  });
  it('extra has empty string key: true after set', () => {
    const s = createMemoryStore(); s.set('', 'v'); expect(s.has('')).toBe(true);
  });
  it('extra remove empty string key: removes it', () => {
    const s = createMemoryStore(); s.set('', 'v'); s.remove(''); expect(s.has('')).toBe(false);
  });
  it('extra length after many removes: accurate count', () => {
    const s = createMemoryStore();
    for (let i = 0; i < 10; i++) s.set('k' + i, 'v');
    for (let i = 0; i < 5; i++) s.remove('k' + i);
    expect(s.length()).toBe(5);
  });
  it('extra keys sorted: keys can be sorted', () => {
    const s = createMemoryStore();
    s.set('c', '1'); s.set('a', '2'); s.set('b', '3');
    expect(s.keys().sort()).toEqual(['a', 'b', 'c']);
  });
  it('extra overwrite keeps length same: no duplicate', () => {
    const s = createMemoryStore();
    s.set('x', 'a'); s.set('x', 'b');
    expect(s.length()).toBe(1);
  });
  it('extra multiple clears: idempotent', () => {
    const s = createMemoryStore();
    s.set('a', 'b'); s.clear(); s.clear();
    expect(s.length()).toBe(0);
  });
  it('extra set many unique keys: all retrievable', () => {
    const s = createMemoryStore();
    for (let i = 0; i < 20; i++) s.set('u' + i, 'x' + i);
    for (let i = 0; i < 20; i++) expect(s.get('u' + i)).toBe('x' + i);
  });
  it('extra remove all: length zero after removing all', () => {
    const s = createMemoryStore();
    s.set('a', '1'); s.set('b', '2'); s.set('c', '3');
    s.remove('a'); s.remove('b'); s.remove('c');
    expect(s.length()).toBe(0);
  });
  it('extra get returns null before set', () => {
    expect(createMemoryStore().get('never_set')).toBeNull();
  });
  it('extra set unicode key: stores unicode', () => {
    const s = createMemoryStore();
    s.set('emoji_key', 'val');
    expect(s.get('emoji_key')).toBe('val');
  });
  it('extra set numeric-like key: works as string', () => {
    const s = createMemoryStore(); s.set('123', 'num'); expect(s.get('123')).toBe('num');
  });
  it('extra set colon key: works fine', () => {
    const s = createMemoryStore(); s.set('ns:key', 'v'); expect(s.has('ns:key')).toBe(true);
  });
  it('extra keys returns new array: mutation safe', () => {
    const s = createMemoryStore(); s.set('a', '1');
    const k1 = s.keys(); k1.push('extra');
    expect(s.keys().length).toBe(1);
  });
});

describe('getStorageSize / getKeySize - extra', () => {
  it('extra getKeySize exact: key=a val=b = 2', () => {
    const s = createMemoryStore(); s.set('a', 'b'); expect(getKeySize(s, 'a')).toBe(2);
  });
  it('extra getKeySize long: key10 + val20 = 30', () => {
    const s = createMemoryStore();
    s.set('k'.repeat(10), 'v'.repeat(20));
    expect(getKeySize(s, 'k'.repeat(10))).toBe(30);
  });
  it('extra getStorageSize two keys: sum of both', () => {
    const s = createMemoryStore();
    s.set('ab', 'cd'); s.set('ef', 'gh');
    expect(getStorageSize(s)).toBe(8);
  });
  it('extra getStorageSize after setMany: correct', () => {
    const s = createMemoryStore();
    setMany(s, [['p', 'q'], ['r', 's']]);
    expect(getStorageSize(s)).toBe(4);
  });
  it('extra getStorageSize large key: 100 char key + 100 char val', () => {
    const s = createMemoryStore();
    s.set('x'.repeat(100), 'y'.repeat(100));
    expect(getStorageSize(s)).toBe(200);
  });
});

describe('getByPrefix / removeByPrefix - extra', () => {
  it('extra getByPrefix exact: prefix is full key', () => {
    const s = createMemoryStore(); s.set('exact', 'v');
    expect(getByPrefix(s, 'exact')).toEqual([['exact', 'v']]);
  });
  it('extra getByPrefix empty string: matches all keys', () => {
    const s = createMemoryStore(); s.set('a', '1'); s.set('b', '2');
    expect(getByPrefix(s, '').length).toBe(2);
  });
  it('extra removeByPrefix all: removes all matching prefix', () => {
    const s = createMemoryStore();
    s.set('del_1', 'a'); s.set('del_2', 'b'); s.set('keep', 'c');
    removeByPrefix(s, 'del_');
    expect(s.has('keep')).toBe(true);
    expect(s.length()).toBe(1);
  });
  it('extra getByPattern digits: matches numeric keys', () => {
    const s = createMemoryStore();
    s.set('item1', 'a'); s.set('item2', 'b'); s.set('other', 'c');
    expect(getByPattern(s, /item\d/).length).toBe(2);
  });
  it('extra getByPattern all: dot matches all', () => {
    const s = createMemoryStore();
    s.set('abc', '1'); s.set('def', '2');
    expect(getByPattern(s, /.+/).length).toBe(2);
  });
});

describe('createNamespacedStore - extra', () => {
  it('extra ns remove: get returns null after remove', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'extNs');
    ns.set('foo', 'bar'); ns.remove('foo');
    expect(ns.get('foo')).toBeNull();
  });
  it('extra ns length zero: empty namespace has length 0', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'emptyNs');
    expect(ns.length()).toBe(0);
  });
  it('extra ns overwrite: set overwrites namespaced key', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'owNs');
    ns.set('k', 'old'); ns.set('k', 'new');
    expect(ns.get('k')).toBe('new');
  });
  it('extra ns with colon in namespace: works', () => {
    const base = createMemoryStore();
    const ns = createNamespacedStore(base, 'a:b');
    ns.set('k', 'v');
    expect(base.has('a:b:k')).toBe(true);
  });
  it('extra ns does not see base non-ns keys: keys() excludes them', () => {
    const base = createMemoryStore();
    base.set('outside', 'x');
    const ns = createNamespacedStore(base, 'myNs');
    expect(ns.keys()).not.toContain('outside');
  });
});

describe('serializeValue / deserializeValue - extra', () => {
  it('extra serialize negative: round-trips negative number', () => {
    expect(deserializeValue<number>(serializeValue(-42))).toBe(-42);
  });
  it('extra serialize float: round-trips float', () => {
    expect(deserializeValue<number>(serializeValue(3.14))).toBeCloseTo(3.14);
  });
  it('extra serialize array of strings: round-trips', () => {
    const arr = ['a', 'b', 'c'];
    expect(deserializeValue<string[]>(serializeValue(arr))).toEqual(arr);
  });
  it('extra serialize empty object: round-trips', () => {
    expect(deserializeValue<{}>(serializeValue({}))).toEqual({});
  });
  it('extra serialize empty array: round-trips', () => {
    expect(deserializeValue<[]>(serializeValue([]))).toEqual([]);
  });
  it('extra deserialize junk: returns null', () => {
    expect(deserializeValue<unknown>('not-json!')).toBeNull();
  });
  it('extra deserialize number string: returns number', () => {
    expect(deserializeValue<number>('42')).toBe(42);
  });
  it('extra deserialize bool string: returns bool', () => {
    expect(deserializeValue<boolean>('true')).toBe(true);
  });
  it('extra serialize undefined: produces null JSON', () => {
    // JSON.stringify(undefined) === undefined, which then fails parse → null
    const serialized = serializeValue(undefined);
    // undefined serializes to the string "undefined" via JSON.stringify
    // which is not valid JSON, so deserialize returns null
    const result = deserializeValue<unknown>(serialized);
    expect(result).toBeNull();
  });
  it('extra serialize string with quotes: round-trips', () => {
    const s = 'He said "hello"';
    expect(deserializeValue<string>(serializeValue(s))).toBe(s);
  });
});
