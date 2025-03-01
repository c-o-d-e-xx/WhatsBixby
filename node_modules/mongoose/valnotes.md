## sift where

```
      it('match prevents using $where', async function() {
        const ParentSchema = new Schema({
          name: String,
          child: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Child'
          },
          children: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Child'
          }]
        });

        const ChildSchema = new Schema({
          name: String
        });
        ChildSchema.virtual('parent', {
          ref: 'Parent',
          localField: '_id',
          foreignField: 'parent'
        });

        const Parent = db.model('Parent', ParentSchema);
        const Child = db.model('Child', ChildSchema);

        const child = await Child.create({ name: 'Luke' });
        const parent = await Parent.create({ name: 'Anakin', child: child._id });

        await assert.rejects(
          () => Parent.findOne().populate({ path: 'child', match: () => ({ $where: 'typeof console !== "undefined" ? doesNotExist("foo") : true;' }) }),
          /Cannot use \$where filter with populate\(\) match/
        );
        await assert.rejects(
          () => Parent.find().populate({ path: 'child', match: () => ({ $where: 'typeof console !== "undefined" ? doesNotExist("foo") : true;' }) }),
          /Cannot use \$where filter with populate\(\) match/
        );
        await assert.rejects(
          () => parent.populate({ path: 'child', match: () => ({ $where: 'typeof console !== "undefined" ? doesNotExist("foo") : true;' }) }),
          /Cannot use \$where filter with populate\(\) match/
        );
        await assert.rejects(
          () => Child.find().populate({ path: 'parent', match: () => ({ $where: 'typeof console !== "undefined" ? doesNotExist("foo") : true;' }) }),
          /Cannot use \$where filter with populate\(\) match/
        );
        await assert.rejects(
          () => Child.find().populate({ path: 'parent', match: () => ({ $or: [{ $where: 'typeof console !== "undefined" ? doesNotExist("foo") : true;' }] }) }),
          /Cannot use \$where filter with populate\(\) match/
        );
        await assert.rejects(
          () => Child.find().populate({ path: 'parent', match: () => ({ $and: [{ $where: 'typeof console !== "undefined" ? doesNotExist("foo") : true;' }] }) }),
          /Cannot use \$where filter with populate\(\) match/
        );

        class MyClass {}
        MyClass.prototype.$where = 'typeof console !== "undefined" ? doesNotExist("foo") : true;';
        // OK because sift only looks through own properties
        await Child.find().populate({ path: 'parent', match: () => new MyClass() });
      });
```

```
/**
 * Throw an error if there are any $where keys
 */

function throwOn$where(match) {
  if (match == null) {
    return;
  }
  if (typeof match !== 'object') {
    return;
  }
  for (const key of Object.keys(match)) {
    if (key === '$where') {
      throw new MongooseError('Cannot use $where filter with populate() match');
    }
    if (match[key] != null && typeof match[key] === 'object') {
      throwOn$where(match[key]);
    }
  }
}
```
